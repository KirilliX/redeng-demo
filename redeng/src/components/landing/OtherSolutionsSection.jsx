import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { CATALOG_PATH } from "@/lib/routes"

export default function OtherSolutionsSection({ currentSlug, landings }) {
  const otherLandings = landings.filter((landing) => landing.slug !== currentSlug)

  return (
    <section className="border-t border-white/10 bg-[#0d0e10]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="text-sm uppercase tracking-[0.35em] text-red-500">
              Другие решения
            </div>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
              Быстрый переход к другим УТП RED Engineering
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#8f96a3]">
              Если посетитель сравнивает направления или вы показываете клиенту
              несколько гипотез рекламы, соседние лендинги доступны без возврата в
              каталог.
            </p>
          </div>

          <Link
            to={CATALOG_PATH}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-white/5"
          >
            Открыть весь каталог
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {otherLandings.map((landing) => (
            <article
              key={landing.slug}
              className="rounded-[28px] border border-white/10 bg-white/5 p-6"
            >
              <div className="text-xs uppercase tracking-[0.35em] text-[#7d8490]">
                {landing.category}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">{landing.utp.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#959ca8]">
                {landing.utp.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#bdc2cb]">
                  4 объявления
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#bdc2cb]">
                  {landing.form.submitLabel}
                </span>
              </div>

              <Link
                to={`/${landing.slug}`}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Перейти
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
