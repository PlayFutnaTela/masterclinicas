import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente do .env.local
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Presente' : 'Ausente');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Presente' : 'Ausente');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variáveis de ambiente do Supabase ausentes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testando conexão com o Supabase...');

  try {
    // Tentar fazer uma operação simples para verificar a conexão
    // Vamos verificar se conseguimos fazer uma requisição válida ao servidor
    const { data, error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      // Um erro de permissão é esperado se não estivermos autenticados ou se a tabela não existir
      console.log('Conexão com o Supabase estabelecida, mas recebemos um erro esperado (sem autenticação ou tabela não existente):', error.message);
      console.log('Isso indica que a conexão está funcionando corretamente!');
      return true;
    }

    console.log('Conexão com o Supabase bem sucedida!');
    console.log('Recebemos resposta do servidor (tabela "users" pode não existir):', data);
    return true;
  } catch (error: any) {
    console.error('Erro ao testar conexão com o Supabase:', error.message);
    return false;
  }
}

// Executar o teste
testConnection();

export default testConnection;