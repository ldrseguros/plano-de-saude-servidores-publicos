
import { Button } from "@/components/ui/button";

const AboutPlanSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Conheça o Plano Brasil Saúde
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              O Brasil Saúde oferece o melhor em assistência médica para servidores públicos municipais de Anicuns. Com uma rede credenciada de qualidade e atendimento personalizado.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-700">Rede credenciada com os melhores profissionais</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-700">Atendimento 24 horas para emergências</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-700">Cobertura completa para toda a família</p>
              </div>
            </div>
            
            <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
              SAIBA MAIS
            </Button>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-8">
            <div className="bg-gray-300 aspect-video rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                </div>
                <p className="text-gray-600">vídeo_plano</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPlanSection;
