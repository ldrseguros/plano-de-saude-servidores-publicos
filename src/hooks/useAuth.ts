import { useState, useEffect } from "react";
import { authService, LoginRequest, AdminUser } from "../services/auth";

interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  // Verificar se há token e tentar carregar perfil de usuário ao iniciar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authService.getToken();

        if (!token) {
          setAuthState((prev) => ({ ...prev, loading: false }));
          return;
        }

        // Token existe, verificar se é válido buscando o perfil
        try {
          const response = await authService.getProfile();

          if (response.success && response.data) {
            setAuthState({
              isAuthenticated: true,
              user: response.data,
              loading: false,
              error: null,
            });
          } else {
            // Token inválido ou expirado
            authService.logout();
            setAuthState({
              isAuthenticated: false,
              user: null,
              loading: false,
              error: null,
            });
          }
        } catch (error) {
          // Erro ao validar token
          console.error("Erro ao validar autenticação:", error);
          authService.logout();
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await authService.login(credentials);

      if (!response.success || !response.data.token) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: response.message || "Usuário ou senha inválidos",
        }));
        return false;
      }

      // Login bem-sucedido
      authService.setToken(response.data.token);

      setAuthState({
        isAuthenticated: true,
        user: response.data.admin,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao fazer login";

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  };

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    login,
    logout,
    clearError,
  };
};
