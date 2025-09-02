
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";

export const credentialsProvider = CredentialsProvider({
    name: "Credentials",
    credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
            where: { email: credentials.email },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email };
    },
});