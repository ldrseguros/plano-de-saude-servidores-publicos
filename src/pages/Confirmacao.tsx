
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const Confirmacao = () => {
  const navigate = useNavigate();

  const handleVoltar = () => {
    navigate("/");
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Adesão Realizada com Sucesso!
            </h1>
            
            <p className="text-gray-600 text-lg mb-6">
              Parabéns! Sua adesão ao Plano Brasil Saúde foi processada com sucesso.
            </p>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h2 className="font-semibold text-gray-800 mb-3">Próximos Passos:</h2>
              <ul className="text-left text-gray-700 space-y-2">
                <li>• Você receberá um e-mail de confirmação em até 24 horas</li>
                <li>• Sua carteirinha será enviada por e-mail em até 48 horas</li>
                <li>• O desconto em folha começará no próximo mês</li>
                <li>• Em caso de dúvidas, entre em contato conosco</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <Button onClick={handleVoltar} className="w-full">
                Voltar à Página Inicial
              </Button>
              
              <p className="text-sm text-gray-500">
                Protocolo: {Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Confirmacao;
