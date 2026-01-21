# Claude Instance Sync & Shared Memory Setup

**Problem:** Claude Code (CLI) and Claude IDE extension are separate instances that don't share memory or context.

**Solution:** Create a shared memory system using MCP servers that both instances can access.

---

## Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│  Claude Code (CLI)  │         │  Claude IDE          │
│  (Terminal/WSL)     │         │  (Antigravity/VSCode)│
└──────────┬──────────┘         └──────────┬───────────┘
           │                               │
           │    Both access same MCP       │
           │    servers and memory store   │
           └───────────┬───────────────────┘
                       │
           ┌───────────▼───────────────────┐
           │     Shared MCP Servers        │
           ├───────────────────────────────┤
           │  • Sanity CMS                 │
           │  • Filesystem MCP             │
           │  • Memory Store MCP           │
           │  • Gemini API                 │
           └───────────────────────────────┘
```

---

## Configuration Strategy

### Option 1: Shared MCP Config File (Recommended)

Both Claude instances can use the SAME configuration file if you set it up correctly.

**Create shared config location:**
```bash
# Create MCP config directory
mkdir -p ~/.config/claude

# This file will be used by BOTH Claude Code and Claude IDE
nano ~/.config/claude/claude_desktop_config.json
```

**Unified MCP Configuration:**
```json
{
  "mcpServers": {
    "sanity": {
      "command": "npx",
      "args": ["-y", "@sanity/mcp-server"],
      "env": {
        "SANITY_PROJECT_ID": "${SANITY_PROJECT_ID}",
        "SANITY_DATASET": "${SANITY_DATASET}",
        "SANITY_API_TOKEN": "${SANITY_API_TOKEN}"
      }
    },
    "gemini": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-gemini"],
      "env": {
        "GOOGLE_API_KEY": "${GOOGLE_API_KEY}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "env": {
        "ALLOWED_DIRECTORIES": "/home/user/shared-memory,/home/user/laymen-terms"
      }
    },
    "memory-store": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "env": {
        "MEMORY_STORE_PATH": "/home/user/.claude-shared-memory"
      }
    }
  }
}
```

---

## Shared Memory Implementation

### Method 1: File-Based Memory Store

**Create a shared directory both Claudes can access:**

```bash
# Create shared memory directory
mkdir -p ~/shared-memory
chmod 755 ~/shared-memory

# Create memory files
touch ~/shared-memory/project-context.md
touch ~/shared-memory/current-tasks.md
touch ~/shared-memory/decisions-log.md
```

**Memory Store Structure:**
```
~/shared-memory/
├── project-context.md        # Current project state
├── current-tasks.md          # Active tasks and TODOs
├── decisions-log.md          # Important decisions made
├── code-snippets/            # Reusable code
├── prompts/                  # Saved prompts
└── session-notes/            # Session-specific notes
    ├── 2026-01-21-cli.md
    └── 2026-01-21-ide.md
```

**Template for project-context.md:**
```markdown
# Shared Project Context
Last Updated: [timestamp]
Updated By: [Claude Code | Claude IDE]

## Current Project: laymen-terms

### Active Work
- [ ] Fix Stripe webhook configuration
- [ ] Update Groq API key
- [ ] Remove debug code from production

### Recent Changes
- 2026-01-21 10:00 - [Claude Code] Created PROJECT_OVERVIEW.md
- 2026-01-21 10:15 - [Claude Code] Created WSL_DEV_SETUP.md

### Important Context
- Stripe is NOT configured properly
- Groq API key needs replacement
- User prefers Next.js + Supabase + Sanity stack

### Environment
- Node.js v22.21.1
- Sanity CLI v5.5.0 installed
- Working in WSL environment

