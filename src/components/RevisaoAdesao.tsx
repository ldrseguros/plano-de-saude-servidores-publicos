import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdesaoStore } from "@/store/adesaoStore";

interface RevisaoAdesaoProps {
  onProximo: () => void;
  onAnterior: () => void;
}

const RevisaoAdesao: React.FC<RevisaoAdesaoProps> = ({
  onProximo,
  onAnterior,
}) => {
  const { planoSelecionado, dadosPessoais } = useAdesaoStore();

  // Verificar se os dados necessários estão disponíveis
  if (!planoSelecionado || !dadosPessoais) {
    // Isso indica um fluxo incorreto ou atualização de página no meio do processo
    // Podemos redirecionar para o início da adesão ou exibir uma mensagem de erro
    // Por enquanto, vou retornar null ou uma mensagem simples
    return (
      <div>
        Erro ao carregar dados para revisão. Por favor, volte e tente novamente.
      </div>
    );
    // Ou redirecionar:
    //  navigate("/adesao");
    //  return null;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Resumo da Adesão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plano Selecionado */}
        <Card>
          <CardHeader>
            <CardTitle>Plano Selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  {planoSelecionado.nome}
                </h3>
                <p className="text-gray-600">
                  Cobertura completa conforme selecionado
                </p>
                {/* Exibir se adicional odontológico foi incluído */}
                {planoSelecionado.incluiOdontologico && (
                  <p className="text-green-600 text-sm mt-1">
                    + Adicional Odontológico Incluído
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  R${" "}
                  {planoSelecionado.valorTotal?.toFixed(2) ||
                    planoSelecionado.valor.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">por mês</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais do Titular</CardTitle>
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
                <span className="font-medium">Data de Nascimento:</span>
                <p className="text-gray-700">{dadosPessoais.dataNascimento}</p>
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
              <div className="md:col-span-2">
                <span className="font-medium">Endereço:</span>
                <p className="text-gray-700">{dadosPessoais.endereco}</p>
              </div>
            </div>

            {dadosPessoais.dependentes.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <span className="font-medium">Dependentes:</span>
                <div className="mt-2 space-y-1">
                  {dadosPessoais.dependentes.map((dep, index) => (
                    <p key={index} className="text-gray-700">
                      {dep.nome} - {dep.parentesco} ({dep.dataNascimento})
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões de Navegação */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={onAnterior}>
            Voltar
          </Button>
          <Button onClick={onProximo}>Próximo: Termo de Compromisso</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevisaoAdesao;
