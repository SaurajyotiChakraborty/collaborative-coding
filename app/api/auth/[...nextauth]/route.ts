import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter your email and password');
                }

                // Find user by email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                }) as any;

                if (!user || !user.password) {
                    throw new Error('Invalid email or password');
                }

                // Verify password
                const isValid = await verifyPassword(credentials.password, user.password);

                if (!isValid) {
                    throw new Error('Invalid email or password');
                }

                return {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    rating: user.rating,
                    xp: user.xp.toString(),
                    isCheater: user.isCheater,
                };
            }
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
            allowDangerousEmailAccountLinking: true,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // On initial sign in, user object is available
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.role = user.role;
                token.rating = user.rating;
                token.xp = user.xp?.toString() || '0';
                token.isCheater = user.isCheater;
            }

            // Always refresh user data from database to get latest role
            if (token.id) {
                try {
                    // Use raw query to bypass potential stale client validation issues
                    const dbUsers: any[] = await prisma.$queryRawUnsafe(
                        'SELECT username, role, rating, xp, "isCheater" FROM users WHERE id = $1',
                        token.id
                    );
                    const dbUser = dbUsers[0];
                    if (dbUser) {
                        token.username = dbUser.username;
                        token.role = dbUser.role;
                        token.rating = dbUser.rating;
                        token.xp = dbUser.xp.toString();
                        token.isCheater = dbUser.isCheater;
                    } else {
                        // User not found in database, invalidate token
                        return {} as any;
                    }
                } catch (error) {
                    console.error('Failed to refresh user data in JWT:', error);
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.username = token.username as string;
                session.user.role = token.role as any;
                session.user.rating = token.rating as number;
                session.user.xp = token.xp as string;
                session.user.isCheater = token.isCheater as boolean;
            }
            return session;
        },
        async signIn() {
            return true;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
