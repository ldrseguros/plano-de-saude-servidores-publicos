import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService, RegisterRequest } from "../services/auth";
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
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";

const AdminRegister: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
    name: "",
  });
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = (): boolean => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.name
    ) {
      setError("Todos os campos são obrigatórios");
      return false;
    }

    if (formData.password !== confirmPassword) {
      setError("As senhas não coincidem");
      return false;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email inválido");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(formData);

      if (response.success) {
        setSuccess(true);
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          navigate("/admin/login");
        }, 2000);
      } else {
        setError(
          "Cadastro falhou: " + (response.message || "Erro desconhecido")
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao tentar cadastrar";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigate("/admin/login");
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
            <PersonAddAltOutlinedIcon />
          </Box>
          <Typography component="h1" variant="h5">
            Cadastro de Administrador
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            <AlertTitle>Erro</AlertTitle>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
            <AlertTitle>Sucesso</AlertTitle>
            Administrador cadastrado com sucesso! Redirecionando para login...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Nome Completo"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            autoFocus
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nome de Usuário"
            name="username"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            type="email"
            value={formData.email}
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
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirmar Senha"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>

          <Grid container justifyContent="flex-end">
            <Grid>
              <Link
                onClick={goToLogin}
                variant="body2"
                sx={{ cursor: "pointer" }}
              >
                Já tem uma conta? Faça login
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

export default AdminRegister;
