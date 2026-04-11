import { ArrowRight, Upload } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920&q=80"
          alt="Тепловой узел"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111214] via-[#111214]/80 to-[#111214]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111214] via-transparent to-[#111214]/60" />
      </div>

      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 pt-28 pb-20 flex flex-col min-h-screen justify-between">
        <div className="max-w-3xl">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[#8a8f9a] text-xs tracking-widest uppercase font-medium">Поставка под ключ</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6">
            Комплект оборудования{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#8a8f9a]">
              для теплового узла
            </span>{" "}
            <span className="text-red-500">за 7 дней</span>
          </h1>

          <p className="text-[#8a8f9a] text-lg md:text-2xl font-light leading-relaxed mb-10 max-w-xl">
            Полный набор арматуры, насосов и КИП под&nbsp;ваш проект — без разрозненных поставщиков.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#cta"
              className="group inline-flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-sm transition-all duration-200"
            >
              Получить расчёт
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#cta"
              className="inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold px-8 py-4 rounded-sm transition-all duration-200"
            >
              <Upload className="w-5 h-5 text-[#8a8f9a]" />
              Загрузить проект
            </a>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div className="mt-16 md:mt-24">
          <div className="flex flex-wrap gap-8 md:gap-16 border-t border-white/10 pt-8">
            {[
              { value: "10+", label: "лет на рынке" },
              { value: "300+", label: "реализованных объектов" },
              { value: "7 дней", label: "срок отгрузки" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-[#8a8f9a] text-sm mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}