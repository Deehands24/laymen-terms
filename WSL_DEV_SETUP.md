# WSL Development Environment Setup Guide

**Environment:** Windows Subsystem for Linux (WSL)
**Target Stack:** Next.js + Supabase + Sanity CMS + Stripe
**Last Updated:** 2026-01-21

---

## Current Installation Status

### ✅ Already Installed
- **Node.js:** v22.21.1
- **npm:** v10.9.4
- **Git:** v2.43.0
- **Python:** v3.11.14
- **Sanity CLI:** v5.5.0

### 🔄 Needs Installation
- Miniconda (Python environment manager)
- Stripe CLI (payment testing)
- Sanity MCP Server (AI integration)
- Gemini MCP Server (Google Antigravity IDE integration)

---

## Installation Instructions

### 1. Miniconda Installation

**Option A: Direct Download (Recommended)**
```bash
# Download Miniconda installer
cd /tmp
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O miniconda.sh

# Install Miniconda (silent mode, no prompt)
bash miniconda.sh -b -p $HOME/miniconda3

# Initialize conda for your shell
~/miniconda3/bin/conda init bash

# Restart shell or source bashrc
source ~/.bashrc

# Verify installation
conda --version
```

**Option B: Using curl (if wget fails)**
```bash
curl -O https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh -b -p $HOME/miniconda3
~/miniconda3/bin/conda init bash
source ~/.bashrc
```

**Post-Installation Configuration:**
```bash
# Disable auto-activation of base environment (optional)
conda config --set auto_activate_base false

# Create a default environment for your projects
conda create -n dev python=3.11
conda activate dev
```

---

### 2. Stripe CLI Installation

**Option A: Using Package Manager (Recommended for WSL)**
```bash
# Add Stripe's GPG key and repository
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | sudo gpg --dearmor -o /usr/share/keyrings/stripe-archive-keyring.gpg

# Add Stripe repository
echo "deb [signed-by=/usr/share/keyrings/stripe-archive-keyring.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee /etc/apt/sources.list.d/stripe.list

# Update and install
sudo apt update
sudo apt install stripe

# Verify installation
stripe --version
```

**Option B: Manual Binary Installation**
```bash
# Download latest release
cd /tmp
wget https://github.com/stripe/stripe-cli/releases/download/v1.34.0/stripe_linux_x86_64.tar.gz

# Extract and move to PATH
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/

# Verify installation
stripe --version
```

**Option C: Using Snap (Alternative)**
```bash
sudo snap install stripe
```

**Authenticate Stripe CLI:**
```bash
# Login to your Stripe account
stripe login

# This will open a browser to authenticate
# After auth, you'll receive an API key for the CLI
```

**Test Webhook Forwarding:**
```bash
# Forward webhooks to local development server
stripe listen --forward-to localhost:3000/api/stripe-webhook

# In another terminal, trigger test events
stripe trigger payment_intent.succeeded
```

---

### 3. Sanity CLI Configuration

**Already Installed:** ✅ @sanity/cli v5.5.0

**Login to Sanity:**
```bash
# Authenticate with your Sanity account
sanity login

# This opens browser for authentication
```

**Initialize New Sanity Project (Example):**
```bash
# Create new Sanity project
sanity init

# Or add Sanity to existing Next.js project
cd your-nextjs-project
npm install @sanity/client @sanity/image-url
npm install -D @sanity/vision @sanity/cli
```

**Common Sanity Commands:**
```bash
# Start Sanity Studio locally
sanity dev

# Deploy Sanity Studio
sanity deploy

# Manage projects
sanity projects list

# Generate TypeScript types from schema
sanity typegen generate
```

---

### 4. Sanity MCP Server Setup

**What is MCP?**
Model Context Protocol allows AI assistants (like Claude) to interact with external services like Sanity CMS.

**Installation:**
```bash
# Sanity CLI v5.5.0+ includes MCP support natively
# Check if MCP command is available
sanity mcp --help
```

**Configure Sanity MCP Server:**

**Option A: Using Sanity CLI (Built-in)**
```bash
# The Sanity CLI v5.5.0+ has built-in MCP support
# Configure MCP server for your project
sanity mcp configure

# This creates MCP configuration in your project
```

**Option B: Manual MCP Configuration**

Create or edit `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sanity": {
      "command": "npx",
      "args": ["-y", "@sanity/mcp-server"],
      "env": {
        "SANITY_PROJECT_ID": "your-project-id",
        "SANITY_DATASET": "production",
        "SANITY_API_TOKEN": "your-read-token"
      }
    }
  }
}
```

**Get Sanity Credentials:**
```bash
# Get your project ID
sanity projects list

# Create API token
# Go to: https://www.sanity.io/manage
# Select your project → API → Tokens → Add API token
# Give it "Viewer" or "Editor" permissions
```

**Test Sanity MCP Server:**
```bash
# After configuration, restart your AI editor (Claude/Antigravity)
# You should see Sanity available as an MCP server
```

---

