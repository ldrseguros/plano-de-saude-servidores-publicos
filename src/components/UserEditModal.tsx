import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Briefcase,
  Hash,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { User as ApiUser, CreateUserRequest } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { apiService } from "@/services/api";

interface EnrollmentStep {
  id: string;
  userId: string;
  step: string;
  completed: boolean;
  completionDate: string | null;
  notes: string | null;
  signatureData?: string | null;
  stepData?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

interface UserEditModalProps {
  user: ApiUser | null;
  onSave: (
    userId: string,
    userData: Partial<CreateUserRequest>
  ) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const UserEditModal = ({
  user,
  onSave,
  onClose,
  loading = false,
}: UserEditModalProps) => {
  const [formData, setFormData] = useState<Partial<CreateUserRequest>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [enrollmentSteps, setEnrollmentSteps] = useState<EnrollmentStep[]>([]);
  const [activeTab, setActiveTab] = useState("general");
  const [loadingSteps, setLoadingSteps] = useState(false);

  useEffect(() => {
    if (user) {
      // Inicializar o formulário com os dados do usuário
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        cpf: user.cpf || "",
        birthDate: user.birthDate
          ? new Date(user.birthDate).toISOString().split("T")[0]
          : "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        organization: user.organization || "",
        position: user.position || "",
        employeeId: user.employeeId || "",
        planType: user.planType as "WARD" | "PRIVATE_ROOM" | "DENTAL",
        hasOdontologico: user.hasOdontologico,
      });

      // Carregar as etapas de adesão do usuário
      loadEnrollmentSteps(user.id);
    }
  }, [user]);

  const loadEnrollmentSteps = async (userId: string) => {
    setLoadingSteps(true);
    try {
      const response = await apiService.getEnrollmentSteps(userId);
      if (response.success && response.data) {
        // Verificar se os dados são um array, caso contrário, converter para array
        const stepsData = Array.isArray(response.data)
          ? response.data
          : Object.values(response.data);

        // Garantir que cada item tenha as propriedades necessárias de EnrollmentStep
        const validSteps = stepsData
          .filter((step) => typeof step === "object" && step !== null)
          .map((step) => ({
            id: step.id || "",
            userId: step.userId || "",
            step: step.step || "",
            completed: step.completed || false,
            completionDate: step.completionDate || null,
            notes: step.notes || null,
            signatureData: step.signatureData || null,
            stepData: step.stepData || null,
            createdAt: step.createdAt || new Date().toISOString(),
            updatedAt: step.updatedAt || new Date().toISOString(),
          })) as EnrollmentStep[];

        setEnrollmentSteps(validSteps);
      }
    } catch (error) {
      console.error("Erro ao carregar etapas de adesão:", error);
    } finally {
      setLoadingSteps(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateUserRequest,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      await onSave(user?.id || "", formData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Erro ao salvar usuário"
      );
    }
  };

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
    const stepLabels: Record<string, string> = {
      PERSONAL_DATA: "Dados Pessoais",
      DEPENDENTS: "Dependentes",
      PLAN_SELECTION: "Seleção de Plano",
      PAYMENT: "Pagamento",
      REVIEW: "Revisão",
      APPROVAL: "Aprovação",
      COMPLETION: "Conclusão",
    };
    return stepLabels[step] || step;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("pt-BR");
  };

  // Função para renderizar a assinatura se ela existir
  const renderSignature = (step: EnrollmentStep) => {
    if (!step.signatureData) return null;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Assinatura do Usuário:</h4>
        <div className="border p-4 bg-gray-50 rounded-md">
          <img
            src={step.signatureData}
            alt="Assinatura do usuário"
            className="max-w-[300px] max-h-[150px] mx-auto"
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6" />
              <span>Editar Usuário</span>
              <Badge className={getStatusColor(user?.leadStatus || "")}>
                {user?.leadStatus}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {user?.id
              ? `Editando ${user.name} (ID: ${user.id})`
              : "Carregando..."}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="general"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full mb-4">
            <TabsTrigger value="general" className="flex-1">
              Dados Gerais
            </TabsTrigger>
            <TabsTrigger value="enrollment" className="flex-1">
              Etapas da Adesão
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex-1">
              Plano
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Dados Pessoais
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Nome completo"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf || ""}
                      onChange={(e) => handleInputChange("cpf", e.target.value)}
                      placeholder="000.000.000-00"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="email@exemplo.com"
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="(00) 00000-0000"
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate || ""}
                        onChange={(e) =>
                          handleInputChange("birthDate", e.target.value)
                        }
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Endereço
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address || ""}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Rua, número, complemento"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.city || ""}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      placeholder="Cidade"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={formData.state || ""}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      placeholder="UF"
                      maxLength={2}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode || ""}
                      onChange={(e) =>
                        handleInputChange("zipCode", e.target.value)
                      }
                      placeholder="00000-000"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Dados Profissionais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Dados Profissionais
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organização</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="organization"
                        value={formData.organization || ""}
                        onChange={(e) =>
                          handleInputChange("organization", e.target.value)
                        }
                        placeholder="Nome da organização"
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo</Label>
                    <Input
                      id="position"
                      value={formData.position || ""}
                      onChange={(e) =>
                        handleInputChange("position", e.target.value)
                      }
                      placeholder="Cargo/Função"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeId">ID do Funcionário</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="employeeId"
                        value={formData.employeeId || ""}
                        onChange={(e) =>
                          handleInputChange("employeeId", e.target.value)
                        }
                        placeholder="ID único do funcionário"
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="enrollment">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Etapas da Adesão</h3>
              {loadingSteps ? (
                <p>Carregando etapas...</p>
              ) : enrollmentSteps.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {enrollmentSteps.map((step, index) => (
                    <AccordionItem key={index} value={`step-${index}`}>
                      <AccordionTrigger>
                        <div className="flex items-center justify-between w-full pr-4">
                          <span>{getStepLabel(step.step)}</span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              step.completed
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {step.completed ? "Concluído" : "Pendente"}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 p-2">
                          <p>
                            <strong>Status:</strong>{" "}
                            {step.completed ? "Concluído" : "Pendente"}
                          </p>
                          {step.completionDate && (
                            <p>
                              <strong>Data de Conclusão:</strong>{" "}
                              {formatDate(step.completionDate)}
                            </p>
                          )}
                          {step.notes && (
                            <p>
                              <strong>Observações:</strong> {step.notes}
                            </p>
                          )}
                          {renderSignature(step)}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p>Não há etapas de adesão registradas para este usuário.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="plan">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detalhes do Plano</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planType">Tipo de Plano</Label>
                  <Select
                    value={formData.planType || ""}
                    onValueChange={(value) =>
                      handleInputChange("planType", value)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WARD">Enfermaria</SelectItem>
                      <SelectItem value="PRIVATE_ROOM">Apartamento</SelectItem>
                      <SelectItem value="DENTAL">
                        Apenas Odontológico
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hasOdontologico">Plano Odontológico</Label>
                  <Select
                    value={formData.hasOdontologico ? "true" : "false"}
                    onValueChange={(value) =>
                      handleInputChange("hasOdontologico", value === "true")
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditModal;
