'use server';

import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { z } from 'zod';

const registerSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function registerUser(
    username: string,
    email: string,
    password: string
) {
    try {
        // Validate input
        const validated = registerSchema.parse({ username, email, password });

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: validated.username },
                    { email: validated.email },
                ],
            },
        });

        if (existingUser) {
            if (existingUser.username === validated.username) {
                return { success: false, error: 'Username already taken' };
            }
            return { success: false, error: 'Email already registered' };
        }

        // Hash password
        const hashedPassword = await hashPassword(validated.password);

        // Create user
        const user = await prisma.user.create({
            data: {
                username: validated.username,
                email: validated.email,
                password: hashedPassword,
                role: 'User',
            },
        });

        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        };
    } catch (error) {
        console.error('Registration error:', error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
        }
        return { success: false, error: 'Registration failed' };
    }
}

export async function checkUserExists(username: string, email: string) {
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });

        return {
            exists: !!user,
            field: user?.username === username ? 'username' : user?.email === email ? 'email' : null,
        };
    } catch (error) {
        console.error('Check user exists error:', error);
        return { exists: false, field: null };
    }
}
