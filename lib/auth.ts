import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

export interface User {
  id: number;
  username: string;
}

export async function registerUser(username: string, password: string): Promise<User> {
  // Check if username already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();
    
  if (existingUser) {
    throw new Error('Username already exists');
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  
  // Insert new user (no email required for medical confidentiality)
  const { data, error } = await supabase
    .from('users')
    .insert({
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
    throw new Error('Failed to create user');
  }

  // Create free subscription for new user
  try {
    await supabase
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