import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { siteInfo, footerCatalog } from "@/content/homeContent";

export default function HomeFooter() {
  return (
    <footer className="bg-[#0d0f11] border-t border-[#2a2d32] mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-red-600 text-2xl font-black">РЭД</span>
            <span className="text-white font-semibold text-lg">ИНЖИНИРИНГ</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Надёжный поставщик промышленного инженерного оборудования.
            Полная комплектация объектов любого масштаба.
          </p>
        </div>

        {/* Catalog */}
        <div>
          <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">Каталог</h4>
          <ul className="space-y-2">
            {footerCatalog.map((item) => (
              <li key={item}>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* About */}
        <div>
          <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">О нас</h4>
          <ul className="space-y-2">
            {["О компании", "Политика безопасности", "Условия соглашения", "Контакты"].map((item) => (
              <li key={item}>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">Контакты</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-gray-400">
              <Phone className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
              <a href={`tel:${siteInfo.phone}`} className="hover:text-white transition-colors">{siteInfo.phone}</a>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-400">
              <Mail className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
              <a href={`mailto:${siteInfo.email}`} className="hover:text-white transition-colors">{siteInfo.email}</a>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-400">
              <MapPin className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
              <span>{siteInfo.address}</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-400">
              <Clock className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
              <span>{siteInfo.hours}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#2a2d32] py-4 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} {siteInfo.companyName}. Все права защищены.
      </div>
    </footer>
  );
}
