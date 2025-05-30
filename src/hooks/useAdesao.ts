import { useState, useRef } from "react";
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
  showSignaturePad: boolean;
  signatureData: string | null;
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
  showSignaturePad: false,
  signatureData: null,
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
    if (aceitos && !state.signatureData) {
      updateState({ showSignaturePad: true });
    }
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

  const setShowSignaturePad = (show: boolean) => {
    updateState({ showSignaturePad: show });
  };

  const setSignatureData = (signatureData: string | null) => {
    updateState({ signatureData });
  };

  const handleSignatureSave = (signatureData: string) => {
    setSignatureData(signatureData);
    setShowSignaturePad(false);
  };

  const handleSignatureCancel = () => {
    setShowSignaturePad(false);
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
    // Verificar se há uma flag indicando erro recente para evitar repetição
    const lastErrorTime = localStorage.getItem("last_api_error_time");
    const now = Date.now();

    if (lastErrorTime && now - parseInt(lastErrorTime) < 10000) {
      // 10 segundos
      console.log("Ignorando salvamento devido a erro recente na API");
      return {
        success: false,
        error: "Erro recente na API, tentando novamente mais tarde",
      };
    }

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

          // Verificar se já salvamos recentemente
          const lastSaveTime = localStorage.getItem(`last_save_time_${userId}`);
          if (lastSaveTime) {
            const now = Date.now();
            if (now - parseInt(lastSaveTime) < 5000) {
              // 5 segundos
              console.log(`Salvamento recente para ${userId}. Ignorando.`);
              return { success: true, userId };
            }
          }
        } catch (e) {
          console.error("Erro ao verificar localStorage:", e);
        }
      }

      console.log("Salvando progresso parcial...");

      // Se já temos userId, retornar sem fazer chamada à API
      if (userId && !userId.toString().startsWith("temp_")) {
        console.log(`Usando ID existente: ${userId}`);
        localStorage.setItem(`last_save_time_${userId}`, Date.now().toString());
        return { success: true, userId };
      }

      // A partir daqui, apenas executar o código se não tivermos userId válido
      try {
        // Primeiro, tentar buscar se o usuário já existe
        console.log("Verificando se usuário já existe por email/CPF...");
        const searchResponse = await fetch(
          `${API_BASE_URL}/api/users/search?email=${encodeURIComponent(
            state.dadosTitular.email
          )}&cpf=${encodeURIComponent(state.dadosTitular.cpf || "")}`
        );

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();

          if (
            searchData.success &&
            searchData.data &&
            searchData.data.length > 0
          ) {
            userId = searchData.data[0].id;
            console.log(
              `Usuário já existe com ID: ${userId}. Usando usuário existente.`
            );
            updateState({ userId });
            localStorage.setItem(
              `last_save_time_${userId}`,
              Date.now().toString()
            );
            return { success: true, userId };
          }
        }

        // Se chegou aqui, usuário não existe - criar novo
        console.log("Usuário não existe. Criando novo usuário...");

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

        // Tentar criar usuário
        const userResponse = await createUser(userData);
        userId = userResponse.data.id;
        console.log("Usuário criado com ID:", userId);

        // Salvar ID e tempo no localStorage
        updateState({ userId });
        localStorage.setItem(`last_save_time_${userId}`, Date.now().toString());
        return { success: true, userId };
      } catch (error) {
        console.error("Erro ao processar usuário:", error);

        // Se o erro é que o usuário já existe, tentar buscar o ID
        if (
          error instanceof Error &&
          error.message.includes("already exists")
        ) {
          console.log("Usuário já existe, tentando buscar ID...");

          try {
            const searchResponse = await fetch(
              `${API_BASE_URL}/api/users/search?email=${encodeURIComponent(
                state.dadosTitular.email
              )}`
            );

            if (searchResponse.ok) {
              const searchData = await searchResponse.json();

              if (
                searchData.success &&
                searchData.data &&
                searchData.data.length > 0
              ) {
                userId = searchData.data[0].id;
                console.log(`Recuperado ID do usuário existente: ${userId}`);
                updateState({ userId });
                localStorage.setItem(
                  `last_save_time_${userId}`,
                  Date.now().toString()
                );
                return { success: true, userId };
              }
            }
          } catch (searchError) {
            console.error("Erro ao buscar usuário existente:", searchError);
          }
        }

        // Marcar erro recente para evitar ciclos repetidos
        localStorage.setItem("last_api_error_time", Date.now().toString());

        // Gerar ID temporário local se não conseguirmos criar/encontrar usuário no servidor
        if (!userId) {
          const tempId = `temp_${Date.now()}`;
          console.log("Criando ID temporário local:", tempId);
          updateState({ userId: tempId });
          return { success: true, userId: tempId };
        }

        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error("Erro ao salvar progresso parcial:", error);

      // Marcar erro recente para evitar ciclos repetidos
      localStorage.setItem("last_api_error_time", Date.now().toString());

      return { success: false, error: error.message };
    }
  };

  // Função para submeter a adesão
  const submitAdesao = async () => {
    if (
      !state.termosAceitos ||
      !state.informacoesCorretas ||
      !state.signatureData
    ) {
      setError(
        "É necessário aceitar os termos e desenhar sua assinatura para finalizar a adesão."
      );
      return { success: false, error: "MISSING_SIGNATURE" };
    }

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
      let needToCreateUser = false;

      // Se temos um ID temporário ou nenhum ID, precisamos criar um usuário real no banco
      if (!userId || (userId && userId.toString().startsWith("temp_"))) {
        if (userId && userId.toString().startsWith("temp_")) {
          console.log(
            `ID temporário detectado: ${userId}. Precisamos criar um usuário real.`
          );
        } else {
          console.log("Nenhum ID de usuário. Precisamos criar um novo.");
        }
        needToCreateUser = true;
      }

      // Se precisamos criar um usuário real, primeiro verificar se já existe por email/CPF
      if (needToCreateUser) {
        try {
          console.log("Verificando se usuário já existe por email/CPF...");
          const searchResponse = await fetch(
            `${API_BASE_URL}/api/users/search?email=${encodeURIComponent(
              userData.email
            )}&cpf=${encodeURIComponent(userData.cpf || "")}`
          );

          if (!searchResponse.ok) {
            console.log("Erro na busca de usuário. Criando um novo.");
            const userResponse = await createUser(userData);
            userId = userResponse.data.id;
            console.log("Usuário criado com sucesso, ID:", userId);
          } else {
            const searchData = await searchResponse.json();

            if (
              searchData.success &&
              searchData.data &&
              searchData.data.length > 0
            ) {
              userId = searchData.data[0].id;
              console.log(
                `Usuário já existe com ID: ${userId}. Atualizando dados...`
              );

              // Atualizar dados do usuário existente
              const userUpdateData = { ...userData };
              delete userUpdateData.planType;
              delete userUpdateData.hasOdontologico;

              await apiService.updateUser(userId, userUpdateData);
            } else {
              // Nenhum usuário encontrado, criar novo
              console.log(
                "Nenhum usuário existente encontrado. Criando novo..."
              );
              const userResponse = await createUser(userData);
              userId = userResponse.data.id;
              console.log("Usuário criado com sucesso, ID:", userId);
            }
          }
        } catch (error) {
          console.error("Erro ao verificar/criar usuário:", error);

          // Tentar criar novo usuário em caso de erro
          try {
            const userResponse = await createUser(userData);
            userId = userResponse.data.id;
            console.log("Usuário criado após erro de verificação, ID:", userId);
          } catch (createError) {
            if (
              createError instanceof Error &&
              createError.message.includes("already exists")
            ) {
              console.log("Usuário já existe, buscando ID...");

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
                  userId = searchData.data[0].id;
                  console.log(`Recuperado ID do usuário existente: ${userId}`);
                } else {
                  throw new Error(
                    "Não foi possível recuperar o ID do usuário existente."
                  );
                }
              } catch (searchError) {
                throw new Error(
                  "Falha ao buscar usuário existente: " + searchError.message
                );
              }
            } else {
              throw createError;
            }
          }
        }
      } else {
        // Temos um ID real, apenas atualizar
        console.log(`Atualizando usuário existente com ID: ${userId}`);
        const userUpdateData = { ...userData };
        delete userUpdateData.planType;
        delete userUpdateData.hasOdontologico;

        await apiService.updateUser(userId, userUpdateData);
      }

      // Atualizar o ID no estado
      updateState({ userId });

      // Marcar no localStorage que este usuário tem adesão finalizada
      try {
        localStorage.setItem(`completed_enrollment_${userId}`, "true");
        localStorage.setItem(`last_save_time_${userId}`, Date.now().toString());
        console.log(
          `Marcado no localStorage que o usuário ${userId} tem adesão finalizada`
        );
      } catch (e) {
        console.error("Erro ao salvar no localStorage:", e);
      }

      // Atualizar status do usuário para GREEN
      console.log("Atualizando status para GREEN (APPROVAL)");
      try {
        await apiService.updateUserStatus(userId, "GREEN", "APPROVAL");
      } catch (error) {
        console.error("Erro ao atualizar status do usuário:", error);
        // Continuar mesmo com erro
      }

      // Após completar o processo de adesão, salvar a assinatura do usuário
      if (userId && state.signatureData) {
        try {
          // Salvar a assinatura na etapa de aprovação
          await apiService.request(
            `/api/enrollment/user/${userId}/step/APPROVAL`,
            {
              method: "POST",
              body: JSON.stringify({
                step: "APPROVAL",
                completed: true,
                signatureData: state.signatureData,
                notes: "Adesão finalizada com assinatura do usuário",
              }),
            }
          );
          console.log("Assinatura do usuário salva com sucesso");
        } catch (signatureError) {
          console.error("Erro ao salvar assinatura:", signatureError);
          // Continuar mesmo com erro na assinatura
        }
      }

      // Atualizar etapa no componente
      updateState({ etapaAtual: 7 });

      return { success: true, userId };
    } catch (error) {
      let errorMessage = "Erro desconhecido";

      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
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
    setShowSignaturePad,
    setSignatureData,

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
    handleSignatureSave,
    handleSignatureCancel,
  };
};
