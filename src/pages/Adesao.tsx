import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Download,
  Home,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAdesao } from "@/hooks/useAdesao";
import { usePdfGenerator } from "@/hooks/usePdfGenerator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import UserExistsModal from "@/components/UserExistsModal";
import { useEffect } from "react";
import { API_BASE_URL } from "@/services/api";

const Adesao = () => {
  const {
    etapaAtual,
    planoSelecionado,
    odontologico,
    dadosTitular,
    dependentes,
    termosAceitos,
    informacoesCorretas,
    loading,
    error,
    userId,
    showUserExistsModal,
    setEtapaAtual,
    setPlanoSelecionado,
    setOdontologico,
    setDadosTitular,
    setTermosAceitos,
    setInformacoesCorretas,
    setShowUserExistsModal,
    adicionarDependente,
    removerDependente,
    atualizarDependente,
    calcularValorTotal,
    proximaEtapa,
    etapaAnterior,
    submitAdesao,
    savePartialProgress,
    setLoading,
    setError,
  } = useAdesao();

  const { generatePDF, isGenerating } = usePdfGenerator();

  const planos = [
    {
      id: "enfermaria",
      nome: "Plano Enfermaria",
      preco: 169,
      descricao:
        "Valor acessível e ideal para quem busca economia com qualidade.",
    },
    {
      id: "apartamento",
      nome: "Plano Apartamento",
      preco: 211,
      descricao: "Mais conforto e privacidade. Atendimento com excelência.",
    },
  ];

  const parentescos = [
    "Cônjuge",
    "Filho(a)",
    "Pai",
    "Mãe",
    "Irmão(ã)",
    "Outro",
  ];

  // Efeito para salvar o progresso sempre que o usuário mudar de etapa
  useEffect(() => {
    // Não salvar automaticamente na etapa final (7) para não sobrescrever o status GREEN
    if (etapaAtual === 7) {
      console.log(
        "Etapa final atingida. Não salvando progresso para preservar status GREEN."
      );
      return;
    }

    // Se o usuário já tiver dados básicos preenchidos
    const saveProgress = async () => {
      if (
        dadosTitular.nome.trim() &&
        dadosTitular.email.trim() &&
        etapaAtual > 1
      ) {
        console.log("Salvando progresso automaticamente na etapa", etapaAtual);
        try {
          const result = await savePartialProgress();
          if (result.success) {
            console.log(
              "Progresso salvo automaticamente, userId:",
              result.userId
            );
          }
        } catch (error) {
          console.error("Erro ao salvar progresso automaticamente:", error);
        }
      }
    };

    saveProgress();
  }, [etapaAtual, dadosTitular, savePartialProgress]); // Salva sempre que a etapa ou os dados do titular mudarem

  // Função para finalizar a adesão
  const finalizarAdesao = async () => {
    if (!termosAceitos || !informacoesCorretas) {
      return;
    }

    const result = await submitAdesao();
    if (result.success) {
      console.log("Adesão realizada com sucesso!", result.userId);
    }
  };

  // Funções para lidar com o modal de usuário existente
  const handleContactSupport = () => {
    // Abrir WhatsApp ou telefone
    window.open("https://wa.me/5562333344444", "_blank");
    setShowUserExistsModal(false);
  };

  const handleTryDifferentData = () => {
    // Voltar para a etapa de dados pessoais
    setShowUserExistsModal(false);
    setEtapaAtual(3);
  };

  const handleContinueWithExisting = async () => {
    // Fechar modal
    setShowUserExistsModal(false);

    try {
      console.log("Continuando adesão com usuário existente");
      setLoading(true);

      // Tentar buscar usuário por email
      const searchResponse = await fetch(
        `${API_BASE_URL}/api/users/search?email=${encodeURIComponent(
          dadosTitular.email
        )}`
      );
      const searchData = await searchResponse.json();

      if (searchData.success && searchData.data && searchData.data.length > 0) {
        const existingUser = searchData.data[0];
        console.log(`Usando usuário existente com ID: ${existingUser.id}`);

        // Usar o hook setError para limpar erros anteriores
        setError(null);

        // Atualizar o userId no estado antes de submeter
        await savePartialProgress();

        // Continuar o processo de adesão
        const adesaoResult = await submitAdesao();

        if (adesaoResult.success) {
          console.log("Adesão continuada com sucesso!");
        }
      } else {
        setError(
          "Não foi possível encontrar o usuário. Tente novamente mais tarde."
        );
      }
    } catch (error) {
      console.error("Erro ao continuar com usuário existente:", error);
      setError(
        "Ocorreu um erro ao continuar com o usuário existente. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  // Função para baixar PDF
  const baixarPDF = async () => {
    const dadosParaPDF = {
      dadosTitular: {
        nome: dadosTitular.nome,
        cpf: dadosTitular.cpf,
        email: dadosTitular.email,
        telefone: dadosTitular.telefone,
        endereco: dadosTitular.endereco,
        cidade: dadosTitular.cidade,
        cep: dadosTitular.cep,
        dataNascimento: dadosTitular.dataNascimento,
      },
      planoSelecionado,
      odontologico,
      dependentes: dependentes.map((dep) => ({
        nome: dep.nome,
        cpf: dep.cpf,
        parentesco: dep.parentesco,
        dataNascimento: dep.dataNascimento,
      })),
      valorTotal: calcularValorTotal(),
      userId: userId || undefined,
    };

    const result = await generatePDF(dadosParaPDF);
    if (result.success) {
      // Mostrar notificação de sucesso
      alert(
        "✅ PDF gerado com sucesso! O download foi iniciado automaticamente."
      );
      console.log("PDF gerado com sucesso:", result.fileName);
    } else {
      alert("❌ Erro ao gerar PDF. Tente novamente.");
      console.error("Erro ao gerar PDF:", result.error);
    }
  };

  const renderEtapa1 = () => (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          1. 🧠 Escolha seu Plano
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={planoSelecionado}
          onValueChange={setPlanoSelecionado}
        >
          <div className="grid md:grid-cols-2 gap-6">
            {planos.map((plano) => (
              <div key={plano.id} className="relative">
                <div
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    planoSelecionado === plano.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <RadioGroupItem value={plano.id} id={plano.id} />
                    <Label
                      htmlFor={plano.id}
                      className="text-xl font-bold cursor-pointer"
                    >
                      {plano.nome}
                    </Label>
                  </div>
                  <p className="text-gray-600 mb-4">{plano.descricao}</p>
                  <div className="text-3xl font-bold text-blue-600">
                    R$ {plano.preco}/mês
                  </div>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>

        <div className="flex justify-center mt-8">
          <Button
            onClick={proximaEtapa}
            disabled={!planoSelecionado}
            className="px-8 py-3"
          >
            Próximo <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEtapa2 = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          2. 🦷 Deseja incluir o plano odontológico?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-8">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
            <div className="text-4xl font-bold text-green-600 mb-2">
              +R$ 25,00
            </div>
            <p className="text-gray-600">Adicional por pessoa</p>
          </div>

          <RadioGroup
            value={odontologico.toString()}
            onValueChange={(value) => setOdontologico(value === "true")}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="sim" />
                <Label htmlFor="sim" className="cursor-pointer">
                  Sim, quero incluir o plano odontológico
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="nao" />
                <Label htmlFor="nao" className="cursor-pointer">
                  Não, apenas o plano médico
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={etapaAnterior}>
            <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
          </Button>
          <Button onClick={proximaEtapa}>
            Próximo <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEtapa3 = () => (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          3. 🧑‍💼 Dados do Titular
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="nome">Nome completo</Label>
            <Input
              id="nome"
              value={dadosTitular.nome}
              onChange={(e) =>
                setDadosTitular({ ...dadosTitular, nome: e.target.value })
              }
              placeholder="Digite seu nome completo"
            />
          </div>
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={dadosTitular.cpf}
              onChange={(e) =>
                setDadosTitular({ ...dadosTitular, cpf: e.target.value })
              }
              placeholder="000.000.000-00"
            />
          </div>
          <div>
            <Label htmlFor="dataNascimento">Data de nascimento</Label>
            <Input
              id="dataNascimento"
              type="date"
              value={dadosTitular.dataNascimento}
              onChange={(e) =>
                setDadosTitular({
                  ...dadosTitular,
                  dataNascimento: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={dadosTitular.telefone}
              onChange={(e) =>
                setDadosTitular({ ...dadosTitular, telefone: e.target.value })
              }
              placeholder="(00) 00000-0000"
            />
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={dadosTitular.email}
              onChange={(e) =>
                setDadosTitular({ ...dadosTitular, email: e.target.value })
              }
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={dadosTitular.cep}
              onChange={(e) =>
                setDadosTitular({ ...dadosTitular, cep: e.target.value })
              }
              placeholder="00000-000"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="endereco">Endereço completo</Label>
            <Input
              id="endereco"
              value={dadosTitular.endereco}
              onChange={(e) =>
                setDadosTitular({ ...dadosTitular, endereco: e.target.value })
              }
              placeholder="Rua, número, bairro"
            />
          </div>
          <div>
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={dadosTitular.cidade}
              onChange={(e) =>
                setDadosTitular({ ...dadosTitular, cidade: e.target.value })
              }
              placeholder="Anicuns"
              className="mb-4"
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={etapaAnterior}>
            <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
          </Button>
          <Button onClick={proximaEtapa}>
            Próximo <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEtapa4 = () => (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          4. 👨‍👩‍👧‍👦 Dependentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dependentes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhum dependente adicionado</p>
            <Button onClick={adicionarDependente} variant="outline">
              <Plus className="mr-2 w-4 h-4" /> Adicionar Dependente
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {dependentes.map((dependente, index) => (
              <div key={dependente.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Dependente {index + 1}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removerDependente(dependente.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome completo</Label>
                    <Input
                      value={dependente.nome}
                      onChange={(e) =>
                        atualizarDependente(
                          dependente.id,
                          "nome",
                          e.target.value
                        )
                      }
                      placeholder="Nome do dependente"
                    />
                  </div>
                  <div>
                    <Label>CPF</Label>
                    <Input
                      value={dependente.cpf}
                      onChange={(e) =>
                        atualizarDependente(
                          dependente.id,
                          "cpf",
                          e.target.value
                        )
                      }
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <Label>Grau de parentesco</Label>
                    <Select
                      value={dependente.parentesco}
                      onValueChange={(value) =>
                        atualizarDependente(dependente.id, "parentesco", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {parentescos.map((parentesco) => (
                          <SelectItem key={parentesco} value={parentesco}>
                            {parentesco}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Data de nascimento</Label>
                    <Input
                      type="date"
                      value={dependente.dataNascimento}
                      onChange={(e) =>
                        atualizarDependente(
                          dependente.id,
                          "dataNascimento",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center">
              <Button onClick={adicionarDependente} variant="outline">
                <Plus className="mr-2 w-4 h-4" /> Adicionar outro dependente
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={etapaAnterior}>
            <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
          </Button>
          <Button onClick={proximaEtapa}>
            Próximo <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEtapa5 = () => {
    const plano = planos.find((p) => p.id === planoSelecionado);
    const valorPlanoTitular = plano ? plano.preco : 0;
    const valorOdontoTitular = odontologico ? 25 : 0;
    const valorTotalTitular = valorPlanoTitular + valorOdontoTitular;

    const valorPlanoDependentes = dependentes.length * valorPlanoTitular;
    const valorOdontoDependentes = odontologico ? dependentes.length * 25 : 0;
    const valorTotalDependentes =
      valorPlanoDependentes + valorOdontoDependentes;

    const valorTotalGeral = valorTotalTitular + valorTotalDependentes;

    return (
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-blue-800 mb-2">
            5. 📋 Resumo da Adesão
          </CardTitle>
          <p className="text-center text-gray-600">
            Confira todos os dados antes de finalizar
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Coluna Esquerda - Dados da Adesão */}
            <div className="space-y-6">
              {/* Plano Selecionado */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-500">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-800">
                    Plano Escolhido
                  </h3>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {plano?.nome}
                </p>
                <p className="text-sm text-gray-600 mb-2">{plano?.descricao}</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-blue-600">
                    R$ {valorPlanoTitular}
                  </span>
                  <span className="text-gray-500 ml-1">/mês por pessoa</span>
                </div>
              </div>

              {/* Adicional Odontológico */}
              <div
                className={`rounded-xl p-6 border-l-4 ${
                  odontologico
                    ? "bg-gradient-to-r from-green-50 to-green-100 border-green-500"
                    : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300"
                }`}
              >
                <div className="flex items-center mb-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      odontologico ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    {odontologico ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-white text-xs">✕</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Plano Odontológico
                  </h3>
                </div>
                <p className="text-lg font-semibold mb-2">
                  {odontologico ? "✅ Incluído" : "❌ Não incluído"}
                </p>
                {odontologico && (
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-green-600">
                      +R$ 25
                    </span>
                    <span className="text-gray-500 ml-1">/mês por pessoa</span>
                  </div>
                )}
              </div>

              {/* Dados do Titular */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border-l-4 border-purple-500">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <h3 className="text-xl font-bold text-purple-800">Titular</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-800">
                    {dadosTitular.nome || "Nome não informado"}
                  </p>
                  <p className="text-sm text-gray-600">
                    CPF: {dadosTitular.cpf || "Não informado"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Email: {dadosTitular.email || "Não informado"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Telefone: {dadosTitular.telefone || "Não informado"}
                  </p>
                </div>
              </div>

              {/* Dependentes */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border-l-4 border-orange-500">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">
                      {dependentes.length}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-orange-800">
                    Dependentes ({dependentes.length})
                  </h3>
                </div>
                {dependentes.length === 0 ? (
                  <p className="text-gray-600 italic">
                    Nenhum dependente adicionado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dependentes.map((dep, index) => (
                      <div
                        key={dep.id}
                        className="bg-white rounded-lg p-3 shadow-sm"
                      >
                        <p className="font-semibold text-gray-800">
                          {dep.nome || `Dependente ${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {dep.parentesco} • CPF: {dep.cpf || "Não informado"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Coluna Direita - Cálculo de Valores */}
            <div className="space-y-6">
              {/* Resumo Financeiro */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-300 shadow-lg">
                <h3 className="text-2xl font-bold text-yellow-800 mb-6 text-center">
                  💰 Resumo Financeiro
                </h3>

                <div className="space-y-4">
                  {/* Titular */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                      <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs">T</span>
                      </span>
                      Titular
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Plano {plano?.nome?.replace("Plano ", "")}</span>
                        <span className="font-semibold">
                          R$ {valorPlanoTitular}
                        </span>
                      </div>
                      {odontologico && (
                        <div className="flex justify-between">
                          <span>Odontológico</span>
                          <span className="font-semibold">R$ 25</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold text-purple-600">
                        <span>Subtotal Titular:</span>
                        <span>R$ {valorTotalTitular}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dependentes */}
                  {dependentes.length > 0 && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                        <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white text-xs">
                            {dependentes.length}
                          </span>
                        </span>
                        Dependentes ({dependentes.length})
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>
                            Plano {plano?.nome?.replace("Plano ", "")} ×{" "}
                            {dependentes.length}
                          </span>
                          <span className="font-semibold">
                            R$ {valorPlanoDependentes}
                          </span>
                        </div>
                        {odontologico && (
                          <div className="flex justify-between">
                            <span>Odontológico × {dependentes.length}</span>
                            <span className="font-semibold">
                              R$ {valorOdontoDependentes}
                            </span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between font-bold text-orange-600">
                          <span>Subtotal Dependentes:</span>
                          <span>R$ {valorTotalDependentes}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Total Geral */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
                    <div className="text-center">
                      <p className="text-green-100 mb-2">Valor Total Mensal</p>
                      <p className="text-4xl font-bold mb-2">
                        R$ {valorTotalGeral}
                      </p>
                      <p className="text-green-100 text-sm">
                        {dependentes.length + 1} pessoa
                        {dependentes.length > 0 ? "s" : ""} coberta
                        {dependentes.length > 0 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={etapaAnterior} className="px-8">
              <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
            </Button>
            <Button
              onClick={proximaEtapa}
              className="px-8 bg-green-600 hover:bg-green-700"
            >
              Continuar para Termos <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEtapa6 = () => (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          6. ✅ Termo de Compromisso
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-bold mb-4">
            TERMO DE COMPROMISSO E ADESÃO
          </h3>
          <h4 className="font-bold mb-2">
            PLANO BRASIL SAÚDE PARA SERVIDORES DE ANICUNS
          </h4>

          <div className="space-y-4 text-sm">
            <div>
              <h5 className="font-bold">1. OBJETO DO CONTRATO</h5>
              <p>
                O presente termo estabelece as condições para adesão ao Plano
                Brasil Saúde destinado exclusivamente aos servidores públicos
                municipais de Anicuns e seus dependentes legais.
              </p>
            </div>

            <div>
              <h5 className="font-bold">2. COBERTURA ASSISTENCIAL</h5>
              <p>
                O plano oferece cobertura médica e hospitalar de acordo com o
                rol de procedimentos da ANS, incluindo consultas médicas, exames
                complementares, internações hospitalares, procedimentos
                cirúrgicos e atendimento de urgência e emergência 24 horas.
              </p>
            </div>

            <div>
              <h5 className="font-bold">3. MENSALIDADE E FORMA DE PAGAMENTO</h5>
              <p>
                O valor da mensalidade será descontado diretamente em folha de
                pagamento do servidor, conforme autorização específica.
              </p>
            </div>

            <div>
              <h5 className="font-bold">4. CARÊNCIAS</h5>
              <p>
                Consultas e exames: sem carência. Internações e procedimentos
                cirúrgicos: 180 dias. Partos: 300 dias.
              </p>
            </div>

            <div>
              <h5 className="font-bold">5. DEPENDENTES</h5>
              <p>
                Podem ser incluídos como dependentes: cônjuge ou companheiro(a),
                filhos solteiros até 21 anos ou até 24 anos se universitários,
                filhos inválidos de qualquer idade.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="termos"
              checked={termosAceitos}
              onCheckedChange={(checked) =>
                setTermosAceitos(checked as boolean)
              }
            />
            <Label htmlFor="termos" className="cursor-pointer">
              Li e concordo com os termos de compromisso e adesão ao Plano
              Brasil Saúde para Servidores de Anicuns.
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="informacoes"
              checked={informacoesCorretas}
              onCheckedChange={(checked) =>
                setInformacoesCorretas(checked as boolean)
              }
            />
            <Label htmlFor="informacoes" className="cursor-pointer">
              Declaro que as informações fornecidas estão corretas e autorizo o
              desconto em folha de pagamento.
            </Label>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={etapaAnterior} disabled={loading}>
            <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
          </Button>
          <Button
            onClick={finalizarAdesao}
            disabled={!termosAceitos || !informacoesCorretas || loading}
            className={
              termosAceitos && informacoesCorretas
                ? "bg-green-600 hover:bg-green-700"
                : ""
            }
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Finalizar Adesão <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEtapa7 = () => (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          7. 🎉 Confirmação Final
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-green-700 mb-4">Parabéns!</h3>
          <p className="text-lg text-gray-700 mb-4">
            Sua adesão foi concluída com sucesso. Em breve, nossa equipe entrará
            em contato para finalizar os detalhes do seu plano.
          </p>
          {userId && (
            <div className="bg-white border border-green-200 rounded-lg p-4 text-left">
              <h4 className="font-bold text-green-700 mb-2">
                Dados da Adesão:
              </h4>
              <p>
                <strong>ID do Usuário:</strong> {userId}
              </p>
              <p>
                <strong>Nome:</strong> {dadosTitular.nome}
              </p>
              <p>
                <strong>Email:</strong> {dadosTitular.email}
              </p>
              <p>
                <strong>Plano:</strong>{" "}
                {planoSelecionado === "apartamento"
                  ? "Apartamento"
                  : "Enfermaria"}
              </p>
              <p>
                <strong>Odontológico:</strong> {odontologico ? "Sim" : "Não"}
              </p>
              <p>
                <strong>Dependentes:</strong> {dependentes.length}
              </p>
              <p>
                <strong>Valor Total:</strong> R$ {calcularValorTotal()}/mês
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Button
            onClick={baixarPDF}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 w-4 h-4" />
                Baixar resumo em PDF
              </>
            )}
          </Button>

          <div>
            <Link to="/">
              <Button variant="outline">
                <Home className="mr-2 w-4 h-4" /> Voltar ao início
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEtapaAtual = () => {
    switch (etapaAtual) {
      case 1:
        return renderEtapa1();
      case 2:
        return renderEtapa2();
      case 3:
        return renderEtapa3();
      case 4:
        return renderEtapa4();
      case 5:
        return renderEtapa5();
      case 6:
        return renderEtapa6();
      case 7:
        return renderEtapa7();
      default:
        return renderEtapa1();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Alerta de Erro */}
        {error && (
          <Alert className="max-w-4xl mx-auto mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Indicator */}
        {etapaAtual < 7 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4, 5, 6].map((etapa) => (
                <div key={etapa} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      etapa <= etapaAtual
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {etapa}
                  </div>
                  {etapa < 6 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        etapa < etapaAtual ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {renderEtapaAtual()}
      </div>

      <Footer />

      {/* Modal de Usuário Existente */}
      {showUserExistsModal && (
        <UserExistsModal
          email={dadosTitular.email}
          cpf={dadosTitular.cpf}
          onClose={() => setShowUserExistsModal(false)}
          onContactSupport={handleContactSupport}
          onTryDifferentData={handleTryDifferentData}
          onContinueWithExisting={handleContinueWithExisting}
        />
      )}
    </div>
  );
};

export default Adesao;
