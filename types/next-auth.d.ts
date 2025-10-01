/**
 * Type Definitions: NextAuth
 * Extensão dos tipos do NextAuth
 */

import type { UserRole } from '@/models';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            role: UserRole;
            avatar?: string;
            image?: string;
        };
    }

    interface User {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        avatar?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: UserRole;
        avatar?: string;
    }
}
