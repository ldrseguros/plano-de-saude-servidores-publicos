import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  X,
  User,
  Mail,
  Phone,
  Search,
  UserPlus,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface UserExistsModalProps {
  email: string;
  cpf: string;
  onClose: () => void;
  onContactSupport: () => void;
  onTryDifferentData: () => void;
  onContinueWithExisting?: () => void;
}

const UserExistsModal = ({
  email,
  cpf,
  onClose,
  onContactSupport,
  onTryDifferentData,
  onContinueWithExisting,
}: UserExistsModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-orange-600">
              <AlertTriangle className="w-6 h-6" />
              <span>Usuário Já Cadastrado</span>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Atenção!</strong> Já existe um usuário cadastrado com
              estes dados.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-gray-700">
              Encontramos um cadastro existente com os seguintes dados:
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    Email: <strong>{email}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    CPF: <strong>{cpf}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                O que você pode fazer:
              </h4>
              <ul className="text-sm text-blue-700 space-y-2">
                {onContinueWithExisting && (
                  <li className="flex items-start space-x-2">
                    <span className="font-bold">1.</span>
                    <span className="font-medium text-green-700">
                      Continuar a adesão com os dados existentes (recomendado)
                    </span>
                  </li>
                )}
                <li className="flex items-start space-x-2">
                  <span className="font-bold">
                    {onContinueWithExisting ? "2" : "1"}.
                  </span>
                  <span>
                    Se você já tem cadastro, entre em contato com o suporte para
                    acessar sua conta
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold">
                    {onContinueWithExisting ? "3" : "2"}.
                  </span>
                  <span>
                    Se os dados estão incorretos, volte e corrija as informações
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold">
                    {onContinueWithExisting ? "4" : "3"}.
                  </span>
                  <span>
                    Se você está cadastrando para outra pessoa, use os dados
                    corretos dela
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Phone className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    Precisa de ajuda?
                  </p>
                  <p className="text-sm text-yellow-700">
                    Entre em contato conosco pelo telefone{" "}
                    <strong>(62) 3333-4444</strong> ou email{" "}
                    <strong>suporte@brasilsaude.gov.br</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            {onContinueWithExisting && (
              <Button
                onClick={onContinueWithExisting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Continuar Adesão
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onTryDifferentData}
              className="flex-1"
            >
              <Search className="w-4 h-4 mr-2" />
              Corrigir Dados
            </Button>
            <Button
              onClick={onContactSupport}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              Contatar Suporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserExistsModal;
