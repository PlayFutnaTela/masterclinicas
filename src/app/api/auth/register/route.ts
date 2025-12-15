// API Route para registro de novos usuários
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        // Validações básicas
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Nome, email e senha são obrigatórios" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "A senha deve ter pelo menos 6 caracteres" },
                { status: 400 }
            );
        }

        // Verificar se o email já existe
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Este email já está cadastrado" },
                { status: 400 }
            );
        }

        // Hash da senha
        const hashedPassword = await hash(password, 12);

        // Criar usuário com role padrão "operador"
        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role: "operador", // Role padrão para novos usuários
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                message: "Usuário criado com sucesso",
                user,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("[API REGISTER] Erro:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}