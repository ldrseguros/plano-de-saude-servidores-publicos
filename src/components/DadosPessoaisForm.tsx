import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DadosPessoais, IDependente } from "@/store/adesaoStore"; // Importar IDependente
import { useToast } from "@/hooks/use-toast";

interface DadosPessoaisFormProps {
  onProximo: (dados: DadosPessoais) => void;
  onAnterior: () => void;
  initialData?: DadosPessoais; // Para preencher se já houver dados no store
}

const DadosPessoaisForm: React.FC<DadosPessoaisFormProps> = ({
  onProximo,
  onAnterior,
  initialData,
}) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState<DadosPessoais>(
    initialData || {
      nome: "",
      cpf: "",
      matricula: "",
      celular: "",
      email: "",
      dataNascimento: "", // Adicionado com valor inicial vazio
      endereco: "", // Adicionado com valor inicial vazio
      dependentes: [],
    }
  );

  // Usar o tipo correto para dependente, conforme definido em DadosPessoais
  const [dependente, setDependente] = useState<{
    nome: string;
    parentesco: string;
    dataNascimento: string;
  }>({
    nome: "",
    parentesco: "",
    dataNascimento: "", // Usar dataNascimento em vez de idade
  });

  const handleInputChange = (
    field: keyof Omit<DadosPessoais, "dependentes">,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDependenteInputChange = (
    field: keyof typeof dependente,
    value: string
  ) => {
    setDependente((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdicionarDependente = () => {
    // Ajustar validação para dataNascimento em vez de idade
    if (dependente.nome && dependente.parentesco && dependente.dataNascimento) {
      setFormData((prev) => ({
        ...prev,
        dependentes: [...prev.dependentes, dependente],
      }));
      // Resetar estado do dependente para novos inputs
      setDependente({ nome: "", parentesco: "", dataNascimento: "" });
    } else {
      toast({
        title: "Preencha os campos do dependente",
        description:
          "Nome, Parentesco e Data de Nascimento do dependente são obrigatórios.",
        variant: "destructive",
      });
    }
  };

  const handleRemoverDependente = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      dependentes: prev.dependentes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    // Adicionar validação para dataNascimento e endereco do titular
    if (
      !formData.nome ||
      !formData.cpf ||
      !formData.matricula ||
      !formData.celular ||
      !formData.email ||
      !formData.dataNascimento ||
      !formData.endereco
    ) {
      toast({
        title: "Campos obrigatórios",
        description:
          "Por favor, preencha todos os campos obrigatórios do titular.",
        variant: "destructive",
      });
      return;
    }

    onProximo(formData); // Passa os dados para a função do próximo passo
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Informações do Titular</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Campos do Titular */}
          <div>
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Digite seu nome completo"
            />
          </div>

          <div>
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={(e) => handleInputChange("cpf", e.target.value)}
              placeholder="000.000.000-00"
            />
          </div>

          <div>
            <Label htmlFor="matricula">Matrícula *</Label>
            <Input
              id="matricula"
              value={formData.matricula}
              onChange={(e) => handleInputChange("matricula", e.target.value)}
              placeholder="Digite sua matrícula"
            />
          </div>

          <div>
            <Label htmlFor="celular">Celular *</Label>
            <Input
              id="celular"
              value={formData.celular}
              onChange={(e) => handleInputChange("celular", e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          {/* Campos de Data de Nascimento e Endereço do Titular */}
          <div>
            <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
            <Input
              id="dataNascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={(e) =>
                handleInputChange("dataNascimento", e.target.value)
              }
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="endereco">Endereço *</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleInputChange("endereco", e.target.value)}
              placeholder="Endereço completo"
            />
          </div>
        </div>

        {/* Seção de Dependentes */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Dependentes (Opcional)</h3>

          <div className="grid md:grid-cols-4 gap-4 mb-4">
            {/* Campos para adicionar novo dependente */}
            <div>
              <Label htmlFor="dep-nome">Nome do Dependente</Label>
              <Input
                id="dep-nome"
                value={dependente.nome}
                onChange={(e) =>
                  handleDependenteInputChange("nome", e.target.value)
                }
                placeholder="Nome"
              />
            </div>

            <div>
              <Label htmlFor="dep-parentesco">Grau de Parentesco</Label>
              <Input
                id="dep-parentesco"
                value={dependente.parentesco}
                onChange={(e) =>
                  handleDependenteInputChange("parentesco", e.target.value)
                }
                placeholder="Ex: Filho(a)"
              />
            </div>

            <div>
              <Label htmlFor="dep-dataNascimento">Data de Nascimento</Label>
              <Input
                id="dep-dataNascimento"
                type="date"
                value={dependente.dataNascimento}
                onChange={(e) =>
                  handleDependenteInputChange("dataNascimento", e.target.value)
                }
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleAdicionarDependente}
                variant="outline"
                className="w-full"
              >
                Adicionar Dependente +
              </Button>
            </div>
          </div>

          {/* Lista de Dependentes Adicionados */}
          {formData.dependentes.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Dependentes Adicionados:</h4>
              {formData.dependentes.map((dep, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded"
                >
                  <span>
                    {dep.nome} - {dep.parentesco} ({dep.dataNascimento})
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoverDependente(index)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botões de Navegação */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={onAnterior}>
            Voltar
          </Button>
          <Button onClick={handleSubmit}>Próximo: Resumo</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DadosPessoaisForm;
