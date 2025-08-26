import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { supabase, supabaseAdmin } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

export interface User {
  id: number;
  username: string;
}

export async function registerUser(username: string, password: string): Promise<User> {
  // Ensure admin client is available for reads/writes that bypass RLS
  if (!supabaseAdmin) {
    console.error('Supabase admin client is not configured. SUPABASE_SERVICE_ROLE_KEY is missing.')
    throw new Error('Supabase admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY in your environment')
  }

  // Check if username already exists (using admin client)
  const { data: existingUser, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (userError) {
    console.error('Error checking for existing user:', userError);
    throw new Error(`Error checking for existing user: ${userError.message || userError}`);
  }

  if (existingUser) {
    throw new Error('Username already exists');
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Generate user id to satisfy NOT NULL / UUID PK constraints in DB
  const userId = randomUUID();

  // Check if Supabase is configured properly
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase configuration: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    throw new Error('Supabase configuration error');
  }

  // Insert new user (using supabaseAdmin)
    const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      id: userId,
      username,
      password_hash: passwordHash,
      email: null, // Explicitly set to null for medical confidentiality
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('id, username')
    .single();
  
  if (error) {
    console.error('Registration error:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }

  // Create free subscription for new user
  try {
    await supabaseAdmin
      .from('user_subscriptions')
      .insert({
        user_id: data.id,
        plan_id: '1', // Free plan
        tier_id: 1,
        is_active: true,
        start_date: new Date().toISOString(),
        translations_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
  } catch (subscriptionError) {
    console.error('Failed to create free subscription:', subscriptionError);
    // Don't fail registration if subscription creation fails
  }
    
  return data;
}

export async function loginUser(username: string, password: string): Promise<{ user: User; token: string }> {
  // Get user
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, password_hash')
    .eq('username', username)
    .single();
    
  if (error || !user) {
    throw new Error('User not found');
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isValid) {
    throw new Error('Invalid password');
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return {
    user: { id: user.id, username: user.username },
    token
  };
}

export function verifyToken(token: string): { userId: number; username: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
  } catch (err) {
    throw new Error('Invalid token');
  }
}