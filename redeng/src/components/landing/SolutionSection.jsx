const steps = [
  { num: "1", title: "Анализ", desc: "Изучаем вашу спецификацию и технические условия проекта" },
  { num: "2", title: "Подбор", desc: "Подбираем совместимое оборудование от проверенных производителей" },
  { num: "3", title: "Комплектация", desc: "Формируем полный комплект на нашем складе" },
  { num: "4", title: "Отгрузка", desc: "Доставляем единым паллетом на ваш объект за 7 рабочих дней" },
];

export default function SolutionSection() {
  return (
    <section id="solution" className="bg-[#111214] py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <span className="text-[#8a8f9a] text-sm font-medium tracking-widest uppercase mb-4 block">Наш подход</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Мы формируем комплект под вашу спецификацию
            </h2>
            <p className="text-[#8a8f9a] text-lg leading-relaxed mb-8">
              Один ответственный поставщик. Один счёт. Одна дата отгрузки. Всё оборудование совместимо и проверено до отправки.
            </p>
            <a
              href="#cta"
              className="inline-flex items-center gap-2 text-red-500 font-semibold text-base hover:text-red-400 transition-colors"
            >
              Оставить заявку
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-0">
            {steps.map((s, i) => (
              <div key={s.num} className="relative flex gap-6 pb-10 last:pb-0">
                {/* Vertical line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-0 w-px bg-gradient-to-b from-red-600/40 to-transparent" />
                )}
                {/* Circle */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full border border-red-600/50 bg-red-600/10 flex items-center justify-center z-10">
                  <span className="text-red-500 font-bold text-sm">{s.num}</span>
                </div>
                <div className="pt-1.5">
                  <h3 className="text-white font-semibold text-lg mb-1">{s.title}</h3>
                  <p className="text-[#8a8f9a] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}