
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdesaoStore } from "@/store/adesaoStore";
import ProgressIndicator from "@/components/ProgressIndicator";
import { useToast } from "@/hooks/use-toast";

const Revisao = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    planoSelecionado, 
    dadosPessoais, 
    termosAceitos, 
    setTermosAceitos, 
    resetAdesao,
    etapaAtual 
  } = useAdesaoStore();
  
  const [termosLidos, setTermosLidos] = useState(false);

  const handleVoltar = () => {
    navigate("/dados-pessoais");
    window.scrollTo(0, 0);
  };

  const handleFinalizarAdesao = () => {
    if (!termosLidos || !termosAceitos) {
      toast({
        title: "Aceite os termos",
        description: "Por favor, leia e aceite os termos para finalizar a adesão.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Adesão realizada com sucesso!",
      description: "Em breve você receberá as informações do seu plano por e-mail.",
    });

    resetAdesao();
    navigate("/confirmacao");
    window.scrollTo(0, 0);
  };

  if (!planoSelecionado || !dadosPessoais) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Dados não encontrados</h2>
            <p className="text-gray-600 mb-4">
              Por favor, inicie o processo de adesão novamente.
            </p>
            <Button onClick={() => navigate("/adesao")}>
              Iniciar Adesão
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <ProgressIndicator 
          currentStep={etapaAtual} 
          totalSteps={3} 
          stepLabels={["Plano", "Dados", "Revisão"]} 
        />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Revisão da Adesão
          </h1>
          <p className="text-gray-600 text-lg">
            Confira todos os dados antes de finalizar sua adesão
          </p>
        </div>

        <div className="space-y-6">
          {/* Plano Selecionado */}
          <Card>
            <CardHeader>
              <CardTitle>Plano Selecionado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{planoSelecionado.nome}</h3>
                  <p className="text-gray-600">Cobertura completa conforme selecionado</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {planoSelecionado.valor.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">por mês</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Nome:</span>
                  <p className="text-gray-700">{dadosPessoais.nome}</p>
                </div>
                <div>
                  <span className="font-medium">CPF:</span>
                  <p className="text-gray-700">{dadosPessoais.cpf}</p>
                </div>
                <div>
                  <span className="font-medium">Matrícula:</span>
                  <p className="text-gray-700">{dadosPessoais.matricula}</p>
                </div>
                <div>
                  <span className="font-medium">Celular:</span>
                  <p className="text-gray-700">{dadosPessoais.celular}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">E-mail:</span>
                  <p className="text-gray-700">{dadosPessoais.email}</p>
                </div>
              </div>

              {dadosPessoais.dependentes.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <span className="font-medium">Dependentes:</span>
                  <div className="mt-2 space-y-1">
                    {dadosPessoais.dependentes.map((dep, index) => (
                      <p key={index} className="text-gray-700">
                        {dep.nome} - {dep.parentesco} ({dep.idade} anos)
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Termos e Condições */}
          <Card>
            <CardHeader>
              <CardTitle>Termos e Condições</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="termos-lidos"
                  checked={termosLidos}
                  onCheckedChange={(checked) => setTermosLidos(checked as boolean)}
                />
                <label htmlFor="termos-lidos" className="text-sm text-gray-700 cursor-pointer">
                  Declaro que li e compreendi todos os termos e condições do plano Brasil Saúde.
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="aceite-contratacao"
                  checked={termosAceitos}
                  onCheckedChange={(checked) => setTermosAceitos(checked as boolean)}
                />
                <label htmlFor="aceite-contratacao" className="text-sm text-gray-700 cursor-pointer">
                  Autorizo a contratação do plano e o desconto da mensalidade em folha de pagamento.
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleVoltar}>
            Voltar
          </Button>
          <Button 
            onClick={handleFinalizarAdesao}
            disabled={!termosLidos || !termosAceitos}
            className="bg-green-600 hover:bg-green-700"
          >
            Finalizar Adesão
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Revisao;
