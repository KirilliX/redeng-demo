const stats = [
  { value: "10+", label: "лет поставок", desc: "Работаем с 2013 года" },
  { value: "300+", label: "реализованных объектов", desc: "Промышленные и гражданские" },
  { value: "7", label: "дней до отгрузки", desc: "Склад в Москве" },
  { value: "100%", label: "совместимость", desc: "Проверяем до отправки" },
];

export default function TrustSection() {
  return (
    <section id="trust" className="bg-[#111214] py-28 relative overflow-hidden">
      {/* Large background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[20vw] font-black text-white/[0.02] whitespace-nowrap leading-none">TRUST</span>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-20">
          <span className="text-[#8a8f9a] text-sm font-medium tracking-widest uppercase mb-4 block">Почему нам доверяют</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Надёжность в цифрах
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-sm overflow-hidden">
          {stats.map((s) => (
            <div key={s.value} className="bg-[#111214] p-10 md:p-14 text-center group hover:bg-[#161719] transition-colors duration-300">
              <div className="text-5xl md:text-7xl font-black text-white mb-2 group-hover:text-red-500 transition-colors duration-300">
                {s.value}
              </div>
              <div className="text-white font-semibold text-base mb-1">{s.label}</div>
              <div className="text-[#8a8f9a] text-sm">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Logos placeholder */}
        <div className="mt-20 text-center">
          <p className="text-[#8a8f9a] text-sm mb-8 tracking-wider uppercase">Среди наших клиентов</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-30">
            {["ГЕНПОДРЯДЧИК А", "ТГК-14", "МОСЭНЕРГО", "ТЕПЛОСЕТЬ СПБ", "РОСАТОМ"].map((name) => (
              <span key={name} className="text-white font-bold text-sm tracking-widest">{name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}