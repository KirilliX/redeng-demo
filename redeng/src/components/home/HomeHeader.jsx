import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { navCategories, siteInfo } from "@/content/homeContent";

export default function HomeHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-[#111214] border-b border-[#2a2d32] sticky top-0 z-50">
      {/* Top bar */}
      <div className="border-b border-[#2a2d32]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-10 text-sm">
          <Link to="/" className="flex items-center gap-2 font-bold text-white text-base tracking-wide">
            <span className="text-red-600 text-xl font-black">РЭД</span>
            <span className="text-gray-300 font-medium hidden sm:inline">ИНЖИНИРИНГ</span>
          </Link>
          <div className="flex items-center gap-4">
            <a href={`tel:${siteInfo.phone}`} className="flex items-center gap-1.5 text-white hover:text-red-500 transition-colors">
              <Phone className="h-3.5 w-3.5" />
              <span className="font-medium">{siteInfo.phone}</span>
            </a>
            <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-1.5 rounded transition-colors hidden sm:block">
              Обратный звонок
            </button>
          </div>
        </div>
      </div>

      {/* Nav bar */}
      <div className="max-w-7xl mx-auto px-4 flex items-center h-12 gap-6">
        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {navCategories.map((cat) => (
            <a
              key={cat.label}
              href={cat.href}
              className="text-gray-300 hover:text-white text-sm px-3 py-2 rounded hover:bg-[#1e2126] transition-colors whitespace-nowrap"
            >
              {cat.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3 ml-auto">
          <button className="text-gray-400 hover:text-white transition-colors p-1.5">
            <Search className="h-4 w-4" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors p-1.5">
            <User className="h-4 w-4" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors p-1.5">
            <ShoppingCart className="h-4 w-4" />
          </button>
          <button
            className="lg:hidden text-gray-400 hover:text-white transition-colors p-1.5"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#2a2d32] bg-[#111214]">
          {navCategories.map((cat) => (
            <a
              key={cat.label}
              href={cat.href}
              className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-[#1e2126] border-b border-[#2a2d32] transition-colors"
            >
              {cat.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
