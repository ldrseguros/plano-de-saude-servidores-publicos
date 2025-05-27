import {
  Facebook,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo e Descrição */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-800 font-bold text-sm">BS</span>
              </div>
              <span className="font-semibold text-lg">
                Brasil Saúde Servidor
              </span>
            </Link>
            <p className="text-blue-200 text-sm sm:text-base leading-relaxed">
              Plano de saúde exclusivo para servidores públicos de Anicuns,
              oferecendo cobertura completa e atendimento de qualidade para você
              e sua família.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4 sm:mb-6">
              Links Rápidos
            </h3>
            <ul className="space-y-3 text-blue-200 text-sm sm:text-base">
              <li>
                <Link
                  to="/"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  to="/planos"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Nossos Planos
                </Link>
              </li>
              <li>
                <Link
                  to="/sobre-nos"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  to="/adesao"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Fazer Adesão
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold text-lg mb-4 sm:mb-6">Contato</h3>
            <div className="space-y-3 sm:space-y-4 text-blue-200 text-sm sm:text-base">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>(64) 3131-0000</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="break-all">
                  contato@brasilsaudeservidor.com.br
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Anicuns - GO
                  <br />
                  Atendimento: Seg-Sex, 8h às 18h
                </span>
              </div>
            </div>
          </div>

          {/* Redes Sociais */}
          <div>
            <h3 className="font-semibold text-lg mb-4 sm:mb-6">
              Redes Sociais
            </h3>
            <div className="flex space-x-3 mb-6">
              <a
                href="#"
                className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <Button className="bg-green-500 hover:bg-green-600 text-white text-sm sm:text-base w-full py-3 rounded-lg transition-all duration-300">
              <a
                href="https://wa.me/5564999999999"
                className="flex items-center justify-center"
              >
                Fale conosco no WhatsApp
              </a>
            </Button>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-blue-700 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-blue-200 text-sm sm:text-base">
          <p>© 2025 Brasil Saúde Servidor. Todos os direitos reservados.</p>
          <p className="mt-2">
            Desenvolvido especialmente para servidores públicos de Anicuns
          </p>
          <p className="mt-2 text-xs sm:text-sm">
            Planos regulamentados pela ANS - Registro: 123456789
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
