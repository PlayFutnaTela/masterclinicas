// API para criar perfil do usuário na tabela public.user
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usar service role para byppassar RLS
);

export async function POST(request: NextRequest) {
  try {
    const { id, email, name } = await request.json();

    if (!id || !email || !name) {
      return NextResponse.json(
        { error: 'ID, email e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Inserir na tabela public.users usando service role (bypass RLS)
    const { data, error } = await supabase
      .from('users')
      .insert({
        id,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        role: 'operador', // Role padrão para novos usuários
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error('Erro ao inserir perfil:', error);
      return NextResponse.json(
        { error: `Erro ao salvar perfil: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Erro na rota de perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
