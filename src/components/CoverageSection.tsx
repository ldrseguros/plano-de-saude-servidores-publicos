import { Button } from "@/components/ui/button";
import { Shield, Users, FileText } from "lucide-react";

const CoverageSection = () => {
  const coverageItems = [
    {
      icon: Shield,
      title: "Rede Médica",
      description:
        "Ampla rede credenciada com os melhores profissionais e hospitais da região",
    },
    {
      icon: Users,
      title: "Família",
      description:
        "Cobertura completa para você e toda sua família com atendimento personalizado",
    },
    {
      icon: FileText,
      title: "Documentação",
      description:
        "Processo simples e rápido para adesão com toda documentação digital",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Cobertura Completa
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Rede médica de qualidade e cobertura completa para toda sua família
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {coverageItems.map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <item.icon className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                Tudo o que você precisa para cuidar da sua saúde
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Consultas
                    </h4>
                    <p className="text-gray-600">
                      Acesso a especialistas e clínicos gerais
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Exames</h4>
                    <p className="text-gray-600">
                      Laboratório e diagnóstico por imagem
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Cirurgias
                    </h4>
                    <p className="text-gray-600">
                      Procedimentos cirúrgicos com equipe especializada
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Urgência/Emergência
                    </h4>
                    <p className="text-gray-600">
                      Atendimento 24h para urgências e emergências
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Terapias
                    </h4>
                    <p className="text-gray-600">
                      Terapias básicas e especiais (TEA)
                    </p>
                  </div>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-semibold">
                <a href="/planos">Conhecer cobertura</a>
              </Button>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-0 h-0 border-l-[12px] border-l-blue-600 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                  </div>
                  <p className="text-gray-500">Vídeo explicativo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverageSection;
