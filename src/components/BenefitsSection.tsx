import { Clock, Award, Users } from "lucide-react";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Desconto em Folha",
      description:
        "Desconto direto na folha de pagamento com facilidade e praticidade para o servidor",
    },
    {
      icon: Award,
      title: "Sem Carência",
      description:
        "Atendimento imediato sem período de carência para consultas e exames básicos",
    },
    {
      icon: Users,
      title: "Atendimento Personalizado",
      description:
        "Suporte dedicado e atendimento personalizado para servidores e suas famílias",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Benefícios Exclusivos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vantagens especiais pensadas especialmente para servidores de
            Anicuns
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-6">
                <benefit.icon className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
