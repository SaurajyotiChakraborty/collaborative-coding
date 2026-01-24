import 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            username: string;
            email: string;
            role: UserRole;
            rating: number;
            xp: string;
            isCheater: boolean;
        };
    }

    interface User {
        id: string;
        username: string;
        email: string;
        role: UserRole;
        rating: number;
        xp: string;
        isCheater: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        username: string;
        role: UserRole;
        rating: number;
        xp: string;
        isCheater: boolean;
    }
}
