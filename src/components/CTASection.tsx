import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="container mx-auto px-4">
        <div className="bg-blue-700 rounded-2xl p-12 text-center text-white max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para garantir o melhor cuidado para você e sua família?
          </h2>

          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Não perca tempo! Faça sua adesão agora e tenha acesso imediato ao
            melhor plano de saúde para servidores de Anicuns.
          </p>

          <Link to="/adesao">
            <Button className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 text-lg px-10 py-4 font-bold">
              ADERIR AGORA
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
