import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Users, Heart, Award, Clock, MapPin } from "lucide-react";

const SobreNos = () => {
  const stats = [
    { number: "15+", label: "Anos de experiência" },
    { number: "10.000+", label: "Vidas cobertas" },
    { number: "50+", label: "Hospitais credenciados" },
    { number: "24/7", label: "Atendimento disponível" },
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Segurança",
      description:
        "Garantimos a proteção e segurança de todos os nossos beneficiários com planos regulamentados pela ANS.",
    },
    {
      icon: <Heart className="w-8 h-8 text-blue-600" />,
      title: "Cuidado",
      description:
        "Oferecemos atendimento humanizado e personalizado, priorizando o bem-estar de cada pessoa.",
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Compromisso",
      description:
        "Nosso compromisso é com a saúde dos servidores públicos e suas famílias, sempre.",
    },
    {
      icon: <Award className="w-8 h-8 text-blue-600" />,
      title: "Excelência",
      description:
        "Buscamos constantemente a excelência em nossos serviços e na qualidade do atendimento.",
    },
  ];

  const differentials = [
    "Planos exclusivos para servidores públicos municipais",
    "Desconto em folha de pagamento",
    "Sem período de carência para consultas e exames",
    "Rede credenciada com mais de 50 hospitais e clínicas",
    "Cobertura nacional com foco regional",
    "Atendimento 24 horas para urgência e emergência",
    "Programas de prevenção e promoção da saúde",
    "Telemedicina disponível",
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Sobre a Brasil Saúde Servidor
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 leading-relaxed">
              Há mais de 15 anos cuidando da saúde dos servidores públicos
              municipais e suas famílias com dedicação, qualidade e compromisso.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
                  Nossa História
                </h2>
                <div className="space-y-4 sm:space-y-6 text-gray-600 text-sm sm:text-base leading-relaxed">
                  <p>
                    A Brasil Saúde Servidor nasceu em 2008 com o objetivo de
                    oferecer planos de saúde de qualidade especificamente
                    desenvolvidos para atender às necessidades dos servidores
                    públicos municipais.
                  </p>
                  <p>
                    Desde então, temos crescido constantemente, sempre mantendo
                    nosso foco na excelência do atendimento e na satisfação de
                    nossos beneficiários. Nossa trajetória é marcada pela
                    confiança depositada pelos servidores públicos que
                    escolheram nossos serviços.
                  </p>
                  <p>
                    Hoje, somos referência em planos de saúde para servidores
                    públicos, oferecendo cobertura completa com a qualidade e
                    segurança que nossos beneficiários merecem.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center justify-center h-48 sm:h-64 lg:h-80">
                    <div className="text-center">
                      <Clock className="w-16 h-16 sm:w-20 sm:h-20 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-2">
                        15+ Anos
                      </h3>
                      <p className="text-blue-700 text-sm sm:text-base">
                        Cuidando da sua saúde
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Missão, Visão e Valores */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Nossos Valores
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Os princípios que guiam nossa atuação e definem nosso
                compromisso com a excelência em saúde.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 sm:p-8 shadow-lg text-center"
                >
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Missão e Visão */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="bg-blue-50 rounded-2xl p-6 sm:p-8 lg:p-10">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800 mb-4 sm:mb-6">
                  Nossa Missão
                </h3>
                <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed">
                  Oferecer planos de saúde de qualidade superior, especialmente
                  desenvolvidos para servidores públicos municipais, garantindo
                  acesso a cuidados médicos de excelência com atendimento
                  humanizado e preços acessíveis.
                </p>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 sm:p-8 lg:p-10">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 mb-4 sm:mb-6">
                  Nossa Visão
                </h3>
                <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed">
                  Ser a operadora de saúde de referência para servidores
                  públicos municipais no Brasil, reconhecida pela excelência em
                  atendimento, inovação em serviços e compromisso com o
                  bem-estar de nossos beneficiários.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                Nossos Diferenciais
              </h2>
              <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
                O que nos torna únicos no cuidado com a saúde dos servidores
                públicos.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {differentials.map((differential, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-800 text-xs font-bold">✓</span>
                  </div>
                  <p className="text-blue-100 text-sm sm:text-base">
                    {differential}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Localização */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <MapPin className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Nossa Sede
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Estamos localizados em Anicuns, Goiás, atendendo servidores
              públicos municipais da região com dedicação e proximidade.
            </p>
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
                Brasil Saúde Servidor
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Anicuns - Goiás
                <br />
                Atendimento: Segunda a Sexta, 8h às 18h
                <br />
                Telefone: (64) 3131-0000
                <br />
                WhatsApp: (64) 99999-9999
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SobreNos;
