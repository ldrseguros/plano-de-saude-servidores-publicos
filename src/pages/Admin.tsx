import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  Calendar,
  MapPin,
  UserPlus,
  RefreshCw,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Download,
} from "lucide-react";
import {
  apiService,
  User as ApiUser,
  DashboardStats as ApiDashboardStats,
  Dependent,
  updateUser,
  deleteUser,
  CreateUserRequest,
  forceUpdateLeadStatuses,
  getUserDocuments,
  getDocumentDownloadUrl,
  UserDocument,
  getDocumentDiagnostics,
} from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import AdminLogin from "@/components/AdminLogin";
import UserEditModal from "@/components/UserEditModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

interface User extends ApiUser {
  dependents: Dependent[];
}

interface DashboardStats extends ApiDashboardStats {
  recentActivity: Record<string, unknown>[];
}

const Admin = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    user,
    loading: authLoading,
    error: authError,
    login,
    logout,
  } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [crudLoading, setCrudLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateResult, setStatusUpdateResult] = useState<{
    success: boolean;
    message: string;
    details?: {
      totalUsers: number;
      updatedUsers: number;
    };
  } | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState<
    Record<string, boolean>
  >({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getDashboardStats(),
      ]);

      // Mapear os dados da API para incluir dependentes que vêm do backend
      const usersWithDependents = (usersResponse.data.users || []).map(
        (user: ApiUser) => ({
          ...user,
          dependents: user.dependents || [], // Usar dependentes da API ou array vazio se não existir
        })
      );
      setUsers(usersWithDependents);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Função para atualizar usuário
  const handleUpdateUser = async (
    userId: string,
    userData: Partial<CreateUserRequest>
  ) => {
    setCrudLoading(true);
    try {
      await updateUser(userId, userData);
      await loadData(); // Recarregar dados
      setEditingUser(null);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    } finally {
      setCrudLoading(false);
    }
  };

  // Função para deletar usuário
  const handleDeleteUser = async (userId: string) => {
    setCrudLoading(true);
    try {
      await deleteUser(userId);
      await loadData(); // Recarregar dados
      setDeletingUser(null);
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      throw error;
    } finally {
      setCrudLoading(false);
    }
  };

  // Função para forçar atualização de status
  const handleForceStatusUpdate = async () => {
    if (
      window.confirm(
        "Deseja realmente forçar a atualização dos status de todos os leads? Esta operação pode demorar alguns segundos."
      )
    ) {
      setStatusUpdateLoading(true);
      setStatusUpdateResult(null);

      try {
        const response = await forceUpdateLeadStatuses();

        if (response.success) {
          setStatusUpdateResult({
            success: true,
            message: `Status atualizados com sucesso! ${response.data.updatedUsers} de ${response.data.totalUsers} leads foram atualizados.`,
            details: {
              totalUsers: response.data.totalUsers,
              updatedUsers: response.data.updatedUsers,
            },
          });

          // Recarregar dados
          await loadData();
        } else {
          setStatusUpdateResult({
            success: false,
            message: response.message || "Falha na atualização dos status.",
          });
        }
      } catch (error) {
        console.error("Erro ao forçar atualização de status:", error);
        setStatusUpdateResult({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Erro desconhecido ao atualizar status",
        });
      } finally {
        setStatusUpdateLoading(false);
      }
    }
  };

  // Função para baixar o PDF do usuário
  const handleDownloadPdf = async (userId: string, userName: string) => {
    if (loadingDocuments[userId]) return;

    try {
      // Definir estado de carregamento
      setLoadingDocuments((prev) => ({ ...prev, [userId]: true }));

      // Buscar documentos do usuário
      const response = await getUserDocuments(userId);

      if (response.success && response.data && response.data.length > 0) {
        // Encontrar o documento PDF mais recente (ordenados por data de criação descendente)
        const latestPdf = response.data.find(
          (doc) => doc.type === "ENROLLMENT_PDF"
        );

        if (latestPdf) {
          try {
            // Primeiro, tentar verificar o diagnóstico do documento
            const diagnostics = await getDocumentDiagnostics(latestPdf.id);
            console.log("Diagnóstico do documento:", diagnostics);

            // Definir tipos para o objeto de diagnóstico
            interface FileInfo {
              exists: boolean;
              canRead: boolean;
              size: number;
              stats: Record<string, unknown> | null;
              directory: string;
              fullPath: string;
            }

            interface DiagnosticData {
              document: UserDocument;
              fileInfo: FileInfo;
              directoryInfo: {
                exists: boolean;
                path: string;
                files: string[];
              };
            }

            // Se o arquivo não existir ou não for legível, mostrar alerta
            if (diagnostics.success && diagnostics.data) {
              // Cast para unknown primeiro e depois para o tipo específico
              const diagData = diagnostics.data as unknown as DiagnosticData;

              if (
                diagData.fileInfo.exists === false ||
                diagData.fileInfo.canRead === false
              ) {
                alert(
                  `Problema com o arquivo PDF: ${
                    diagData.fileInfo.exists === false
                      ? "O arquivo não existe no servidor."
                      : "O arquivo existe mas não pode ser lido."
                  }`
                );
                return;
              }
            }

            // Criar URL de download
            const downloadUrl = getDocumentDownloadUrl(latestPdf.id);

            // Abrir diretamente em uma nova guia do navegador
            window.open(downloadUrl, "_blank");

            // Log para debug
            console.log("Abrindo PDF em nova guia:", downloadUrl);
          } catch (downloadError) {
            console.error("Erro ao iniciar download:", downloadError);
            alert(
              `Erro ao tentar baixar o PDF: ${
                downloadError instanceof Error
                  ? downloadError.message
                  : "Erro desconhecido"
              }`
            );
          }
          return;
        }
      }

      // Se chegar aqui, não encontrou documentos
      alert(`Não há documentos PDF disponíveis para ${userName}`);
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      alert(
        "Erro ao tentar baixar o PDF do usuário. Verifique o console para mais detalhes."
      );
    } finally {
      // Limpar estado de carregamento
      setLoadingDocuments((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cpf.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || user.leadStatus.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "GREEN":
        return "bg-green-100 text-green-800 border-green-200";
      case "YELLOW":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "RED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStepLabel = (step: string) => {
    const steps: Record<string, string> = {
      PERSONAL_DATA: "Dados Pessoais",
      DEPENDENTS_DATA: "Dependentes",
      PLAN_SELECTION: "Seleção de Plano",
      DOCUMENTS: "Documentos",
      PAYMENT: "Pagamento",
      ANALYSIS: "Análise",
      APPROVAL: "Aprovação",
    };
    return steps[step] || step;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Redirecionar para a página de login se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("Usuário não autenticado, redirecionando para login");
      navigate("/admin/login", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  // Não renderizar nada se não estiver autenticado (o efeito acima vai redirecionar)
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Carregando dados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🏥 Brasil Saúde - Administração
              </h1>
              <p className="text-gray-600">
                Gestão de Leads e Adesões • Logado como:{" "}
                <strong>{user?.username}</strong>
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleForceStatusUpdate}
                variant="outline"
                disabled={statusUpdateLoading}
              >
                {statusUpdateLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar Status
                  </>
                )}
              </Button>
              <Button onClick={loadData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification de atualização de status */}
        {statusUpdateResult && (
          <div
            className={`mb-6 p-4 rounded-md ${
              statusUpdateResult.success
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {statusUpdateResult.success ? (
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  {statusUpdateResult.success
                    ? "Atualização concluída"
                    : "Erro na atualização"}
                </h3>
                <div className="mt-2 text-sm">
                  <p>{statusUpdateResult.message}</p>
                  {statusUpdateResult.details && (
                    <p className="mt-1">
                      Total: {statusUpdateResult.details.totalUsers} leads,
                      Atualizados: {statusUpdateResult.details.updatedUsers}{" "}
                      leads
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Leads
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLeads}</div>
                <p className="text-xs text-muted-foreground">
                  Leads cadastrados no sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Conversão
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.conversionRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Leads convertidos em clientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Leads Ativos
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.statusDistribution.green}
                </div>
                <p className="text-xs text-muted-foreground">
                  Status verde (ativos)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita Estimada
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalLeads * 190)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Receita mensal estimada
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros e Busca */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros e Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, email ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === "green" ? "default" : "outline"}
                  onClick={() => setStatusFilter("green")}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Verde
                </Button>
                <Button
                  variant={statusFilter === "yellow" ? "default" : "outline"}
                  onClick={() => setStatusFilter("yellow")}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Amarelo
                </Button>
                <Button
                  variant={statusFilter === "red" ? "default" : "outline"}
                  onClick={() => setStatusFilter("red")}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Vermelho
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Leads ({filteredUsers.length})</span>
              <Badge variant="outline">
                {filteredUsers.length} de {users.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        <Badge className={getStatusColor(user.leadStatus)}>
                          {user.leadStatus}
                        </Badge>
                        <Badge variant="outline">
                          {getStepLabel(user.currentStep)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Criado em {formatDate(user.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {user.city}, {user.state}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <UserPlus className="w-4 h-4" />
                          <span>
                            {user.dependents?.length || 0} dependentes
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4" />
                          <span>
                            Última atividade:{" "}
                            {formatDate(user.lastActivityDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPdf(user.id, user.name)}
                        disabled={loadingDocuments[user.id]}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {loadingDocuments[user.id] ? (
                          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-1" />
                        )}
                        Baixar PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingUser(user)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum lead encontrado com os filtros aplicados.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes do Usuário */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detalhes do Lead</span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownloadPdf(selectedUser.id, selectedUser.name)
                    }
                    disabled={loadingDocuments[selectedUser.id]}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {loadingDocuments[selectedUser.id] ? (
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-1" />
                    )}
                    Baixar PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nome
                  </label>
                  <p className="text-lg">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedUser.leadStatus)}>
                      {selectedUser.leadStatus}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Telefone
                  </label>
                  <p>{selectedUser.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    CPF
                  </label>
                  <p>{selectedUser.cpf}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Data de Nascimento
                  </label>
                  <p>{formatDate(selectedUser.birthDate)}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Endereço
                  </label>
                  <p>
                    {selectedUser.address}, {selectedUser.city} -{" "}
                    {selectedUser.state}, {selectedUser.zipCode}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Organização
                  </label>
                  <p>{selectedUser.organization}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Cargo
                  </label>
                  <p>{selectedUser.position}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    ID do Funcionário
                  </label>
                  <p>{selectedUser.employeeId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Etapa Atual
                  </label>
                  <p>{getStepLabel(selectedUser.currentStep)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dependentes
                  </label>
                  <p>{selectedUser.dependents?.length || 0} dependente(s)</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Data de Criação
                  </label>
                  <p>{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Edição */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onSave={handleUpdateUser}
          onClose={() => setEditingUser(null)}
          loading={crudLoading}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deletingUser && (
        <DeleteConfirmModal
          user={deletingUser}
          onConfirm={handleDeleteUser}
          onClose={() => setDeletingUser(null)}
          loading={crudLoading}
        />
      )}
    </div>
  );
};

export default Admin;
