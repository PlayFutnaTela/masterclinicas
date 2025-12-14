// Página Pública da Clínica (Website)
import Link from "next/link";
import {
  Sparkles,
  Star,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Phone,
  MapPin,
  Clock
} from "lucide-react";

// Procedimentos oferecidos
const procedures = [
  {
    name: "Botox",
    description: "Suavize linhas de expressão e rugas com a toxina botulínica",
    icon: "✨",
  },
  {
    name: "Preenchimento Labial",
    description: "Lábios mais volumosos e definidos com ácido hialurônico",
    icon: "💋",
  },
  {
    name: "Harmonização Facial",
    description: "Contorno facial natural e equilibrado",
    icon: "🌟",
  },
  {
    name: "Skincare Avançado",
    description: "Tratamentos personalizados para rejuvenescimento",
    icon: "💆",
  },
  {
    name: "Bioestimuladores",
    description: "Estimule a produção de colágeno naturalmente",
    icon: "⚡",
  },
  {
    name: "Limpeza de Pele",
    description: "Pele renovada e livre de impurezas",
    icon: "🧴",
  },
];

// Depoimentos (mock)
const testimonials = [
  {
    name: "Maria Silva",
    text: "Atendimento excepcional! Os resultados superaram minhas expectativas.",
    rating: 5,
  },
  {
    name: "Ana Paula",
    text: "Profissionais muito competentes e ambiente acolhedor. Recomendo!",
    rating: 5,
  },
  {
    name: "Carla Santos",
    text: "Fiz harmonização facial e amei o resultado natural.",
    rating: 5,
  },
];

export default function HomePage() {
  // Link do WhatsApp (configurável via banco de dados na versão final)
  const whatsappLink = "https://wa.me/5511999999999?text=Olá! Gostaria de agendar uma avaliação.";

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">MasterClínicas</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Área do Parceiro
              </Link>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4" />
                +500 clientes satisfeitas
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Realce sua{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-600">
                  beleza natural
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Tratamentos estéticos de alta qualidade com profissionais
                especializados. Resultados naturais que realçam sua beleza única.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Agendar Avaliação
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#procedimentos"
                  className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Ver Procedimentos
                </a>
              </div>
              <div className="mt-8 flex items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Profissionais certificados
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Produtos premium
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-rose-100 to-rose-200 rounded-3xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-24 h-24 text-rose-400 mx-auto" />
                    <p className="mt-4 text-rose-500 font-medium">Sua beleza, nossa paixão</p>
                  </div>
                </div>
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">+98%</p>
                    <p className="text-sm text-gray-500">Satisfação</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Procedures Section */}
      <section id="procedimentos" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Nossos Procedimentos
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Oferecemos uma variedade de tratamentos estéticos para realçar
              sua beleza natural com segurança e qualidade.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {procedures.map((procedure) => (
              <div
                key={procedure.name}
                className="group p-6 bg-white border border-gray-200 rounded-2xl hover:border-rose-200 hover:shadow-lg transition-all duration-300"
              >
                <span className="text-4xl">{procedure.icon}</span>
                <h3 className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                  {procedure.name}
                </h3>
                <p className="mt-2 text-gray-600">{procedure.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              O que dizem nossas clientes
            </h2>
            <p className="mt-4 text-gray-600">
              Depoimentos reais de quem já experimentou nossos tratamentos
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-gray-200"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <p className="mt-4 font-semibold text-gray-900">
                  {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Pronta para realçar sua beleza?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Agende sua avaliação gratuita e descubra o tratamento ideal para você.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-8 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Fale Conosco no WhatsApp
          </a>
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
              <p className="text-gray-400 text-sm">
                Clínica de estética especializada em tratamentos faciais e
                corporais com qualidade e segurança.
              </p>
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
                  Seg - Sáb: 9h às 19h
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#procedimentos" className="hover:text-white transition-colors">
                    Procedimentos
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Área do Parceiro
                  </Link>
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
