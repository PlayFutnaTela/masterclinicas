// Página principal da PLATAFORMA MasterClínicas
import Link from "next/link";
import {
  Phone,
  MapPin,
  Clock
} from "lucide-react";

const features = [
  {
    title: "Geração e gestão de leads",
    desc: "Receba leads de múltiplas fontes, qualifique e converta mais rápido.",
    icon: "Users",
  },
  {
    title: "Agendamentos inteligentes",
    desc: "Calendário integrado com notificações e confirmação automática.",
    icon: "Calendar",
  },
  {
    title: "Métricas e relatórios",
    desc: "Dashboards em tempo real para você tomar decisões embasadas.",
    icon: "BarChart2",
  },
  {
    title: "Integrações (WhatsApp, n8n)",
    desc: "Conecte seus fluxos e automações com facilidade.",
    icon: "Zap",
  },
  {
    title: "Multi-clínica & Permissões",
    desc: "Suporte multi-tenant com controle de papéis e isolamento de dados.",
    icon: "ShieldCheck",
  },
  {
    title: "Segurança & Conformidade",
    desc: "Dados seguros e políticas que respeitam privacidade e boas práticas.",
    icon: "PieChart",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                <img src="/logo2-masterclinicas.png" alt="MasterClínicas" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-[#ee224a]">MasterClínicas</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-black">
                Entrar
              </Link>
              <a
                href="https://wa.me/5511994299814?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20como%20transformar%20minha%20clicnica%20por%20favor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Saiba Mais
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero with background image and overlay (adapted) */}
      <header className="relative pt-32 pb-48 lg:pt-48 lg:pb-64 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Clinic background"
            className="w-full h-full object-cover"
            src="https://i.postimg.cc/ZnsJpRXK/hero1.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/70 to-gray-900/90 mix-blend-multiply"></div>
          <div className="absolute inset-0 mix-blend-overlay" style={{ backgroundColor: 'rgba(194,69,100,0.08)' }}></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Mais agendamentos. Menos esforço operacional.
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed opacity-90">
            O MasterClínicas transforma contatos em atendimentos confirmados, centralizando leads, agenda e métricas para acelerar o crescimento da sua clínica com eficiência.
          </p>
        </div>
      </header>

      {/* Feature cards (grid like provided) */}
      <section id="features" className="relative z-20 -mt-32 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto bg-white dark:bg-surface-dark rounded-3xl shadow-soft p-6 md:p-10 border" style={{ borderColor: 'var(--primary-dark)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center group-hover:shadow-lg group-hover:-translate-y-1 transition-all" style={{ backgroundColor: 'rgba(194,69,100,0.12)' }}>
                <img src="/assets/People/SVG/ic_fluent_people_48_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#ee224a] mb-2">Qualificação de leads</h3>
              <p className="text-gray-800 dark:text-text-muted-dark leading-relaxed">Tudo o que sua clínica precisa para organizar, qualificar e expandir sua operação com eficiência.</p>
            </div>

            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center group-hover:shadow-lg group-hover:-translate-y-1 transition-all" style={{ backgroundColor: 'rgba(194,69,100,0.12)' }}>
                <img src="/assets/Calendar/SVG/ic_fluent_calendar_48_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#ee224a] mb-2">Agendamentos e automações</h3>
              <p className="text-gray-800 dark:text-text-muted-dark leading-relaxed">Conecte agendamentos, lembretes e confirmações automáticas.</p>
            </div>

            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center group-hover:shadow-lg group-hover:-translate-y-1 transition-all" style={{ backgroundColor: 'rgba(194,69,100,0.12)' }}>
                <img src="/assets/Gauge/SVG/ic_fluent_gauge_32_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#ee224a] mb-2">Automações e métricas</h3>
              <p className="text-gray-800 dark:text-text-muted-dark leading-relaxed">Integre dados e painéis para medir a performance real da clínica.</p>
            </div>

            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center group-hover:shadow-lg group-hover:-translate-y-1 transition-all" style={{ backgroundColor: 'rgba(194,69,100,0.12)' }}>
                <img src="/assets/Checkbox/SVG/ic_fluent_checkbox_24_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#ee224a] mb-2">Confirmações personalizadas</h3>
              <p className="text-gray-800 dark:text-text-muted-dark leading-relaxed">Comunicações customizadas para diminuir faltas e aumentar conversões.</p>
            </div>

            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center group-hover:shadow-lg group-hover:-translate-y-1 transition-all" style={{ backgroundColor: 'rgba(194,69,100,0.12)' }}>
                <img src="/assets/Code/SVG/ic_fluent_code_24_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#ee224a] mb-2">Orquestração de fluxos</h3>
              <p className="text-gray-800 dark:text-text-muted-dark leading-relaxed">Gerencie triggers, webhooks e integrações em um só painel.</p>
            </div>

            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center group-hover:shadow-lg group-hover:-translate-y-1 transition-all" style={{ backgroundColor: 'rgba(194,69,100,0.12)' }}>
                <img src="/assets/Shifts/SVG/ic_fluent_shifts_32_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#ee224a] mb-2">Sincronizações</h3>
              <p className="text-gray-800 dark:text-text-muted-dark leading-relaxed">Conecte seus sistemas e mantenha dados consistentes em tempo real.</p>
            </div>

            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center group-hover:shadow-lg group-hover:-translate-y-1 transition-all" style={{ backgroundColor: 'rgba(194,69,100,0.12)' }}>
                <img src="/assets/Link/SVG/ic_fluent_link_32_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#ee224a] mb-2">Percursos e jornadas</h3>
              <p className="text-gray-800 dark:text-text-muted-dark leading-relaxed">Defina fluxos e jornadas dos seus pacientes desde o primeiro contato.</p>
            </div>

            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center group-hover:shadow-lg group-hover:-translate-y-1 transition-all" style={{ backgroundColor: 'rgba(194,69,100,0.12)' }}>
                <img src="/assets/Receipt/SVG/ic_fluent_receipt_32_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#ee224a] mb-2">Faturamento e pagamentos</h3>
              <p className="text-gray-800 dark:text-text-muted-dark leading-relaxed">Controle cobranças, pacotes e relatórios financeiros com facilidade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - richer visual */}
      <section className="py-24 bg-[#FAF7F2] dark:bg-surface-dark transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#ee224a] mb-4">Como funciona</h2>
            <div className="w-16 h-1 bg-[var(--primary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            <div className="flex flex-col items-center text-center group">
              <div className="w-full aspect-[4/3] bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-8 overflow-hidden relative border" style={{ borderColor: 'var(--primary-dark)' }}>
                <img alt="Conexão Grátis" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" src="https://i.postimg.cc/JhR6jq8k/1.jpg"/>
                <div className="absolute bottom-4 right-4 bg-white text-[#ee224a] w-10 h-10 rounded-full flex items-center justify-center shadow-lg font-bold text-xl">1</div>
              </div>
              <h3 className="text-2xl font-bold text-[#ee224a] mb-3">1. Conecte sua clínica</h3>
              <p className="text-gray-800 dark:text-text-muted-dark leading-relaxed">Cadastre sua clínica na plataforma e integre os canais de atendimento. Em poquíssimo tempo, sua operação fica pronta para receber leads, organizar agendamentos e centralizar todas as informações em um único lugar.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-full aspect-[4/3] bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-8 overflow-hidden relative border" style={{ borderColor: 'var(--primary-dark)' }}>
                <img alt="Definir Agendamento" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" src="https://i.postimg.cc/8CTKLHGv/2.jpg"/>
                <div className="absolute bottom-4 right-4 bg-white text-[#ee224a] w-10 h-10 rounded-full flex items-center justify-center shadow-lg font-bold text-xl">2</div>
              </div>
              <h3 className="text-2xl font-bold text-[#ee224a] mb-3">2. Transforme conversas em agendamentos</h3>
              <p className="text-gray-800 dark:text-text-muted-dark leading-relaxed">A cada novo contato, o sistema acompanha o funil automaticamente, registra os leads, identifica oportunidades e converte mensagens em agendamentos confirmados, sem esforço manual da sua equipe.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-full aspect-[4/3] bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-8 overflow-hidden relative border" style={{ borderColor: 'var(--primary-dark)' }}>
                <img alt="Automações e Métricas" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" src="https://i.postimg.cc/1zyCDHSG/2.png"/>
                <div className="absolute bottom-4 right-4 bg-white text-[#ee224a] w-10 h-10 rounded-full flex items-center justify-center shadow-lg font-bold text-xl">3</div>
              </div>
              <h3 className="text-2xl font-bold text-[#ee224a] mb-3">3. Acompanhe resultados e cresça com controle</h3>
              <p className="text-gray-800 dark:text-text-muted-dark leading-relaxed">Visualize métricas claras de desempenho, taxa de conversão e agenda da clínica em tempo real. Tenha total controle da operação e tome decisões baseadas em dados para escalar seus resultados.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-[#ee224a] mb-3">Pronto para transformar a gestão da sua clínica?</h3>
          <p className="mt-2 text-gray-700">Comece agora, fale com um especialista. Em poucquíssimo tempo, você já vê impacto real nos seus agendamentos e no fluxo de atendimento.</p>
          <div className="mt-6">
            <a
              href="https://wa.me/5511994299814?text=Ol%C3%A1%2C%20gostaria%20de%20transformar%20a%20minha%20clinica"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
            >
              Começar Agora
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
                <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                  <img src="/logo2-masterclinicas.png" alt="MasterClínicas" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-[#ee224a]">MasterClínicas</span>
              </div>
              <p className="text-gray-400 text-sm">Plataforma de gestão para clínicas de estética — automações, métricas e atendimento em um só lugar.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  (11) 99999-9999
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  São Paulo, SP
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Suporte: Seg - Sáb
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">Recursos</a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">Área do Parceiro</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} MasterClínicas. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
