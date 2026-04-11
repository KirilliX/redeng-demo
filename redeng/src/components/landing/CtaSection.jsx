import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function CtaSection() {
  const [form, setForm] = useState({ name: "", company: "", phone: "", comment: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="cta" className="bg-[#0d0e10] py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-red-600/5 blur-3xl" />
        <div className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full bg-red-600/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <span className="text-red-500 text-sm font-medium tracking-widest uppercase mb-4 block">Оставить заявку</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Получить расчёт комплекта
            </h2>
            <p className="text-[#8a8f9a] text-lg leading-relaxed mb-10">
              Оставьте контакты и опишите объект — наш инженер подберёт комплект и пришлёт КП в течение одного рабочего дня.
            </p>

            <div className="flex flex-col gap-5">
              {[
                "Бесплатный технический подбор",
                "Совместимость гарантирована",
                "Отгрузка в 7 рабочих дней",
              ].map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-600/20 border border-red-600/40 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  </div>
                  <span className="text-[#c4c9d4] text-base">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-[#161719] border border-white/8 rounded-sm p-8 md:p-10">
            {!sent ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#8a8f9a] text-xs tracking-wider uppercase mb-2 block">Ваше имя</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Иван Петров"
                      className="w-full bg-white/5 border border-white/10 focus:border-red-600/50 rounded-sm px-4 py-3 text-white placeholder-[#4a4f5a] text-sm outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[#8a8f9a] text-xs tracking-wider uppercase mb-2 block">Компания</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="ООО Стройпроект"
                      className="w-full bg-white/5 border border-white/10 focus:border-red-600/50 rounded-sm px-4 py-3 text-white placeholder-[#4a4f5a] text-sm outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[#8a8f9a] text-xs tracking-wider uppercase mb-2 block">Телефон *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+7 (___) ___-__-__"
                    className="w-full bg-white/5 border border-white/10 focus:border-red-600/50 rounded-sm px-4 py-3 text-white placeholder-[#4a4f5a] text-sm outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[#8a8f9a] text-xs tracking-wider uppercase mb-2 block">Комментарий к объекту</label>
                  <textarea
                    rows={4}
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    placeholder="Тип объекта, диаметры, особые требования..."
                    className="w-full bg-white/5 border border-white/10 focus:border-red-600/50 rounded-sm px-4 py-3 text-white placeholder-[#4a4f5a] text-sm outline-none transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 rounded-sm flex items-center justify-center gap-3 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Получить расчёт
                </button>
                <p className="text-[#4a4f5a] text-xs text-center">
                  Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
                </p>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle className="w-16 h-16 text-red-500 mb-6" />
                <h3 className="text-white text-2xl font-bold mb-3">Заявка принята!</h3>
                <p className="text-[#8a8f9a] leading-relaxed">
                  Наш инженер свяжется с вами в течение одного рабочего дня.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 mt-24 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-600 rounded-sm" />
          <span className="text-white font-semibold text-sm tracking-widest uppercase">R-ENG</span>
        </div>
        <p className="text-[#4a4f5a] text-xs">© 2026 R-ENG. Все права защищены.</p>
      </div>
    </section>
  );
}
