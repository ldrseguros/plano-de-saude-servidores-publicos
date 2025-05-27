import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-white rounded-full"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-24 sm:w-32 lg:w-48 h-24 sm:h-32 lg:h-48 bg-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 sm:left-1/3 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-white rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-block bg-yellow-400 text-blue-900 px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold mb-6 sm:mb-8">
              PLANO BRASIL SAÚDE SERVIDOR
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 sm:mb-6">
              Plano Brasil Saúde
              <br />
              para Servidores de
              <br />
              <span className="text-yellow-400">Anicuns</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              A saúde é o bem mais precioso que temos. Por isso, desenvolvemos
              um plano exclusivo para servidores públicos de Anicuns, oferecendo
              cuidado de qualidade para você e sua família. Escolha seu plano e
              tenha acesso à melhor assistência médica.
            </p>

            <Link to="/adesao">
              <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                Quero fazer minha adesão
              </Button>
            </Link>
          </div>

          <div className="relative mt-8 lg:mt-0">
            <div className="bg-blue-700/30 rounded-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-sm">
              <div className="bg-gray-800/50 aspect-video rounded-xl flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-gray-800/60 transition-colors">
                <div className="text-center">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 hover:bg-white/30 transition-colors">
                    <div className="w-0 h-0 border-l-[12px] sm:border-l-[16px] border-l-white border-t-[9px] sm:border-t-[12px] border-t-transparent border-b-[9px] sm:border-b-[12px] border-b-transparent ml-1"></div>
                  </div>
                  <p className="text-blue-100 text-base sm:text-lg font-medium">
                    Vídeo Institucional
                  </p>
                  <p className="text-blue-200 text-xs sm:text-sm mt-1 sm:mt-2">
                    Conheça o Plano Brasil Saúde
                  </p>
                </div>

                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-colors cursor-pointer rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
