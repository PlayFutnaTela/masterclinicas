// Tipos personalizados para NextAuth
import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            clinicName: string;
            role: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        clinicName?: string;
        role?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        clinicName?: string;
        role?: string;
    }
}
