import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, Star, Shield, Heart, Users, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Planos = () => {
  const plans = [
    {
      id: "enfermaria",
      name: "Plano Enfermaria",
      price: "169",
      originalPrice: "199",
      discount: "15%",
      description:
        "Valor acessível e ideal para quem busca economia com qualidade.",
      popular: false,
      features: [
        "Consultas médicas ilimitadas",
        "Exames laboratoriais e de imagem",
        "Internação em enfermaria",
        "Urgência e emergência 24h",
        "Cirurgias eletivas e de urgência",
        "Fisioterapia e reabilitação",
        "Psicologia e psiquiatria",
        "Cardiologia e neurologia",
        "Pediatria e ginecologia",
        "Telemedicina incluída",
      ],
      notIncluded: ["Internação em apartamento", "Medicina estética"],
      buttonText: "Escolher Enfermaria",
      buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      id: "apartamento",
      name: "Plano Apartamento",
      price: "211,25",
      originalPrice: "249",
      discount: "15%",
      description: "Mais conforto e privacidade. Atendimento com excelência.",
      popular: true,
      features: [
        "Consultas médicas ilimitadas",
        "Exames laboratoriais e de imagem",
        "Internação em apartamento",
        "Urgência e emergência 24h",
        "Cirurgias eletivas e de urgência",
        "Fisioterapia e reabilitação",
        "Psicologia e psiquiatria",
        "Cardiologia e neurologia",
        "Pediatria e ginecologia",
        "Telemedicina incluída",
        "Acompanhante em internação",
        "Quarto privativo",
      ],
      notIncluded: ["Medicina estética"],
      buttonText: "Escolher Apartamento",
      buttonClass: "bg-yellow-400 hover:bg-yellow-300 text-blue-900",
    },
  ];

  const odontologico = {
    name: "Plano Odontológico",
    price: "25",
    description: "Cuidado completo com sua saúde bucal",
    features: [
      "Consultas odontológicas ilimitadas",
      "Limpeza e profilaxia",
      "Restaurações em resina",
      "Extrações simples",
      "Tratamento de canal",
      "Próteses dentárias",
      "Ortodontia básica",
      "Radiografias odontológicas",
      "Cirurgias odontológicas",
      "Atendimento de urgência 24h",
      "Cobertura Nacional",
    ],
  };

  const coverage = [
    {
      category: "Consultas e Exames",
      items: [
        "Consultas médicas em todas as especialidades",
        "Exames laboratoriais completos",
        "Exames de imagem (Raio-X, Ultrassom, Tomografia, Ressonância)",
        "Eletrocardiograma e outros exames cardiológicos",
        "Endoscopia e colonoscopia",
        "Mamografia e densitometria óssea",
      ],
    },
    {
      category: "Internações e Cirurgias",
      items: [
        "Internações clínicas e cirúrgicas",
        "Cirurgias eletivas e de urgência",
        "UTI e CTI quando necessário",
        "Transplantes conforme rol ANS",
        "Cirurgias cardíacas e neurológicas",
        "Cirurgias oncológicas",
      ],
    },
    {
      category: "Urgência e Emergência",
      items: [
        "Atendimento 24 horas",
        "Pronto-socorro médico",
        "Ambulância",
        "Remoção inter-hospitalar",
        "Suporte avançado de vida",
      ],
    },
    {
      category: "Especialidades",
      items: [
        "Cardiologia e cirurgia cardíaca",
        "Neurologia e neurocirurgia",
        "Oncologia e quimioterapia",
        "Ortopedia e traumatologia",
        "Ginecologia e obstetrícia",
        "Pediatria e neonatologia",
        "Psiquiatria e psicologia",
        "Fisioterapia e reabilitação",
        "E todas as demais especialidades cobertas pelo Rol da ANS",
      ],
    },
  ];

  const benefits = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Desconto em Folha",
      description:
        "Pagamento automático descontado diretamente na folha de pagamento do servidor.",
    },
    {
      icon: <Heart className="w-8 h-8 text-blue-600" />,
      title: "Sem Carência",
      description: "Consultas, exames e internações sem período de carência.",
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Família Incluída",
      description:
        "Possibilidade de incluir cônjuge e filhos dependentes no mesmo plano.",
    },
    {
      icon: <Phone className="w-8 h-8 text-blue-600" />,
      title: "Telemedicina",
      description: "Consultas médicas online disponíveis 24 horas por dia.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Nossos Planos de Saúde
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 leading-relaxed">
              Escolha o plano ideal para você e sua família. Todos com cobertura
              completa e atendimento de qualidade.
            </p>
          </div>
        </div>
      </section>

      {/* Planos Principais */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Planos Médicos
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Dois planos completos desenvolvidos especialmente para
                servidores públicos municipais e suas famílias.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl shadow-xl p-6 sm:p-8 relative border-2 ${
                    plan.popular
                      ? "border-yellow-400 transform lg:scale-105"
                      : "border-gray-200"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-full text-sm font-bold flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        MAIS POPULAR
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-4">
                      {plan.description}
                    </p>

                    <div className="flex items-center justify-center mb-4">
                      <div className="text-center">
                        <div className="flex items-baseline justify-center mb-2">
                          <span className="text-sm text-gray-500 line-through mr-2">
                            R$ {plan.originalPrice}
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            -{plan.discount}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-center">
                          <span className="text-lg text-gray-600">R$</span>
                          <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600">
                            {plan.price}
                          </span>
                          <span className="text-gray-600 ml-1">/mês</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <h4 className="font-bold text-gray-800 text-sm sm:text-base">
                      ✅ Incluído no plano:
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-xs sm:text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {plan.notIncluded.length > 0 && (
                      <>
                        <h4 className="font-bold text-gray-800 text-sm sm:text-base mt-6">
                          ❌ Não incluído:
                        </h4>
                        <ul className="space-y-2">
                          {plan.notIncluded.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start">
                              <X className="w-4 h-4 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 text-xs sm:text-sm">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>

                  <Link to="/adesao">
                    <Button
                      className={`w-full py-3 font-semibold text-sm sm:text-base ${plan.buttonClass}`}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Plano Odontológico */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 sm:p-8 border-2 border-green-200">
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 mb-2">
                  {odontologico.name}
                </h3>
                <p className="text-green-700 text-sm sm:text-base mb-4">
                  {odontologico.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-lg text-green-600">+R$</span>
                  <span className="text-3xl sm:text-4xl font-bold text-green-600">
                    {odontologico.price}
                  </span>
                  <span className="text-green-600 ml-1">/mês por pessoa</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {odontologico.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="w-4 h-4 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-green-800 text-xs sm:text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link to="/adesao">
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 font-semibold">
                    Adicionar Odontológico
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cobertura Detalhada */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Cobertura Completa
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Todos os nossos planos seguem o rol de procedimentos da ANS,
                garantindo cobertura ampla e segura.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {coverage.map((category, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
                    {category.category}
                  </h3>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <Check className="w-3 h-3 text-blue-600 mr-2 flex-shrink-0 mt-1" />
                        <span className="text-gray-700 text-xs sm:text-sm">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios Exclusivos */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Benefícios Exclusivos
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Vantagens especiais desenvolvidas especialmente para servidores
                públicos municipais.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">{benefit.icon}</div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              Pronto para Cuidar da Sua Saúde?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8">
              Faça sua adesão agora e garante proteção completa para você e sua
              família.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/adesao">
                <Button className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-8 py-3 font-bold text-lg">
                  Fazer Adesão Agora
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-white hover:text-yellow-400 hover:bg-white text-blue-800 px-8 py-3 font-bold text-lg"
              >
                <a href="https://wa.me/5564999999999">Falar com Especialista</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Planos;
