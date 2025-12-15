// Página principal da PLATAFORMA MasterClínicas
import Link from "next/link";
import {
  Sparkles,
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
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-black">MasterClínicas</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-black">
                Entrar
              </Link>
              <a
                href="/login"
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Teste Grátis
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
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVi4wol4OlvyBBHatJBRaa87Y6UwOVwljJDsjqYO5UrHfl_Su4sUP0KKThjIsIveR-i6MN5MCg96wdX1ysmQVeWMMwVtiBNhKuBSw11-TH3DNPtE1NVogzKeNvZ-FKro2QvbCpiYlBFOos7eM3iAii99ns30Zh_H0FnNdEh-OVoCAbtdMtqB6oOrFoErKpVFFDIcpvQF-mmvkA_MyE8Qmq3Kl4moYReK-r3Ct2ZQaDALT6i7SbVg__H9UBCMoiaycnZjjNAJjPDjQ"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/70 to-gray-900/90 mix-blend-multiply"></div>
          <div className="absolute inset-0 mix-blend-overlay" style={{ backgroundColor: 'rgba(194,69,100,0.08)' }}></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
            A plataforma completa para gerenciar e expandir sua clínica de estética com inteligência.
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed opacity-90">
            MasterClínicas conecta leads, agendamentos, automações e métricas em um só lugar — impulsione sua operação com simplicidade e eficiência.
          </p>
        </div>
      </header>

      {/* Feature cards (grid like provided) */}
      <section className="relative z-20 -mt-32 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto bg-white dark:bg-surface-dark rounded-3xl shadow-soft p-6 md:p-10 border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-rose-100 dark:bg-[rgba(194,69,100,0.14)]">
                <img src="/assets/People/SVG/ic_fluent_people_48_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Qualificação dos leads</h3>
              <p className="text-sm text-gray-800 dark:text-gray-400 leading-relaxed">MasterClínicas completa para gerenciar e expandir sua operação.</p>
            </div>

            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-teal-100 dark:bg-teal-900/30">
                <img src="/assets/Calendar/SVG/ic_fluent_calendar_48_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Agendamentos e automações</h3>
              <p className="text-sm text-gray-800 dark:text-gray-400 leading-relaxed">Conecte agendamentos, lembretes e confirmações automáticas.</p>
            </div>

            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
                <img src="/assets/Gauge/SVG/ic_fluent_gauge_32_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Automações e métricas</h3>
              <p className="text-sm text-gray-800 dark:text-gray-400 leading-relaxed">Integre dados e painéis para medir a performance real da clínica.</p>
            </div>

            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-rose-100 dark:bg-[rgba(194,69,100,0.14)]">
                <img src="/assets/Checkbox/SVG/ic_fluent_checkbox_24_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Confirmações personalizadas</h3>
              <p className="text-sm text-gray-800 dark:text-gray-400 leading-relaxed">Comunicações customizadas para diminuir faltas e aumentar conversões.</p>
            </div>

            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/30">
                <img src="/assets/Code/SVG/ic_fluent_code_24_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Orquestração de fluxos</h3>
              <p className="text-sm text-gray-800 dark:text-gray-400 leading-relaxed">Gerencie triggers, webhooks e integrações em um só painel.</p>
            </div>

            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-orange-100 dark:bg-orange-900/30">
                <img src="/assets/Shifts/SVG/ic_fluent_shifts_32_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Sincronizações</h3>
              <p className="text-sm text-gray-800 dark:text-gray-400 leading-relaxed">Conecte seus sistemas e mantenha dados consistentes em tempo real.</p>
            </div>

            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(194,69,100,0.08)' }}>
                <img src="/assets/Link/SVG/ic_fluent_link_32_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Percursos e jornadas</h3>
              <p className="text-sm text-gray-800 dark:text-gray-400 leading-relaxed">Defina fluxos e jornadas dos seus pacientes desde o primeiro contato.</p>
            </div>

            <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-stone-100 dark:bg-stone-700">
                <img src="/assets/Receipt/SVG/ic_fluent_receipt_32_color.svg" alt="" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Faturamento e pagamentos</h3>
              <p className="text-sm text-gray-800 dark:text-gray-400 leading-relaxed">Controle cobranças, pacotes e relatórios financeiros com facilidade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - richer visual */}
      <section className="py-24 bg-[#FAF7F2] dark:bg-surface-dark transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Como funciona</h2>
            <div className="w-16 h-1 bg-[var(--primary)] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            <div className="flex flex-col items-center text-center group">
              <div className="w-full aspect-[4/3] bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-8 overflow-hidden relative border border-gray-100 dark:border-gray-700">
                <img alt="Conexão Grátis" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4zfWrkEQLd9EuUoI1ORuMOXTwyKdK5z1yaYTIt6ibrVq0PfItOka2-iMWQN5AvgNGjxqRGs15-DND6o9aleHtydiCpVCI3smCo4tRHAK-fPJ5y1er2nhiyeL4vABXPJx_Uc63Aq-ihMR9N6guUo_ZPgEMZpUrxhC1rzsPdX_k72m540SJRE_Bp-tGlOHBfFIqjm6Ba2RL-zJ56i0ykiBXdqC1AiRjQROG1YXNw4NoNdwwJ0vY0GsyZQ5azheDkKkf9-d7I9uTu8w"/>
                <div className="absolute bottom-4 right-4 bg-[var(--primary)] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg font-bold text-xl">1</div>
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">1. Conecta grátis</h3>
              <p className="text-gray-800 dark:text-text-muted-dark leading-relaxed">MasterClínicas conecta leads, agendamentos, automações e métricas em um só lugar — agendamento e no seu lugar.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-full aspect-[4/3] bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-8 overflow-hidden relative border border-gray-100 dark:border-gray-700">
                <img alt="Definir Agendamento" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuASpBK3xXfKfhwbsXrEObdW7y6-ojZs_bnpM-bk5WgNLddkwHxoG2stUDmFddnR5wrRVNcbdSiqaK1jFINroD66X8zwWw_AvovkIo2xxv9Y6XG2EO0wF-Bt1AE4RrSgl6SRx1R75g8cldPVecGkZoxlxkxPC3C1TJFdI9zdMZUw4EWrBqA3YhYnS0nqIHS8iSieqGqWgLeGeaywLUQHlSuDIHiKhjfI5BvJNVKRrjGbVK09RkCvdbBnY6UzMzJmxGnT4pr1Tt-ymI8"/>
                <div className="absolute bottom-4 right-4 bg-[var(--primary)] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg font-bold text-xl">2</div>
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">2. Definir agendamento</h3>
              <p className="text-gray-800 dark:text-text-muted-dark leading-relaxed">MasterClínicas entrega configuração, move e organiza suas métricas. Ponto e contatos e automações agora em só lugar.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-full aspect-[4/3] bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-8 overflow-hidden relative border border-gray-100 dark:border-gray-700">
                <img alt="Automações e Métricas" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrMJVDEO2vT8gSHvaTg-OixgnW7DjzRS4Q1T1GGVh3wqlMaHcI103SF6wSxdFnq5q67kf77c-WyvNOA8XN6YIWNrmoqshk6xHnt78lWKkDC_iIUSMfhBzYhYlEKaealGZgy7JCSJfR0ZX2jYFFUQMrnk_vDrx66kl4O_nbuCyya-xH3f6fFVuKdZlm072k-N3jmjfDplnEfaEbrUFbCaTVDUdcBHzEEbBnCEUo9H7_CRaNOoTWM_t9lFeJ9jGOVkAmFGvWa9S2B4k"/>
                <div className="absolute bottom-4 right-4 bg-[var(--primary)] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg font-bold text-xl">3</div>
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">3. Automações e métrica</h3>
              <p className="text-gray-800 dark:text-text-muted-dark leading-relaxed">MasterClínicas conecta completa e cuidar de clínica e autênticos em métrica — Impulsione sua operação com simplicidade e eficiência.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900">Pronto para testar a plataforma?</h3>
          <p className="mt-2 text-gray-700">Sem cartão de crédito. Comece em minutos e veja o impacto no seu fluxo.</p>
          <div className="mt-6">
            <Link href="/login" className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Começar Agora
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">MasterClínicas</span>
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
