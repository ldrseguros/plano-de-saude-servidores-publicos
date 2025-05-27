import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const PlansSection = () => {
  const plans = [
    {
      name: "Plano Enfermaria",
      price: "169",
      period: "/mês",
      description:
        "Valor acessível e ideal para quem busca economia com qualidade.",
      features: [
        "Consultas médicas ilimitadas",
        "Exames laboratoriais e de imagem",
        "Internação em enfermaria",
        "Urgência e emergência 24h",
      ],
      buttonText: "Escolher este plano",
      buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      name: "Plano Apartamento",
      price: "211",
      period: "/mês",
      popular: true,
      description: "Mais conforto e privacidade. Atendimento com excelência.",
      features: [
        "Consultas médicas ilimitadas",
        "Exames laboratoriais e de imagem",
        "Internação em apartamento",
        "Urgência e emergência 24h",
      ],
      buttonText: "Escolher este plano",
      buttonClass: "bg-yellow-400 hover:bg-yellow-300 text-blue-900",
    },
  ];

  const odontologico = {
    name: "Plano Odontológico",
    price: "25",
    description: "Adicional para cuidado completo com sua saúde bucal",
    features: [
      "Consultas odontológicas",
      "Limpeza e profilaxia",
      "Restaurações básicas",
      "Urgência odontológica",
    ],
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
            Nossos Planos
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Escolha o melhor plano para você e sua família. Todos oferecem a
            cobertura e qualidade que você precisa.
          </p>
        </div>

        {/* Planos Principais */}
        <div className="flex justify-center mb-12 sm:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-5xl w-full">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 relative border-2 transition-all duration-300 hover:shadow-2xl ${
                  plan.popular
                    ? "border-yellow-400 transform lg:scale-105"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      MAIS POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 leading-relaxed">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center mb-4 sm:mb-6">
                    <span className="text-lg sm:text-xl text-gray-600">R$</span>
                    <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-600 mx-1">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 text-base sm:text-lg">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to="/adesao" className="block">
                  <Button
                    className={`w-full py-3 sm:py-4 font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 ${plan.buttonClass}`}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Plano Odontológico */}
        <div className="flex justify-center mb-12 sm:mb-16">
          <div className="max-w-2xl w-full">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 sm:p-8 lg:p-10 border-2 border-green-200 shadow-lg">
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800">
                    {odontologico.name}
                  </h3>
                </div>
                <p className="text-green-700 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">
                  {odontologico.description}
                </p>
                <div className="flex items-baseline justify-center mb-4 sm:mb-6">
                  <span className="text-lg sm:text-xl text-green-600">+R$</span>
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600 mx-1">
                    {odontologico.price}
                  </span>
                  <span className="text-green-600 text-sm sm:text-base">
                    /mês por pessoa
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {odontologico.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="w-4 h-4 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-green-800 text-sm sm:text-base">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link to="/adesao">
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300">
                    Adicionar Odontológico
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Valores sujeitos a alteração de acordo com a faixa etária e região
            de cobertura. Desconto especial para servidores públicos municipais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/adesao">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 font-bold text-sm sm:text-base lg:text-lg transition-all duration-300">
                Fazer Adesão Agora
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 sm:px-8 py-3 sm:py-4 font-bold text-sm sm:text-base lg:text-lg transition-all duration-300"
            >
              <a
                href="https://wa.me/5564999999999"
                className="flex items-center"
              >
                Falar com um especialista
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlansSection;
