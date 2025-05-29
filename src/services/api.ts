import config from "../config/env";

const API_BASE_URL = config.API_URL;
export { API_BASE_URL };

// Tipos para as requisições
export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  organization: string;
  position: string;
  employeeId: string;
  planType: "WARD" | "PRIVATE_ROOM" | "DENTAL";
  hasOdontologico: boolean;
}

export interface CreateDependentRequest {
  userId: string;
  name: string;
  cpf: string;
  birthDate: string;
  relationship: string;
  planType: "WARD" | "PRIVATE_ROOM";
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  organization: string;
  position: string;
  employeeId: string;
  leadStatus: string;
  currentStep: string;
  lastActivityDate: string;
  createdAt: string;
  updatedAt: string;
  planType?: string;
  hasOdontologico?: boolean;
  dependents?: Dependent[];
}

export interface Dependent {
  id: string;
  userId: string;
  name: string;
  cpf: string;
  birthDate: string;
  relationship: string;
  planType: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDocument {
  id: string;
  userId: string;
  type: string;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  statusDistribution: {
    green: number;
    yellow: number;
    red: number;
  };
  conversionRate: string;
  recentActivity: Record<string, unknown>[];
  stepDistribution: Record<string, number>;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

// Classe para gerenciar as requisições da API
class ApiService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Verificar se existe token no localStorage ao inicializar
    const token = localStorage.getItem("admin_token");
    if (token) {
      this.authToken = token;
    }
  }

  // Métodos para autenticação
  setAuthHeader(token: string) {
    this.authToken = token;
  }

  removeAuthHeader() {
    this.authToken = null;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Adicionar token de autenticação se existir
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      headers,
      credentials: "include",
      ...options,
    };

