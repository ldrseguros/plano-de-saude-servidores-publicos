import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { healthCheck, getDashboardStats } from "@/services/api";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const TestBackend = () => {
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testHealthCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await healthCheck();
      setHealthStatus("✅ Backend conectado com sucesso!");
      console.log("Health check response:", response);
    } catch (err) {
      setError("❌ Erro ao conectar com o backend");
      console.error("Health check error:", err);
    } finally {
      setLoading(false);
    }
  };

  const testDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboardStats();
      setDashboardData(response.data);
      console.log("Dashboard response:", response);
    } catch (err) {
      setError("❌ Erro ao buscar dados do dashboard");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto m-4">
      <CardHeader>
        <CardTitle>🔧 Teste de Integração Backend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button
            onClick={testHealthCheck}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Testar Conexão
          </Button>

          <Button onClick={testDashboard} disabled={loading} variant="outline">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Testar Dashboard
          </Button>
        </div>

        {healthStatus && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            {healthStatus}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {dashboardData && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-bold mb-2">📊 Dados do Dashboard:</h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(dashboardData, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>
            <strong>Frontend:</strong> http://localhost:8080
          </p>
          <p>
            <strong>Backend:</strong> http://localhost:3000
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestBackend;
