import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { User as ApiUser } from "@/services/api";

interface DeleteConfirmModalProps {
  user: ApiUser;
  onConfirm: (userId: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const DeleteConfirmModal = ({
  user,
  onConfirm,
  onClose,
  loading = false,
}: DeleteConfirmModalProps) => {
  const handleConfirm = async () => {
    await onConfirm(user.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-red-600">
              <Trash2 className="w-6 h-6" />
              <span>Confirmar Exclusão</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Atenção!</strong> Esta ação não pode ser desfeita.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-gray-700">
              Você tem certeza que deseja excluir o usuário:
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="space-y-2">
                <p className="font-semibold text-lg">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-600">CPF: {user.cpf}</p>
                <p className="text-sm text-gray-600">
                  Status: <span className="font-medium">{user.leadStatus}</span>
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Consequências da exclusão:</strong>
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Todos os dados do usuário serão removidos</li>
                <li>• Dependentes associados também serão excluídos</li>
                <li>• Histórico de atividades será perdido</li>
                <li>• Esta ação é irreversível</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                "Excluindo..."
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Confirmar Exclusão
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteConfirmModal;
