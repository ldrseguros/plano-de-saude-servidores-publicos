import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SignatureCanvasProps {
  onSave: (signatureData: string) => void;
  onCancel: () => void;
}

const SignatureCanvas = ({ onSave, onCancel }: SignatureCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // Inicializar o canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Configurar o contexto do canvas
    context.lineWidth = 2;
    context.lineCap = "round";
    context.strokeStyle = "#000000";

    // Limpar o canvas inicialmente
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    setCtx(context);
  }, []);

  // Funções para desenhar
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    setIsDrawing(true);
    setIsEmpty(false);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (ctx) {
      ctx.beginPath();
    }
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !ctx || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    let clientX: number, clientY: number;

    // Handle mouse and touch events
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    if (!ctx || !canvasRef.current) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsEmpty(true);
  };

  const save = () => {
    if (!canvasRef.current || isEmpty) return;

    const signatureData = canvasRef.current.toDataURL("image/png");
    onSave(signatureData);
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          <div className="border-2 border-gray-300 rounded-lg mb-4 w-full">
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              className="w-full h-48 touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <div className="flex space-x-2 justify-between w-full">
            <div>
              <Button
                variant="outline"
                onClick={clear}
                disabled={isEmpty}
                className="mr-2"
              >
                Limpar
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
            <Button
              onClick={save}
              disabled={isEmpty}
              className="bg-green-600 hover:bg-green-700"
            >
              Salvar Assinatura
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignatureCanvas;