### Next Steps
1. Install Miniconda (in progress)
2. Install Stripe CLI
3. Configure MCP servers
```

---

### Method 2: Sanity CMS as Shared Memory

Use Sanity itself as the shared memory store between both Claude instances.

**Create a Sanity schema for Claude memory:**

```javascript
// sanity/schemas/claude-memory.js
export default {
  name: 'claudeMemory',
  title: 'Claude Shared Memory',
  type: 'document',
  fields: [
    {
      name: 'key',
      title: 'Memory Key',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'value',
      title: 'Memory Value',
      type: 'text'
    },
    {
      name: 'instance',
      title: 'Created By Instance',
      type: 'string',
      options: {
        list: [
          {title: 'Claude Code CLI', value: 'cli'},
          {title: 'Claude IDE', value: 'ide'}
        ]
      }
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          'project-context',
          'task',
          'decision',
          'code-snippet',
          'configuration',
          'note'
        ]
      }
    },
    {
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime'
    }
  ]
}
```

**Workflow:**
1. Claude Code stores memory: "Remember: Stripe webhook secret is in 1Password"
2. Writes to Sanity CMS via MCP
3. Claude IDE reads from Sanity: "What did we decide about Stripe?"
4. Retrieves from Sanity via MCP

---

### Method 3: Database-Based Memory (Supabase)

Since you already use Supabase, create a memory table:

```sql
-- Create claude_memory table in Supabase
CREATE TABLE claude_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_key TEXT UNIQUE NOT NULL,
  memory_value TEXT,
  instance TEXT CHECK (instance IN ('cli', 'ide')),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_memory_key ON claude_memory(memory_key);
CREATE INDEX idx_category ON claude_memory(category);

-- Enable RLS (if needed)
ALTER TABLE claude_memory ENABLE ROW LEVEL SECURITY;

-- Allow all access (since this is for Claude instances)
CREATE POLICY "Allow all access" ON claude_memory
  FOR ALL USING (true);
```

**Create a simple MCP server for Supabase memory:**

```bash
# Create memory MCP server
mkdir -p ~/mcp-servers/supabase-memory
cd ~/mcp-servers/supabase-memory
npm init -y
npm install @supabase/supabase-js
```

**server.js:**
```javascript
#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simple MCP server that stores/retrieves memory
async function storeMemory(key, value, instance) {
  const { data, error } = await supabase
    .from('claude_memory')
    .upsert({
      memory_key: key,
      memory_value: value,
      instance: instance,
      updated_at: new Date().toISOString()
    }, { onConflict: 'memory_key' });

  return error ? { error: error.message } : { success: true };
}

async function getMemory(key) {
  const { data, error } = await supabase
    .from('claude_memory')
    .select('*')
    .eq('memory_key', key)
    .single();

  return error ? null : data;
}

async function getAllMemories() {
  const { data, error } = await supabase
    .from('claude_memory')
    .select('*')
    .order('updated_at', { ascending: false });

  return error ? [] : data;
}

// Export functions for MCP
module.exports = { storeMemory, getMemory, getAllMemories };
```

---

## Workflow Examples

### Workflow 1: Task Handoff

**Claude Code (Terminal):**
```
User: "Start refactoring the auth system"
Claude Code: "I'll store this task to shared memory"
[Writes to ~/shared-memory/current-tasks.md]
- Refactoring auth system
- Status: In progress by Claude Code
- Context: Migrating from localStorage to HTTP-only cookies
```

**Claude IDE:**
```
User: "What am I working on?"
Claude IDE: [Reads ~/shared-memory/current-tasks.md via filesystem MCP]
"You're refactoring the auth system. Claude Code started migrating
from localStorage to HTTP-only cookies."
```

---

### Workflow 2: Decision Tracking

**Claude IDE:**
```
User: "We should use React Query instead of SWR"
Claude IDE: [Writes to Sanity CMS via MCP]
Document: "Decision: Use React Query"
Reason: "Better TypeScript support and more features"
Date: 2026-01-21
Instance: IDE
```

**Claude Code:**
```
User: "Why are we using React Query?"
Claude Code: [Reads from Sanity CMS via MCP]
"Decision was made on 2026-01-21: Use React Query for better
TypeScript support and more features."
```

---

### Workflow 3: Code Snippet Sharing

**Claude Code generates a utility function:**
```typescript
// Claude Code stores to shared memory
async function storeToMemory() {
  // Write to ~/shared-memory/code-snippets/auth-utils.ts
  const code = `
export function createSecureCookie(value: string) {
  // Implementation
}
  `;
}
```

**Claude IDE can retrieve and use it:**
```
User: "Use that auth utility we created"
Claude IDE: [Reads ~/shared-memory/code-snippets/auth-utils.ts]
"Found the createSecureCookie function. Applying it..."
```

---

## Installation Instructions

### Install Filesystem MCP Server
```bash
npm install -g @modelcontextprotocol/server-filesystem
```

### Install Memory MCP Server
```bash
npm install -g @modelcontextprotocol/server-memory
```

### Test Shared Configuration
```bash
# Test if MCP config is readable by both
cat ~/.config/claude/claude_desktop_config.json

