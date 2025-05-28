import { Button } from "@/components/ui/button";

const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Escolha seu plano",
      description:
        "Selecione o plano que melhor atende suas necessidades e da sua família",
    },
    {
      number: "02",
      title: "Preencha o formulário",
      description:
        "Complete seus dados pessoais e informações necessárias para a adesão",
    },
    {
      number: "03",
      title: "Aguarde a liberação",
      description:
        "Nosso time irá analisar e liberar seu acesso após a confirmação da carteirinha",
    },
    {
      number: "04",
      title: "Comece a usar",
      description:
        "Receba sua carteirinha e tenha acesso imediato a toda rede credenciada",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Como Funciona
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Processo simples e rápido para você ter acesso ao melhor plano de
            saúde
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-semibold text-lg mr-4">
            <a href="/adesao">Iniciar adesão agora</a>
          </Button>
          <Button
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 font-semibold text-lg"
          >
            <a href="https://wa.me/5511999999999">Falar com um especialista</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
