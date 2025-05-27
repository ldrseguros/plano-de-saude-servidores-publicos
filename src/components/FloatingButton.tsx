import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const FloatingButton = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
        size="lg"
      >
        <MessageCircle className="w-5 h-5" />
        <a href="https://wa.me/5511999999999">
          <span className="hidden sm:inline">Fale com um Especialista</span>
          <span className="sm:hidden">Contato</span>
        </a>
      </Button>
    </div>
  );
};

export default FloatingButton;
