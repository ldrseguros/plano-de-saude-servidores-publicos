import { useState } from "react";
import {
  createUser,
  createDependent,
  CreateUserRequest,
  CreateDependentRequest,
  apiService,
  API_BASE_URL,
  updateDependentsBulk,
} from "@/services/api";

export interface Dependente {
  id: string;
  nome: string;
  cpf: string;
  parentesco: string;
  dataNascimento: string;
}

export interface DadosTitular {
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  cep: string;
}

export interface AdesaoState {
  etapaAtual: number;
  planoSelecionado: string;
  odontologico: boolean;
  dadosTitular: DadosTitular;
  dependentes: Dependente[];
  termosAceitos: boolean;
  informacoesCorretas: boolean;
  loading: boolean;
  error: string | null;
  userId: string | null;
  showUserExistsModal: boolean;
}

const initialState: AdesaoState = {
  etapaAtual: 1,
  planoSelecionado: "",
  odontologico: false,
  dadosTitular: {
    nome: "",
    cpf: "",
    dataNascimento: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    cep: "",
  },
  dependentes: [],
  termosAceitos: false,
  informacoesCorretas: false,
  loading: false,
  error: null,
  userId: null,
  showUserExistsModal: false,
};

export const useAdesao = () => {
  const [state, setState] = useState<AdesaoState>(initialState);

  const updateState = (updates: Partial<AdesaoState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const setEtapaAtual = (etapa: number) => {
    updateState({ etapaAtual: etapa });
  };

  const setPlanoSelecionado = (plano: string) => {
    updateState({ planoSelecionado: plano });
  };

  const setOdontologico = (odonto: boolean) => {
    updateState({ odontologico: odonto });
  };

  const setDadosTitular = (dados: DadosTitular) => {
    updateState({ dadosTitular: dados });
  };

  const setDependentes = (deps: Dependente[]) => {
    updateState({ dependentes: deps });
  };

  const setTermosAceitos = (aceitos: boolean) => {
    updateState({ termosAceitos: aceitos });
  };

  const setInformacoesCorretas = (corretas: boolean) => {
    updateState({ informacoesCorretas: corretas });
  };

  const setLoading = (loading: boolean) => {
    updateState({ loading });
  };

  const setError = (error: string | null) => {
    updateState({ error });
  };

  const setShowUserExistsModal = (show: boolean) => {
    updateState({ showUserExistsModal: show });
  };

  const adicionarDependente = () => {
    const novoDependente: Dependente = {
      id: Date.now().toString(),
      nome: "",
      cpf: "",
      parentesco: "",
      dataNascimento: "",
    };
    setDependentes([...state.dependentes, novoDependente]);
  };

  const removerDependente = (id: string) => {
    setDependentes(state.dependentes.filter((dep) => dep.id !== id));
  };

  const atualizarDependente = (id: string, campo: string, valor: string) => {
    setDependentes(
      state.dependentes.map((dep) =>
        dep.id === id ? { ...dep, [campo]: valor } : dep
      )
    );
  };

  const calcularValorTotal = () => {
    const planos = [
      { id: "enfermaria", preco: 169 },
      { id: "apartamento", preco: 211 },
    ];

    const plano = planos.find((p) => p.id === state.planoSelecionado);
    const valorPlano = plano ? plano.preco : 0;
    const valorOdonto = state.odontologico ? 25 : 0;
    const valorDependentes =
      state.dependentes.length * (valorPlano + valorOdonto);
    return valorPlano + valorOdonto + valorDependentes;
  };

  const proximaEtapa = () => {
    setEtapaAtual(state.etapaAtual + 1);
  };

  const etapaAnterior = () => {
    setEtapaAtual(state.etapaAtual - 1);
  };

  const resetForm = () => {
    setState(initialState);
  };

  // Função para salvar progresso parcial (usuário começou mas não terminou)
  const savePartialProgress = async () => {
    if (!state.dadosTitular.nome || !state.dadosTitular.email) {
      return { success: false, error: "Dados mínimos não informados" }; // Não salvar se não tiver dados mínimos
    }

    try {
      // Verificar se usuário já existe
      let userId = state.userId;

      // Se temos ID, verificar se a adesão já foi finalizada (localStorage)
      if (userId) {
        try {
          const isCompleted = localStorage.getItem(
            `completed_enrollment_${userId}`
          );
          if (isCompleted === "true") {
            console.log(
              `Adesão do usuário ${userId} já foi finalizada. Não atualizando status.`
            );
            return { success: true, userId };
          }
        } catch (e) {
          console.error("Erro ao verificar localStorage:", e);
        }
      }

      console.log("Salvando progresso parcial...");

      // Preparar dados básicos do usuário
      const userData: CreateUserRequest = {
        name: state.dadosTitular.nome,
        email: state.dadosTitular.email,
        phone: state.dadosTitular.telefone || "Não informado",
        cpf: state.dadosTitular.cpf || "Não informado",
        birthDate:
          state.dadosTitular.dataNascimento || new Date().toISOString(),
        address: state.dadosTitular.endereco || "Não informado",
        city: state.dadosTitular.cidade || "Não informado",
        state: "GO",
        zipCode: state.dadosTitular.cep || "Não informado",
        organization: "Servidor Público",
        position: "Servidor",
        employeeId: `SP${Date.now()}`,
        planType:
          state.planoSelecionado === "apartamento" ? "PRIVATE_ROOM" : "WARD",
        hasOdontologico: state.odontologico,
      };

      // Verificar se o usuário já existe
      if (!userId) {
        // Primeiro, verificar se o usuário já existe
        try {
          const searchResponse = await fetch(
            `${API_BASE_URL}/api/users/search?email=${encodeURIComponent(
              userData.email
            )}`
          );
          const searchData = await searchResponse.json();

          if (
            searchData.success &&
            searchData.data &&
            searchData.data.length > 0
          ) {
            // Usuário já existe
            userId = searchData.data[0].id;
            console.log(`Usuário já existe, ID recuperado: ${userId}`);

            // Atualizar dados
            const userUpdateData = { ...userData };
            delete userUpdateData.planType;
            delete userUpdateData.hasOdontologico;

            await apiService.updateUser(userId, userUpdateData);
          } else {
            // Usuário não existe, criar novo
            console.log("Usuário não encontrado, criando novo...");
            const userResponse = await createUser(userData);
            userId = userResponse.data.id;
            console.log("Usuário criado com ID:", userId);
          }
        } catch (error) {
          // Se houver erro na busca, tentar criar diretamente
          console.error("Erro ao verificar usuário existente:", error);

          try {
            // Tentar criar usuário
            const userResponse = await createUser(userData);
            userId = userResponse.data.id;
            console.log("Usuário criado com ID:", userId);
          } catch (createError) {
            // Se o usuário já existir, vamos buscar pelo email
            if (
              createError instanceof Error &&
              createError.message.includes("already exists")
            ) {
              console.log("Usuário já existe, buscando por email...");

              // Buscar pelo email para obter o ID
              const response = await fetch(
                `${API_BASE_URL}/api/users/search?email=${encodeURIComponent(
                  userData.email
                )}`
              );
              const data = await response.json();

              if (data.success && data.data && data.data.length > 0) {
                userId = data.data[0].id;
                console.log("Usuário encontrado com ID:", userId);
              } else {
                throw new Error(
                  "Não foi possível encontrar o usuário existente"
                );
              }
            } else {
              throw createError;
            }
          }
        }
      } else {
        console.log(`Usando ID existente: ${userId}`);
      }

      updateState({ userId });

      // Determinar etapa atual baseada no progresso
      let currentStep = "PERSONAL_DATA";

      if (state.dependentes.length > 0) {
        currentStep = "DEPENDENTS_DATA";
      } else if (state.planoSelecionado) {
        currentStep = "PLAN_SELECTION";
      }

      // Verificar o status atual do usuário antes de atualizar
      try {
        const userCheck = await apiService.getUser(userId);
        console.log(
          "Status atual antes da atualização:",
          userCheck.data.leadStatus,
          userCheck.data.currentStep
        );

        // Não rebaixar status se já estiver GREEN (finalizado)
        if (userCheck.data.leadStatus === "GREEN") {
          console.log(
            "Usuário já está com status GREEN (finalizado). Mantendo status atual."
          );
          return { success: true, userId };
        }
      } catch (error) {
        console.error("Erro ao verificar status atual do usuário:", error);
      }

      // Forçar atualização para YELLOW apenas se não estiver finalizado
      console.log(`Atualizando status para YELLOW, etapa: ${currentStep}`);

      // Usar chamada direta para garantir a atualização
      const statusResponse = await fetch(
        `${API_BASE_URL}/api/users/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadStatus: "YELLOW",
            currentStep: currentStep,
            notes: "Processo de adesão em andamento",
          }),
        }
      );

      const statusResult = await statusResponse.json();
      console.log("Resultado da atualização de status:", statusResult);

      // Verificar se o status foi atualizado corretamente
      const userCheckAfter = await apiService.getUser(userId);
      console.log("Status atual do usuário:", userCheckAfter.data.leadStatus);

      return { success: true, userId };
    } catch (error) {
      console.error("Erro ao salvar progresso parcial:", error);
      return { success: false, error };
    }
  };

  // Função para submeter a adesão
  const submitAdesao = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Iniciando processo de adesão final...");

      // Preparar dados do usuário
      const userData: CreateUserRequest = {
        name: state.dadosTitular.nome,
        email: state.dadosTitular.email,
        phone: state.dadosTitular.telefone,
        cpf: state.dadosTitular.cpf,
        birthDate: state.dadosTitular.dataNascimento,
        address: state.dadosTitular.endereco,
        city: state.dadosTitular.cidade,
        state: "GO", // Assumindo Goiás como padrão
        zipCode: state.dadosTitular.cep,
        organization: "Servidor Público", // Valor padrão
        position: "Servidor", // Valor padrão
        employeeId: `SP${Date.now()}`, // ID temporário
        planType:
          state.planoSelecionado === "apartamento" ? "PRIVATE_ROOM" : "WARD",
        hasOdontologico: state.odontologico,
      };

      // Verificar se usuário já existe
      let userId = state.userId;

      if (!userId) {
        try {
          // Tentar buscar usuário existente por email ou CPF
          console.log("Verificando se usuário já existe...");
          const searchResponse = await fetch(
            `${API_BASE_URL}/api/users/search?email=${encodeURIComponent(
              userData.email
            )}&cpf=${encodeURIComponent(userData.cpf || "")}`
          );
          const searchData = await searchResponse.json();

          if (
            searchData.success &&
            searchData.data &&
            searchData.data.length > 0
          ) {
            userId = searchData.data[0].id;
            console.log(
              `Usuário já existe no sistema com ID: ${userId}. Atualizando dados...`
            );

            // Remover campos que não existem no modelo User do Prisma
            const userUpdateData = { ...userData };
            delete userUpdateData.planType;
            delete userUpdateData.hasOdontologico;

            await apiService.updateUser(userId, userUpdateData);
          } else {
            // Criar novo usuário
            console.log("Usuário não encontrado. Criando novo...");
            const userResponse = await createUser(userData);
            userId = userResponse.data.id;
            console.log("Usuário criado com sucesso, ID:", userId);
          }
        } catch (error) {
          // Se houver erro na busca, tentar criar mesmo assim
          console.error("Erro ao verificar usuário existente:", error);

          // Tentar criar o usuário
          try {
            const userResponse = await createUser(userData);
            userId = userResponse.data.id;
            console.log(
              "Usuário criado com sucesso após erro na verificação, ID:",
              userId
            );
          } catch (createError) {
            // Se o erro for de usuário já existente, buscar o ID
            if (
              createError instanceof Error &&
              createError.message.includes("already exists")
            ) {
              console.log("Usuário já existe, buscando ID...");

              const searchResponse = await fetch(
                `${API_BASE_URL}/api/users/search?email=${encodeURIComponent(
                  userData.email
                )}`
              );
              const searchData = await searchResponse.json();

              if (
                searchData.success &&
                searchData.data &&
                searchData.data.length > 0
              ) {
                userId = searchData.data[0].id;
                console.log(`Recuperado ID do usuário existente: ${userId}`);
              } else {
                throw new Error(
                  "Não foi possível recuperar o ID do usuário existente."
                );
              }
            } else {
              throw createError;
            }
          }
        }
      } else {
        // Se já temos userId, apenas atualizar os dados
        console.log(`Usando ID existente ${userId}. Atualizando dados...`);

        // Remover campos que não existem no modelo User do Prisma
        const userUpdateData = { ...userData };
        delete userUpdateData.planType;
        delete userUpdateData.hasOdontologico;

        await apiService.updateUser(userId, userUpdateData);
      }

      updateState({ userId });

      console.log("Atualizando status para YELLOW (PERSONAL_DATA)");
      // Atualizar status inicial para YELLOW (processo iniciado)
      await apiService.updateUserStatus(userId, "YELLOW", "PERSONAL_DATA");

      // Pausa para garantir que a atualização seja processada
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Criar dependentes se houver
      if (state.dependentes.length > 0) {
        // Atualizar para etapa de dependentes
        await apiService.updateUserStatus(userId, "YELLOW", "DEPENDENTS_DATA");
        console.log("Status atualizado para YELLOW (DEPENDENTS_DATA)");

        // Pausa para garantir que a atualização seja processada
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Processar dependentes em lote
        try {
          console.log(
            `Processando ${state.dependentes.length} dependentes em lote`
          );

          // Preparar dados dos dependentes
          const dependentsData = state.dependentes.map((dep) => ({
            name: dep.nome,
            cpf: dep.cpf,
            birthDate: dep.dataNascimento,
            relationship: dep.parentesco,
            planType: (state.planoSelecionado === "apartamento"
              ? "PRIVATE_ROOM"
              : "WARD") as "PRIVATE_ROOM" | "WARD",
            userId,
          }));

          // Atualizar dependentes em lote
          const bulkResult = await updateDependentsBulk(
            userId,
            dependentsData,
            true
          );

          console.log(
            "Resultado da atualização em lote dos dependentes:",
            bulkResult
          );

          if (bulkResult.success) {
            console.log(
              `Dependentes processados: ${bulkResult.data.summary.created} criados, ` +
                `${bulkResult.data.summary.updated} atualizados, ` +
                `${bulkResult.data.summary.deleted} removidos`
            );
          }
        } catch (error) {
          console.error("Erro ao processar dependentes em lote:", error);

          // Fallback para o método anterior caso ocorra algum erro
          console.log(
            "Usando método de fallback para adicionar dependentes individualmente"
          );

          for (const dependente of state.dependentes) {
            const dependentData: CreateDependentRequest = {
              userId,
              name: dependente.nome,
              cpf: dependente.cpf,
              birthDate: dependente.dataNascimento,
              relationship: dependente.parentesco,
              planType:
                state.planoSelecionado === "apartamento"
                  ? "PRIVATE_ROOM"
                  : "WARD",
            };

            try {
              await createDependent(dependentData);
              console.log(
                `Dependente ${dependente.nome} adicionado com sucesso`
              );
            } catch (error) {
              console.error(
                `Erro ao adicionar dependente ${dependente.nome}:`,
                error
              );
              // Continuar mesmo se houver erro em um dependente
            }
          }
        }
      }

      // Atualizar para etapa de seleção de plano com status YELLOW
      await apiService.updateUserStatus(userId, "YELLOW", "PLAN_SELECTION");
      console.log("Status atualizado para YELLOW (PLAN_SELECTION)");

      // Pausa para garantir que a atualização seja processada
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Salvar detalhes do plano selecionado como um passo completo
      try {
        const planSelectionData = {
          planType:
            state.planoSelecionado === "apartamento" ? "PRIVATE_ROOM" : "WARD",
          hasOdontologico: state.odontologico,
          monthlyValue: calcularValorTotal(),
        };

        // Usar a API para completar o passo de seleção de plano
        await fetch(
          `${API_BASE_URL}/api/enrollment/user/${userId}/step/PLAN_SELECTION/complete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              notes: `Plano ${state.planoSelecionado}, Odonto: ${
                state.odontologico ? "Sim" : "Não"
              }`,
              stepData: planSelectionData,
            }),
          }
        );

        console.log("Detalhes do plano salvos com sucesso:", planSelectionData);
      } catch (error) {
        console.error("Erro ao salvar detalhes do plano:", error);
        // Continuar mesmo com erro
      }

      // Simular progresso através das etapas restantes
      await apiService.updateUserStatus(userId, "YELLOW", "DOCUMENTS");
      console.log("Status atualizado para YELLOW (DOCUMENTS)");

      // Pausa para garantir que a atualização seja processada
      await new Promise((resolve) => setTimeout(resolve, 300));

      await apiService.updateUserStatus(userId, "YELLOW", "PAYMENT");
      console.log("Status atualizado para YELLOW (PAYMENT)");

      // Pausa para garantir que a atualização seja processada
      await new Promise((resolve) => setTimeout(resolve, 300));

      await apiService.updateUserStatus(userId, "YELLOW", "ANALYSIS");
      console.log("Status atualizado para YELLOW (ANALYSIS)");

      // Pausa para garantir que a atualização seja processada
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Forçar uma atualização direta do status para GREEN usando a API
      const directUpdateResponse = await fetch(
        `${API_BASE_URL}/api/users/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadStatus: "GREEN",
            currentStep: "APPROVAL",
            notes: "Adesão finalizada com sucesso",
          }),
        }
      );

      const directUpdateResult = await directUpdateResponse.json();
      console.log(
        "Resultado da atualização direta para GREEN:",
        directUpdateResult
      );

      // Garantir atualização final com status GREEN na aprovação
      await apiService.updateUserStatus(userId, "GREEN", "APPROVAL");
      console.log("Status final atualizado para GREEN (APPROVAL)");

      // Verificar o status atual depois de todas as atualizações
      const userCheck = await apiService.getUser(userId);
      console.log("Status final do usuário:", userCheck.data.leadStatus);

      // Se por algum motivo o status não estiver GREEN, tentar novamente com chamada direta
      if (userCheck.data.leadStatus !== "GREEN") {
        console.log("Status não está GREEN, tentando atualizar novamente...");

        try {
          // Tentar mais uma vez com uma nova chamada direta
          const finalUpdateResponse = await fetch(
            `${API_BASE_URL}/api/users/${userId}/status`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                leadStatus: "GREEN",
                currentStep: "APPROVAL",
                notes: "Adesão finalizada com sucesso - Correção final",
              }),
            }
          );

          const finalUpdateResult = await finalUpdateResponse.json();
          console.log(
            "Resultado da correção final para GREEN:",
            finalUpdateResult
          );

          // Marcar no localStorage que este usuário tem adesão finalizada
          try {
            localStorage.setItem(`completed_enrollment_${userId}`, "true");
            console.log(
              `Marcado no localStorage que o usuário ${userId} tem adesão finalizada`
            );
          } catch (e) {
            console.error("Erro ao salvar no localStorage:", e);
          }
        } catch (finalError) {
          console.error("Erro na correção final do status:", finalError);
        }
      } else {
        // Marcar no localStorage que este usuário tem adesão finalizada
        try {
          localStorage.setItem(`completed_enrollment_${userId}`, "true");
          console.log(
            `Marcado no localStorage que o usuário ${userId} tem adesão finalizada`
          );
        } catch (e) {
          console.error("Erro ao salvar no localStorage:", e);
        }
      }

      // Ir para a etapa final
      setEtapaAtual(7);

      return { success: true, userId };
    } catch (error) {
      let errorMessage = "Erro desconhecido";

      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          // Mostrar modal específico para usuário existente
          console.log(
            "Usuário já existe, mostrando modal de usuário existente"
          );
          setShowUserExistsModal(true);
          return { success: false, error: "USER_EXISTS", showModal: true };
        } else if (error.message.includes("validation")) {
          errorMessage =
            "Dados inválidos. Verifique se todos os campos estão preenchidos corretamente.";
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "Erro de conexão. Verifique sua internet e tente novamente.";
        } else {
          errorMessage = error.message;
        }
      }

      console.error("Erro no processo de adesão:", error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    // Estado
    ...state,

    // Setters
    setEtapaAtual,
    setPlanoSelecionado,
    setOdontologico,
    setDadosTitular,
    setDependentes,
    setTermosAceitos,
    setInformacoesCorretas,
    setLoading,
    setError,
    setShowUserExistsModal,

    // Ações
    adicionarDependente,
    removerDependente,
    atualizarDependente,
    calcularValorTotal,
    proximaEtapa,
    etapaAnterior,
    resetForm,
    submitAdesao,
    savePartialProgress,
  };
};
