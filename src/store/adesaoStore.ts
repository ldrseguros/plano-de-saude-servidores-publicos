import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PlanoSelecionado {
  nome: string;
  tipo: "enfermaria" | "apartamento" | "odontologico";
  valor: number;
  cobertura: string[];
  incluiOdontologico?: boolean;
  valorTotal?: number;
}

// Definir e exportar a interface para Dependente
export interface IDependente {
  nome: string;
  parentesco: string;
  dataNascimento: string;
}

export interface DadosPessoais {
  nome: string;
  cpf: string;
  matricula: string;
  celular: string;
  email: string;
  dataNascimento: string;
  endereco: string;
  dependentes: Array<IDependente>; // Usar a nova interface IDependente
}

interface AdesaoState {
  planoSelecionado: PlanoSelecionado | null;
  dadosPessoais: DadosPessoais | null;
  termosAceitos: boolean;
  etapaAtual: number;

  // Actions
  setPlanoSelecionado: (plano: PlanoSelecionado) => void;
  setDadosPessoais: (dados: DadosPessoais) => void;
  setTermosAceitos: (aceitos: boolean) => void;
  setEtapaAtual: (etapa: number) => void;
  resetAdesao: () => void;
}

export const useAdesaoStore = create<AdesaoState>()(
  persist(
    (set) => ({
      planoSelecionado: null,
      dadosPessoais: null,
      termosAceitos: false,
      etapaAtual: 1,

      setPlanoSelecionado: (plano) => set({ planoSelecionado: plano }),
      setDadosPessoais: (dados) => set({ dadosPessoais: dados }),
      setTermosAceitos: (aceitos) => set({ termosAceitos: aceitos }),
      setEtapaAtual: (etapa) => set({ etapaAtual: etapa }),
      resetAdesao: () =>
        set({
          planoSelecionado: null,
          dadosPessoais: null,
          termosAceitos: false,
          etapaAtual: 1,
        }),
    }),
    {
      name: "adesao-storage",
    }
  )
);
