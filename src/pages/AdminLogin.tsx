import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginRequest } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Paper,
  Grid,
  Alert,
  AlertTitle,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const {
    login,
    isAuthenticated,
    loading: authLoading,
    error: authError,
  } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Redirecionar para admin se já estiver autenticado
  useEffect(() => {
    // Apenas redirecionar se não estiver carregando e estiver autenticado
    if (!authLoading && isAuthenticated) {
      console.log("Usuário autenticado, redirecionando para /admin");
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = await login(formData);

      if (success) {
        // O useEffect acima cuidará do redirecionamento
        console.log("Login bem-sucedido, redirecionando...");
      } else {
        setError(authError || "Falha no login. Verifique suas credenciais.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Erro ao tentar fazer login");
      } else {
        setError("Erro desconhecido ao tentar fazer login");
      }
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    navigate("/admin/register");
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 4,
        }}
      >
        <Box
          sx={{
            mb: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "white",
              p: 1,
              borderRadius: "50%",
              mb: 1,
            }}
          >
            <LockOutlinedIcon />
          </Box>
          <Typography component="h1" variant="h5">
            Login de Administrador
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            <AlertTitle>Erro</AlertTitle>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Usuário ou Email"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <Grid container>
            <Grid sx={{ flexGrow: 1 }}>
              <Link href="#" variant="body2">
                Esqueceu a senha?
              </Link>
            </Grid>
            <Grid>
              <Link
                onClick={goToRegister}
                variant="body2"
                sx={{ cursor: "pointer" }}
              >
                {"Não tem uma conta? Cadastre-se"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Brasil Saúde Admin © {new Date().getFullYear()}
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminLogin;
