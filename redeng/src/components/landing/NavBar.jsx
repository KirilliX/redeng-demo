export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111214]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-600 rounded-sm" />
          <span className="text-white font-semibold text-sm tracking-widest uppercase">R-ENG</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[#8a8f9a] text-sm">
          <a href="#solution" className="hover:text-white transition-colors">Решение</a>
          <a href="#kit" className="hover:text-white transition-colors">Состав</a>
          <a href="#trust" className="hover:text-white transition-colors">О нас</a>
          <a href="#cta" className="hover:text-white transition-colors">Контакты</a>
        </div>
        <a
          href="#cta"
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2.5 rounded transition-colors"
        >
          Получить расчёт
        </a>
      </div>
    </nav>
  );
}