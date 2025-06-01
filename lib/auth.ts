import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getConnection } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

export interface User {
  id: number;
  username: string;
}

export async function registerUser(username: string, password: string): Promise<User> {
  const pool = await getConnection();
  
  // Check if username already exists
  const userCheck = await pool
    .request()
    .input('username', username)
    .query('SELECT id FROM users WHERE username = @username');
    
  if (userCheck.recordset.length > 0) {
    throw new Error('Username already exists');
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  
  // Insert new user
  const result = await pool
    .request()
    .input('username', username)
    .input('password_hash', passwordHash)
    .query(`
      INSERT INTO users (username, password_hash)
      OUTPUT INSERTED.id, INSERTED.username
      VALUES (@username, @password_hash)
    `);
    
  return result.recordset[0];
}

export async function loginUser(username: string, password: string): Promise<{ user: User; token: string }> {
  const pool = await getConnection();
  
  // Get user
  const result = await pool
    .request()
    .input('username', username)
    .query('SELECT id, username, password_hash FROM users WHERE username = @username');
    
  const user = result.recordset[0];
  
  if (!user) {
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