import { AlertTriangle } from "lucide-react";

const pains = [
  {
    num: "01",
    title: "Срыв сроков",
    desc: "Разрозненные поставщики не укладываются в график строительства — объект стоит.",
  },
  {
    num: "02",
    title: "Несовместимость",
    desc: "Диаметры, фланцы и присоединительные размеры не совпадают — переделка на объекте.",
  },
  {
    num: "03",
    title: "Долгий подбор",
    desc: "Технический специалист тратит недели на согласование спецификаций с разными заводами.",
  },
];

export default function PainSection() {
  return (
    <section className="bg-[#0d0e10] py-28 relative overflow-hidden">
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-red-500 text-sm font-medium tracking-widest uppercase">Знакомая ситуация?</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-20 max-w-2xl">
          С чем сталкиваются монтажники и проектировщики
        </h2>

        <div className="grid md:grid-cols-3 gap-px bg-white/5 rounded-sm overflow-hidden">
          {pains.map((p) => (
            <div
              key={p.num}
              className="bg-[#0d0e10] p-10 md:p-12 group hover:bg-[#161719] transition-colors duration-300"
            >
              <div className="text-7xl font-black text-white/5 leading-none mb-6 group-hover:text-red-600/10 transition-colors">
                {p.num}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{p.title}</h3>
              <p className="text-[#8a8f9a] leading-relaxed text-base">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}