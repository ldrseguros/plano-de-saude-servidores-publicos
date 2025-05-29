import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex items-center justify-center">
              <img
                src="https://aureumseguros.com.br/wp-content/uploads/2025/05/brasil-saude-1.png"
                alt="Logo"
                className="w-15 h-10"
              />
            </div>
            <span className="text-lg sm:text-xl text-gray-800 font-bold">
              Plano Brasil Saúde para Servidores de Anicuns
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-base"
            >
              Início
            </Link>
            <Link
              to="/planos"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-base"
            >
              Planos
            </Link>
            <Link
              to="/sobre-nos"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-base"
            >
              Sobre nós
            </Link>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300">
              <a href="https://wa.me/5564999999999">Fale com um especialista</a>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={toggleMenu}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-base py-2"
              >
                Início
              </Link>
              <Link
                to="/planos"
                onClick={toggleMenu}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-base py-2"
              >
                Planos
              </Link>
              <Link
                to="/sobre-nos"
                onClick={toggleMenu}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-base py-2"
              >
                Sobre nós
              </Link>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 mt-4">
                <a href="https://wa.me/5564999999999">
                  Fale com um especialista
                </a>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
