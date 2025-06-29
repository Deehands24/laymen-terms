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
  
  // Insert new user
  const { data, error } = await supabase
    .from('users')
    .insert({
      username,
      password_hash: passwordHash
    })
    .select('id, username')
    .single();
    
  if (error) {
    throw new Error('Failed to create user');
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