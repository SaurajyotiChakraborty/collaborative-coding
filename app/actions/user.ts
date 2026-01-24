'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function registerUser(username: string, email: string) {
    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        })

        if (existingUser) {
            return { success: true, user: existingUser }
        }

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                role: 'User',
            }
        })

        revalidatePath('/')
        return { success: true, user: newUser }
    } catch (error) {
        console.error('Failed to register user:', error)
        return { success: false, error: 'Failed to register user' }
    }
}

export async function getUser(username: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                achievements: true, // If achievements was a relation, but it's string[]
            }
        })
        return { success: true, user }
    } catch (error) {
        return { success: false, error: 'User not found' }
    }
}
