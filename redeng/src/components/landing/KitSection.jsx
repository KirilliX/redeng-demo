import { Settings, Sliders, Zap, Gauge, Wrench } from "lucide-react";

const items = [
  {
    icon: Settings,
    title: "Запорная арматура",
    desc: "Шаровые краны, задвижки, обратные клапаны. Диаметры DN15–DN500. Фланцевое и муфтовое исполнение.",
    tags: ["DN15–500", "Фланцы", "Сварка"],
  },
  {
    icon: Sliders,
    title: "Регулирующая арматура",
    desc: "Регулирующие клапаны, балансировочные вентили, смесительные узлы для систем ГВС и отопления.",
    tags: ["ГВС", "Отопление", "Термостат"],
  },
  {
    icon: Zap,
    title: "Насосное оборудование",
    desc: "Циркуляционные насосы, насосные группы Grundfos, Wilo, Danfoss. Подбор по проекту.",
    tags: ["Grundfos", "Wilo", "Danfoss"],
  },
  {
    icon: Gauge,
    title: "КИП",
    desc: "Манометры, термометры, расходомеры, теплосчётчики, датчики давления и температуры.",
    tags: ["Термометры", "Расходомеры", "Датчики"],
  },
  {
    icon: Wrench,
    title: "Фланцы и крепёж",
    desc: "Фланцы стальные плоские и приварные, прокладки, болты и гайки — комплект к каждой позиции.",
    tags: ["ГОСТ", "DIN", "EN 1092"],
  },
];

export default function KitSection() {
  return (
    <section id="kit" className="bg-[#0d0e10] py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <span className="text-[#8a8f9a] text-sm font-medium tracking-widest uppercase mb-4 block">Состав комплекта</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Всё необходимое — в одной поставке
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const Icon = item.icon;
            const isLast = i === items.length - 1;
            return (
              <div
                key={item.title}
                className={`group bg-[#161719] hover:bg-[#1c1e21] border border-white/5 hover:border-red-600/20 rounded-sm p-8 transition-all duration-300 ${
                  isLast ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-sm bg-red-600/10 border border-red-600/20 flex items-center justify-center mb-6 group-hover:bg-red-600/20 transition-colors">
                  <Icon className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-3">{item.title}</h3>
                <p className="text-[#8a8f9a] text-sm leading-relaxed mb-5">{item.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-[#8a8f9a] bg-white/5 border border-white/8 px-2.5 py-1 rounded-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}