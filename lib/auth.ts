import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get the current session on the server side
 * Use this in Server Components and Server Actions
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === 'Admin';
}
