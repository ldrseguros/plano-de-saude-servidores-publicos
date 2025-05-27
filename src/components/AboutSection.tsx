import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const AboutSection = () => {
  const features = [
    "Missão de oferecer saúde de qualidade para servidores públicos",
    "Rede credenciada com hospitais e clínicas de referência",
    "Vantagens exclusivas para servidores de Anicuns",
    "Estrutura sólida e confiabilidade comprovada",
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            🇧🇷 Conheça a Brasil Saúde
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vídeo institucional explicando nossa missão, visão e estrutura da
            operadora
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
              Confiabilidade, rede de atendimento e vantagens exclusivas
            </h3>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              A Brasil Saúde é uma operadora comprometida em oferecer
              assistência médica de qualidade para servidores públicos. Nossa
              estrutura foi desenvolvida pensando nas necessidades específicas
              dos servidores de Anicuns.
            </p>

            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/adesao">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-semibold text-lg">
                Quero um plano com a Brasil Saúde
              </Button>
            </Link>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
              <div className="bg-gray-800 aspect-video rounded-xl flex items-center justify-center relative overflow-hidden cursor-pointer group">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white transition-colors">
                    <div className="w-0 h-0 border-l-[16px] border-l-blue-600 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                  </div>
                  <p className="text-white text-lg font-medium">
                    Vídeo Institucional
                  </p>
                  <p className="text-blue-200 text-sm mt-2">
                    Conheça nossa missão e estrutura
                  </p>
                </div>

                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors rounded-xl"></div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Assista ao vídeo e conheça mais sobre a Brasil Saúde
                </p>
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-8 -left-8 bg-white rounded-xl shadow-xl p-6 max-w-xs">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-800">+1000</div>
                  <div className="text-sm text-gray-600">
                    Servidores atendidos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
