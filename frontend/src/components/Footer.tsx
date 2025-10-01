export function Footer() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-between text-sm text-gray-600">
        <div>© {new Date().getFullYear()} Alto Carwash</div>
        <nav className="flex gap-4">
          <a href="#" className="hover:text-blue-600 transition-colors">Privacidad</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Términos</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Contacto</a>
        </nav>
      </div>
    </footer>
  );
}