    try {
      console.log(`Fazendo requisição para: ${url}`, config);
      const response = await fetch(url, config);

      // Verificar headers de resposta para debug
      console.log("Headers da resposta:", {
        cors: response.headers.get("Access-Control-Allow-Origin"),
        methods: response.headers.get("Access-Control-Allow-Methods"),
        headers: response.headers.get("Access-Control-Allow-Headers"),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  // Métodos para usuários
  async createUser(userData: CreateUserRequest) {
    return this.request<User>("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getUser(userId: string) {
    return this.request<User>(`/api/users/${userId}`);
  }

  async updateUserStatus(userId: string, status: string, step: string) {
    return this.request<User>(`/api/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        leadStatus: status,
        currentStep: step,
      }),
    });
  }

  async updateUser(userId: string, userData: Partial<CreateUserRequest>) {
    return this.request<User>(`/api/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request<{ message: string }>(`/api/users/${userId}`, {
      method: "DELETE",
    });
  }

  async getAllUsers() {
    return this.request<UsersResponse>("/api/users?limit=1000");
  }

  async checkUserExists(email: string, cpf: string) {
    return this.request<{ exists: boolean; field: string }>(
      `/api/users/check`,
      {
        method: "POST",
        body: JSON.stringify({ email, cpf }),
      }
    );
  }

  // Métodos para dependentes
  async createDependent(dependentData: CreateDependentRequest) {
    return this.request<Dependent>("/api/dependents", {
      method: "POST",
      body: JSON.stringify(dependentData),
    });
  }

  async updateDependent(
    dependentId: string,
    dependentData: Partial<CreateDependentRequest>
  ) {
    return this.request<Dependent>(`/api/dependents/${dependentId}`, {
      method: "PUT",
      body: JSON.stringify(dependentData),
    });
  }

  async getDependentsByUser(userId: string) {
    return this.request<Dependent[]>(`/api/dependents/user/${userId}`);
  }

  async updateDependentsBulk(
    userId: string,
    dependents: Array<Partial<CreateDependentRequest>>,
    replaceAll: boolean = false
  ) {
    return this.request<{
      results: Array<{
        action: "created" | "updated" | "deleted" | "error";
        dependent: Partial<Dependent>;
        error?: string;
      }>;
      summary: {
        total: number;
        created: number;
        updated: number;
        deleted: number;
        errors: number;
      };
    }>(
      `/api/dependents/user/${userId}/bulk${
        replaceAll ? "?replaceAll=true" : ""
      }`,
      {
        method: "POST",
        body: JSON.stringify({ dependents }),
      }
    );
  }

  // Métodos para enrollment
  async getEnrollmentSteps(userId?: string) {
    const endpoint = userId
      ? `/api/enrollment/user/${userId}/steps`
      : "/api/enrollment/steps";
    return this.request<Record<string, unknown>>(endpoint);
  }

  async updateEnrollmentStep(
    userId: string,
    step: string,
    completed:
      | boolean
      | {
          completed: boolean;
          notes?: string;
          signatureData?: string;
          stepData?: Record<string, unknown>;
        }
  ) {
    let requestBody: Record<string, unknown>;

    if (typeof completed === "boolean") {
      requestBody = {
        step,
        completed,
      };
    } else {
      requestBody = {
        step,
        completed: completed.completed,
        notes: completed.notes,
        signatureData: completed.signatureData,
        stepData: completed.stepData,
      };
    }

    return this.request<Record<string, unknown>>(
      `/api/enrollment/user/${userId}/step/${step}`,
      {
        method: "POST",
        body: JSON.stringify(requestBody),
      }
    );
  }

  // Get user documents
  async getUserDocuments(userId: string) {
    return this.request<UserDocument[]>(
      `/api/enrollment/user/${userId}/documents`
    );
  }

  // Get document download URL
  getDocumentDownloadUrl(documentId: string) {
    return `${this.baseURL}/api/enrollment/documents/${documentId}/download`;
  }

  // Get document diagnostics
  async getDocumentDiagnostics(documentId: string) {
    return this.request<Record<string, unknown>>(
      `/api/enrollment/documents/${documentId}/diagnostics`
    );
  }

  // Métodos para dashboard
  async getDashboardStats() {
    return this.request<DashboardStats>("/api/users/dashboard/stats");
  }

  // Método para forçar atualização de status dos leads
  async forceUpdateLeadStatuses() {
    return this.request<{
      totalUsers: number;
      updatedUsers: number;
      updates: Array<{
        id: string;
        name: string;
        previousStatus: string;
        newStatus: string;
        currentStep: string;
      }>;
    }>("/api/users/force-update-status", {
      method: "POST",
    });
  }

  // Método para health check
  async healthCheck() {
    return this.request<HealthResponse>("/health");
  }
}

// Instância singleton da API
export const apiService = new ApiService(API_BASE_URL);

// Funções de conveniência para uso direto
export const createUser = (userData: CreateUserRequest) =>
  apiService.createUser(userData);

export const createDependent = (dependentData: CreateDependentRequest) =>
  apiService.createDependent(dependentData);

export const getUser = (userId: string) => apiService.getUser(userId);

export const updateUserStatus = (
  userId: string,
  status: string,
  step: string
) => apiService.updateUserStatus(userId, status, step);

export const updateUser = (
  userId: string,
  userData: Partial<CreateUserRequest>
) => apiService.updateUser(userId, userData);

export const deleteUser = (userId: string) => apiService.deleteUser(userId);

export const checkUserExists = (email: string, cpf: string) =>
  apiService.checkUserExists(email, cpf);

export const getDashboardStats = () => apiService.getDashboardStats();

export const healthCheck = () => apiService.healthCheck();

export const forceUpdateLeadStatuses = () =>
  apiService.forceUpdateLeadStatuses();

export const updateDependent = (
  dependentId: string,
  dependentData: Partial<CreateDependentRequest>
) => apiService.updateDependent(dependentId, dependentData);

export const updateDependentsBulk = (
  userId: string,
  dependents: Array<Partial<CreateDependentRequest>>,
  replaceAll: boolean = false
) => apiService.updateDependentsBulk(userId, dependents, replaceAll);

// Get user documents
export const getUserDocuments = (userId: string) =>
  apiService.getUserDocuments(userId);

// Get document download URL
export const getDocumentDownloadUrl = (documentId: string) =>
  apiService.getDocumentDownloadUrl(documentId);

// Get document diagnostics
export const getDocumentDiagnostics = (documentId: string) =>
  apiService.getDocumentDiagnostics(documentId);

// Exportar a instância da API para uso direto
export const api = apiService;
