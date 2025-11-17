import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Alto Carwash</h3>
            <p className="text-sm leading-relaxed">
              Tu plataforma de confianza para encontrar y reservar servicios de lavado de autos en Chile.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Servicios</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Buscar Lavados</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Comparar Precios</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Reservar en Línea</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Para Empresas</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Acerca de Nosotros</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Trabaja con Nosotros</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Prensa</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Soporte</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; 2025 Alto Carwash. Todos los derechos reservados.</p>
          <p className="mt-4 md:mt-0">Hecho con ❤️ en Chile</p>
        </div>
      </div>
    </footer>
  );
}