### 5. Gemini MCP Server Setup (Google Antigravity IDE)

**Installation:**

**Option A: Install from npm**
```bash
# Install Google Gemini MCP server globally
npm install -g @modelcontextprotocol/server-google-gemini

# Or install locally in project
npm install @modelcontextprotocol/server-google-gemini
```

**Option B: Install via npx (no global install)**
```bash
# Test run first
npx @modelcontextprotocol/server-google-gemini --version
```

**Get Gemini API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key
3. Copy the key

**Configure Gemini MCP Server:**

Create or edit `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sanity": {
      "command": "npx",
      "args": ["-y", "@sanity/mcp-server"],
      "env": {
        "SANITY_PROJECT_ID": "your-project-id",
        "SANITY_DATASET": "production",
        "SANITY_API_TOKEN": "your-read-token"
      }
    },
    "gemini": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-gemini"],
      "env": {
        "GOOGLE_API_KEY": "your-gemini-api-key"
      }
    }
  }
}
```

**For Google Antigravity IDE:**

If Antigravity uses a different config location, create `.mcp_config.json` in your home directory or project root:

```json
{
  "servers": {
    "sanity": {
      "command": "npx",
      "args": ["-y", "@sanity/mcp-server"],
      "env": {
        "SANITY_PROJECT_ID": "your-project-id",
        "SANITY_DATASET": "production",
        "SANITY_API_TOKEN": "your-token"
      }
    },
    "gemini": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-gemini"],
      "env": {
        "GOOGLE_API_KEY": "your-api-key"
      }
    }
  }
}
```

**Test Gemini MCP Server:**
```bash
# Test the Gemini API connection
npx @modelcontextprotocol/server-google-gemini test

# Or create a test script
cat > test-gemini.js << 'EOF'
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function test() {
  const result = await model.generateContent("Hello!");
  console.log(result.response.text());
}
test();
EOF

node test-gemini.js
```

---

## Environment Variables Setup

Create a global environment file for your development credentials:

**Create `~/.dev_env`:**
```bash
# Supabase
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Sanity
export SANITY_PROJECT_ID="your-project-id"
export SANITY_DATASET="production"
export SANITY_API_TOKEN="your-token"
export NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
export NEXT_PUBLIC_SANITY_DATASET="production"

# Stripe
export STRIPE_SECRET_KEY="sk_test_..."
export STRIPE_WEBHOOK_SECRET="whsec_..."
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Google Gemini
export GOOGLE_API_KEY="your-gemini-api-key"

# Groq AI (for medical translator)
export GROQ_API_KEY="gsk_your_groq_key"

# JWT
export JWT_SECRET="your-jwt-secret"
```

**Add to `.bashrc` or `.zshrc`:**
```bash
echo 'source ~/.dev_env' >> ~/.bashrc
source ~/.bashrc
```

**For Project-Specific Variables:**
Create `.env.local` in each Next.js project:
```bash
# Copy from template
cp .env.example .env.local

# Or source from global
source ~/.dev_env
```

---

## Typical Next.js + Supabase + Sanity Project Setup

**1. Create New Next.js Project:**
```bash
# Create Next.js app
npx create-next-app@latest my-project --typescript --tailwind --app

cd my-project
```

**2. Install Dependencies:**
```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Sanity
npm install @sanity/client @sanity/image-url next-sanity
npm install -D @sanity/vision

# Stripe
npm install stripe @stripe/stripe-js

# UI Libraries (optional but common)
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react

# Forms
npm install react-hook-form zod @hookform/resolvers
```

**3. Initialize Sanity Studio:**
```bash
# Create Sanity studio folder
mkdir -p sanity
cd sanity

# Initialize Sanity
sanity init --project <your-project-id> --dataset production

# Or create standalone studio
cd ..
mkdir cms
cd cms
sanity init
```

**4. Project Structure:**
```
my-project/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/               # API routes
│       ├── auth/
│       └── webhooks/
├── components/            # React components
├── lib/                   # Utilities
│   ├── supabase.ts       # Supabase client
│   ├── sanity.ts         # Sanity client
│   └── stripe.ts         # Stripe client
├── sanity/               # Sanity Studio
│   ├── schemas/          # Content schemas
│   ├── sanity.config.ts
│   └── structure.ts
├── public/
├── .env.local            # Environment variables
└── package.json
```

**5. Run Development Servers:**
```bash
# Terminal 1: Next.js app
npm run dev

# Terminal 2: Sanity Studio (if embedded)
cd sanity
npm run dev

# Terminal 3: Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Quick Reference Commands

### Node & npm
```bash
node --version              # Check Node version
npm --version               # Check npm version
npm install -g npm@latest   # Update npm
nvm install --lts           # Install latest LTS Node (if using nvm)
```

### Git
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git config --list           # View git config
```

### Python & Conda
```bash
conda --version             # Check conda version
conda env list              # List environments
conda activate env-name     # Activate environment
conda deactivate            # Deactivate environment
conda install package-name  # Install package
pip install package-name    # Install via pip in conda env
```

