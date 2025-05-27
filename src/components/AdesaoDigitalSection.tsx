import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

const AdesaoDigitalSection = () => {
  const [termosAceitos, setTermosAceitos] = useState(false);

  const termos = [
    "Aceito receber informações sobre o plano por e-mail e telefone",
    "Declaro que as informações fornecidas são verdadeiras",
    "Autorizo o desconto em folha de pagamento",
    "Concordo com os termos e condições do plano de saúde",
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Termo de Adesão Digital</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Aceite os termos digitalmente e finalize sua adesão ao plano de
            saúde
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 text-gray-800">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Termos de Adesão
            </h3>

            <div className="space-y-4 mb-8">
              {termos.map((termo, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Checkbox id={`termo-${index}`} className="mt-1" />
                  <label
                    htmlFor={`termo-${index}`}
                    className="text-gray-700 leading-relaxed cursor-pointer"
                  >
                    {termo}
                  </label>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="flex items-start space-x-3 mb-6">
                <Checkbox
                  id="aceite-geral"
                  checked={termosAceitos}
                  onCheckedChange={(checked) =>
                    setTermosAceitos(checked as boolean)
                  }
                  className="mt-1"
                />
                <label
                  htmlFor="aceite-geral"
                  className="text-gray-700 leading-relaxed cursor-pointer font-medium"
                >
                  Li e aceito todos os termos e condições para adesão ao Plano
                  Brasil Saúde
                </label>
              </div>

              <Link to="/adesao">
                <Button
                  className={`w-full py-4 text-lg font-bold ${
                    termosAceitos
                      ? "bg-yellow-400 hover:bg-yellow-300 text-blue-900"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!termosAceitos}
                >
                  {termosAceitos
                    ? "Finalizar Adesão"
                    : "Aceite os termos para continuar"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdesaoDigitalSection;
