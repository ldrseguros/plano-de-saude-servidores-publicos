import { api } from "./api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  lastLogin?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  admin: AdminUser;
  token: string;
}

class AuthService {
  async login(data: LoginRequest) {
    return api.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest) {
    return api.request<AdminUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getProfile() {
    return api.request<AdminUser>("/api/auth/profile", {
      method: "GET",
    });
  }

  setToken(token: string) {
    localStorage.setItem("admin_token", token);
    api.setAuthHeader(token);
  }

  getToken() {
    return localStorage.getItem("admin_token");
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem("admin_token");
    api.removeAuthHeader();
  }
}

export const authService = new AuthService();
