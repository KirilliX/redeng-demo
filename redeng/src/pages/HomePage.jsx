import { ShieldCheck, Truck, Layers, MapPin, Package, ChevronRight, MessageCircle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import {
  features,
  categories,
  productCarousels,
  news,
  aboutText,
  services,
} from "@/content/homeContent";

const featureIcons = {
  shield: ShieldCheck,
  truck: Truck,
  layers: Layers,
  "map-pin": MapPin,
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#111214] text-white">
      <HomeHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0d0f11] border-b border-[#2a2d32]">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #dc2626 0, #dc2626 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 flex flex-col gap-6">
          <p className="text-red-500 text-sm font-semibold uppercase tracking-widest">
            B2B-комплектация инженерных систем
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white max-w-2xl leading-tight">
            Комплексные решения современных инженерных систем
          </h1>
          <p className="text-gray-400 max-w-xl text-base sm:text-lg leading-relaxed">
            Поставка трубопроводной арматуры, насосного оборудования, КИП и автоматики.
            Официальный дилер ведущих мировых производителей.
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded transition-colors">
              Перейти в каталог
            </button>
            <button className="border border-[#2a2d32] hover:border-red-600 text-gray-300 hover:text-white font-semibold px-6 py-3 rounded transition-colors">
              Связаться с нами
            </button>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="bg-[#1a1d21] border-b border-[#2a2d32]">
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => {
            const Icon = featureIcons[f.icon] || Package;
            return (
              <div key={f.label} className="flex items-center gap-3">
                <div className="bg-red-600/10 rounded-lg p-2 shrink-0">
                  <Icon className="h-5 w-5 text-red-500" />
                </div>
                <span className="text-sm text-gray-300 font-medium">{f.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wide">
            Категории товаров
          </h2>
          <a href="#" className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1 transition-colors">
            Все категории <ChevronRight className="h-4 w-4" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="bg-[#1a1d21] border border-[#2a2d32] rounded-lg p-6 hover:border-red-600/40 transition-colors group"
            >
              <div className="h-32 bg-[#111214] rounded mb-5 flex items-center justify-center border border-[#2a2d32]">
                <Package className="h-12 w-12 text-[#2a2d32] group-hover:text-red-600/30 transition-colors" />
              </div>
              <h3 className="font-bold text-white mb-3 text-base">{cat.title}</h3>
              <ul className="space-y-1.5">
                {cat.items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-red-400 text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
              <a href="#" className="mt-4 inline-block text-red-500 text-sm hover:text-red-400 transition-colors">
                все категории →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-gradient-to-r from-red-900/40 to-[#1a1d21] border-y border-[#2a2d32]">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Индивидуальный подход</h3>
            <p className="text-gray-400 text-sm">Наши специалисты свяжутся с вами и найдут оптимальные условия</p>
          </div>
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded transition-colors whitespace-nowrap shrink-0">
            <MessageCircle className="h-4 w-4" />
            Обратная связь
          </button>
        </div>
      </section>

      {/* Product carousels */}
      {productCarousels.map((section) => (
        <section key={section.title} className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wide">
              {section.title}
            </h2>
            <a href={section.href} className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1 transition-colors">
              Все <ChevronRight className="h-4 w-4" />
            </a>
          </div>
          <Carousel opts={{ align: "start", loop: false }} className="w-full px-12">
            <CarouselContent>
              {section.products.map((product) => (
                <CarouselItem key={product.name} className="basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                  <a href="#" className="block group">
                    <div className="bg-[#1a1d21] border border-[#2a2d32] rounded-lg overflow-hidden hover:border-red-600/40 transition-colors">
                      <div className="aspect-square bg-[#111214] flex items-center justify-center">
                        <Package className="h-10 w-10 text-[#2a2d32] group-hover:text-red-600/30 transition-colors" />
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-400 leading-snug line-clamp-2 group-hover:text-gray-300 transition-colors uppercase tracking-wide">
                          {product.name}
                        </p>
                      </div>
                    </div>
                  </a>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-[#2a2d32] bg-[#1a1d21] hover:bg-[#2a2d32] text-white" />
            <CarouselNext className="border-[#2a2d32] bg-[#1a1d21] hover:bg-[#2a2d32] text-white" />
          </Carousel>
        </section>
      ))}

      {/* News */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-[#2a2d32]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wide">Новости</h2>
          <a href="#" className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1 transition-colors">
            Все новости <ChevronRight className="h-4 w-4" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {news.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="bg-[#1a1d21] border border-[#2a2d32] rounded-lg p-5 hover:border-red-600/40 transition-colors group"
            >
              <p className="text-xs text-gray-500 mb-2">{item.date}</p>
              <h4 className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors leading-snug">
                {item.title}
              </h4>
            </a>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-[#1a1d21] border-y border-[#2a2d32]">
        <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 uppercase tracking-wide">
              Поставляем промышленное оборудование
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">{aboutText}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "20+", label: "лет на рынке" },
              { value: "5000+", label: "позиций в наличии" },
              { value: "50+", label: "брендов-партнёров" },
              { value: "100%", label: "контроль качества" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#111214] border border-[#2a2d32] rounded-lg p-5 text-center">
                <div className="text-2xl font-black text-red-500 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wide">Услуги</h2>
          <a href="#" className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1 transition-colors">
            Все услуги <ChevronRight className="h-4 w-4" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-[#1a1d21] border border-[#2a2d32] rounded-lg overflow-hidden hover:border-red-600/40 transition-colors group"
            >
              <div className="h-40 bg-[#111214] flex items-center justify-center border-b border-[#2a2d32]">
                <Package className="h-12 w-12 text-[#2a2d32] group-hover:text-red-600/30 transition-colors" />
              </div>
              <div className="p-5">
                <h4 className="font-bold text-white mb-2 text-sm">{service.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <HomeFooter />
    </div>
  );
}