# Ensure environment variables are loaded
source ~/.dev_env

# Test Sanity MCP
npx @sanity/mcp-server --help
```

---

## Usage Instructions

### For Claude Code (CLI)

**To store memory:**
```
"Remember this: We're using Stripe webhook secret whsec_xyz123"
[I'll store this to shared memory]
```

**To check what IDE Claude knows:**
```
"What context does the IDE instance have?"
[I'll read the shared memory files]
```

### For Claude IDE

**To store memory:**
```
"Store to shared memory: Database migration completed successfully"
```

**To check what CLI Claude did:**
```
"What did Claude Code work on today?"
[Reads session notes from shared memory]
```

---

## Best Practices

1. **Always Update Context After Major Work:**
   - Both instances should write to `project-context.md` after completing tasks

2. **Use Descriptive Keys:**
   - Bad: "info1", "data"
   - Good: "stripe-webhook-secret", "auth-refactor-status"

3. **Include Timestamps:**
   - Always note when information was added
   - Include which instance added it

4. **Regular Sync Checks:**
   - Start each session by reading shared memory
   - End each session by updating shared memory

5. **Categories for Organization:**
   - project-context
   - tasks
   - decisions
   - code-snippets
   - configurations
   - notes

---

## Testing the Setup

**Test 1: File-based memory**
```bash
# From Claude Code
echo "Test from CLI: $(date)" >> ~/shared-memory/test.txt

# From Claude IDE
cat ~/shared-memory/test.txt
# Should see the message from CLI
```

**Test 2: Sanity-based memory**
```bash
# Both instances should be able to read/write to same Sanity project
npx @sanity/mcp-server --project-id your-id --dataset production
```

**Test 3: Cross-instance communication**
1. Claude Code writes a task to shared memory
2. Claude IDE reads and continues the task
3. Claude IDE updates status
4. Claude Code checks status

---

## Troubleshooting

**Issue: MCP config not found**
```bash
# Check config location
ls -la ~/.config/claude/

# Ensure both instances use same config path
# Set environment variable if needed
export CLAUDE_CONFIG_PATH=~/.config/claude
```

**Issue: Permission denied on shared files**
```bash
chmod -R 755 ~/shared-memory
```

**Issue: Environment variables not loading**
```bash
# Add to both .bashrc and IDE config
echo 'source ~/.dev_env' >> ~/.bashrc
```

---

## Summary

✅ **You were right to ask!** They ARE different Claude instances.

✅ **Solution:** Configure shared MCP servers and create a shared memory system.

✅ **Recommended Setup:**
1. One unified MCP config file at `~/.config/claude/claude_desktop_config.json`
2. Shared memory directory at `~/shared-memory/`
3. Use Sanity CMS as the primary shared knowledge base
4. Both instances read/write to same files/database

This way, both Claude instances can stay in sync! 🎯
