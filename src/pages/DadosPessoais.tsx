
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdesaoStore, DadosPessoais } from "@/store/adesaoStore";
import ProgressIndicator from "@/components/ProgressIndicator";
import { useToast } from "@/hooks/use-toast";

const DadosPessoaisPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setDadosPessoais, etapaAtual } = useAdesaoStore();
  
  const [formData, setFormData] = useState<DadosPessoais>({
    nome: "",
    cpf: "",
    matricula: "",
    celular: "",
    email: "",
    dependentes: []
  });

  const [dependente, setDependente] = useState({
    nome: "",
    parentesco: "",
    idade: 0
  });

  const handleInputChange = (field: keyof DadosPessoais, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdicionarDependente = () => {
    if (dependente.nome && dependente.parentesco && dependente.idade > 0) {
      setFormData(prev => ({
        ...prev,
        dependentes: [...prev.dependentes, dependente]
      }));
      setDependente({ nome: "", parentesco: "", idade: 0 });
    }
  };

  const handleRemoverDependente = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dependentes: prev.dependentes.filter((_, i) => i !== index)
    }));
  };

  const handleContinuar = () => {
    if (!formData.nome || !formData.cpf || !formData.matricula || !formData.celular || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setDadosPessoais(formData);
    navigate("/revisao");
    window.scrollTo(0, 0);
  };

  const handleVoltar = () => {
    navigate("/adesao");
    window.scrollTo(0, 0);
  };

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
            Dados Pessoais
          </h1>
          <p className="text-gray-600 text-lg">
            Preencha suas informações pessoais para continuar
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Informações do Titular</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
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
            </div>

            {/* Seção de Dependentes */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Dependentes (Opcional)</h3>
              
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="dep-nome">Nome do Dependente</Label>
                  <Input
                    id="dep-nome"
                    value={dependente.nome}
                    onChange={(e) => setDependente(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dep-parentesco">Parentesco</Label>
                  <Input
                    id="dep-parentesco"
                    value={dependente.parentesco}
                    onChange={(e) => setDependente(prev => ({ ...prev, parentesco: e.target.value }))}
                    placeholder="Ex: Filho(a)"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dep-idade">Idade</Label>
                  <Input
                    id="dep-idade"
                    type="number"
                    value={dependente.idade || ""}
                    onChange={(e) => setDependente(prev => ({ ...prev, idade: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button 
                    type="button" 
                    onClick={handleAdicionarDependente}
                    variant="outline"
                    className="w-full"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>

              {formData.dependentes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Dependentes Adicionados:</h4>
                  {formData.dependentes.map((dep, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <span>{dep.nome} - {dep.parentesco} ({dep.idade} anos)</span>
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
          </CardContent>
        </Card>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleVoltar}>
            Voltar
          </Button>
          <Button onClick={handleContinuar}>
            Continuar para Revisão
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DadosPessoaisPage;