### Sanity
```bash
sanity login                # Login to Sanity
sanity projects list        # List projects
sanity init                 # Initialize new project
sanity dev                  # Start Studio locally
sanity deploy               # Deploy Studio
sanity manage               # Open project management
sanity docs                 # Search documentation
```

### Stripe
```bash
stripe login                # Authenticate CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded  # Test webhook
stripe logs tail            # View recent events
stripe customers list       # List customers
stripe subscriptions list   # List subscriptions
```

### Supabase (using CLI - optional)
```bash
npm install -g supabase     # Install Supabase CLI
supabase login              # Authenticate
supabase init               # Initialize project
supabase start              # Start local instance
supabase db push            # Push migrations
```

---

## Troubleshooting

### Issue: Command not found after installation
**Solution:**
```bash
# Reload shell configuration
source ~/.bashrc
# or
exec bash

# Check PATH
echo $PATH

# Add to PATH if needed (add to ~/.bashrc)
export PATH="$HOME/miniconda3/bin:$PATH"
export PATH="$HOME/.local/bin:$PATH"
```

### Issue: Permission denied when installing global npm packages
**Solution:**
```bash
# Option A: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Option B: Use nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
```

### Issue: Stripe webhook not receiving events
**Solution:**
```bash
# Ensure stripe listen is running
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Check if your dev server is running
curl http://localhost:3000/api/webhooks/stripe

# Verify webhook secret in .env.local
echo $STRIPE_WEBHOOK_SECRET
```

### Issue: Sanity Studio not loading
**Solution:**
```bash
# Clear cache and reinstall
cd sanity
rm -rf node_modules .sanity
npm install

# Verify sanity.config.ts has correct projectId and dataset
cat sanity.config.ts
```

### Issue: MCP Server not connecting
**Solution:**
```bash
# Check MCP config file location
cat ~/.config/claude/claude_desktop_config.json

# Verify environment variables are set
echo $SANITY_PROJECT_ID
echo $GOOGLE_API_KEY

# Test MCP server manually
npx @sanity/mcp-server --project-id your-id --dataset production

# Restart your AI editor/IDE completely
```

### Issue: WSL network/connectivity issues
**Solution:**
```bash
# Reset WSL networking
# In Windows PowerShell (as Admin):
# wsl --shutdown
# Then restart WSL

# Or in WSL, try:
sudo service networking restart

# Check DNS
cat /etc/resolv.conf

# If needed, manually set DNS (add to /etc/wsl.conf)
sudo tee -a /etc/wsl.conf << EOF
[network]
generateResolvConf = false
EOF

# Then set DNS in /etc/resolv.conf
sudo tee /etc/resolv.conf << EOF
nameserver 8.8.8.8
nameserver 8.8.4.4
EOF
```

---

## VS Code Integration (Optional)

If using VS Code with WSL:

**Install Extensions:**
```bash
# WSL extension (install from Windows VS Code)
# Remote - WSL (ms-vscode-remote.remote-wsl)

# Useful extensions for your stack:
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-python.python
code --install-extension stripe.vscode-stripe
```

**VS Code Settings for MCP:**
Create `.vscode/settings.json` in your project:
```json
{
  "mcp.servers": {
    "sanity": {
      "command": "npx",
      "args": ["-y", "@sanity/mcp-server"],
      "env": {
        "SANITY_PROJECT_ID": "${env:SANITY_PROJECT_ID}",
        "SANITY_DATASET": "${env:SANITY_DATASET}",
        "SANITY_API_TOKEN": "${env:SANITY_API_TOKEN}"
      }
    }
  }
}
```

---

## Maintenance & Updates

**Keep Tools Updated:**
```bash
# Update npm
npm install -g npm@latest

# Update Node.js (if using nvm)
nvm install --lts
nvm use --lts

# Update global npm packages
npm update -g

# Update Sanity CLI
npm update -g @sanity/cli

# Update Stripe CLI
# apt-based:
sudo apt update && sudo apt upgrade stripe

# Check for outdated packages in project
npm outdated

# Update project dependencies
npm update
```

**Monthly Checklist:**
- [ ] Update Node.js to latest LTS
- [ ] Update global npm packages
- [ ] Update Sanity CLI
- [ ] Update Stripe CLI
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Update project dependencies: `npm update`
- [ ] Review and update environment variables

---

## Additional Resources

**Documentation:**
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Sanity: https://www.sanity.io/docs
- Stripe: https://stripe.com/docs
- MCP Protocol: https://modelcontextprotocol.io

**Useful Tools:**
- Postman/Insomnia (API testing)
- Supabase Studio (database GUI)
- Stripe Dashboard (payment monitoring)
- Sanity Vision (GROQ query testing)

**Learning Resources:**
- Next.js Learn: https://nextjs.org/learn
- Sanity Learn: https://www.sanity.io/learn
- Stripe Samples: https://github.com/stripe-samples

---

**Last Updated:** 2026-01-21
**Maintained By:** Development Team
