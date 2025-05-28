import { useState, useEffect, useRef } from "react";
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
  // Controle para evitar loops infinitos de verificação
  const authChecked = useRef(false);
  const authCheckFailed = useRef(false);

  // Verificar se há token e tentar carregar perfil de usuário ao iniciar
  useEffect(() => {
    const checkAuth = async () => {
      // Se já verificamos ou já falhou, não verificar novamente
      if (authChecked.current || authCheckFailed.current) {
        return;
      }

      try {
        const token = authService.getToken();

        if (!token) {
          setAuthState((prev) => ({ ...prev, loading: false }));
          authChecked.current = true;
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
            authChecked.current = true;
          } else {
            // Token inválido ou expirado
            authService.logout();
            setAuthState({
              isAuthenticated: false,
              user: null,
              loading: false,
              error: null,
            });
            authChecked.current = true;
          }
        } catch (error) {
          // Erro ao validar token - pode ser erro de rede ou API
          console.error("Erro ao validar autenticação:", error);

          // Verificar se é erro de rede
          if (
            error instanceof Error &&
            (error.message.includes("network") ||
              error.message.includes("fetch") ||
              error.message.includes("Failed to fetch"))
          ) {
            // Definir erro de rede, mas manter usuário como não autenticado
            setAuthState({
              isAuthenticated: false,
              user: null,
              loading: false,
              error:
                "Erro de conexão. Verifique sua internet e tente novamente.",
            });
            // Marcar como falha, mas não invalidar token ainda
            authCheckFailed.current = true;
          } else {
            // Outros erros - invalida o token
            authService.logout();
            setAuthState({
              isAuthenticated: false,
              user: null,
              loading: false,
              error: null,
            });
            authChecked.current = true;
          }
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        }));
        authCheckFailed.current = true;
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await authService.login(credentials);

      if (!response.success || !response.data?.token) {
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

      // Resetar flags após login bem-sucedido
      authChecked.current = true;
      authCheckFailed.current = false;

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message.includes("fetch") || error.message.includes("network")
            ? "Erro de conexão. Verifique sua internet e tente novamente."
            : error.message
          : "Erro ao fazer login";

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
    // Resetar flags após logout
    authChecked.current = true;
    authCheckFailed.current = false;
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
