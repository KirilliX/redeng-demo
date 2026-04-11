import { useMemo } from "react";

import { useQueries } from "@tanstack/react-query";
import {
  ArrowRight,
  Boxes,
  FolderKanban,
  LineChart,
  Megaphone,
  MessageSquareText,
  Star,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";

import BrandMark from "@/components/BrandMark";
import SeoMeta from "@/components/SeoMeta";
import { utpCatalog } from "@/content/utpCatalog";
import { fetchLandingAdFeedback } from "@/lib/api";
import { CRM_PATH } from "@/lib/routes";

const platformHighlights = [
  {
    title: "8 направлений и 8 УТП",
    text: "Каждый лендинг показывает отдельную гипотезу для Яндекс Директ и раскрывает свой оффер для B2B-аудитории.",
    icon: Boxes,
  },
  {
    title: "32 объявления для сравнения",
    text: "Под каждым направлением есть 4 формулировки, которые заказчик может открыть, оценить и прокомментировать.",
    icon: Megaphone,
  },
  {
    title: "UTM и общая воронка",
    text: "Все обращения попадают в единый контур с привязкой к лендингу, источнику трафика и рекламной кампании.",
    icon: LineChart,
  },
  {
    title: "CRM-демо для презентации",
    text: "Отдельный экран показывает, как лид двигается по этапам, получает ответственного и доходит до КП.",
    icon: FolderKanban,
  },
];

const demoSteps = [
  {
    title: "Выбрать направление",
    text: "Заказчик открывает витрину и сравнивает 8 офферов по разным продуктовым и инженерным сценариям.",
  },
  {
    title: "Посмотреть лендинг и объявления",
    text: "Внутри страницы он изучает структуру оффера, а внизу открывает рекламные объявления и оценивает формулировки.",
  },
  {
    title: "Оставить комментарии и перейти в CRM",
    text: "После оценки объявлений можно открыть CRM и увидеть, как заявки попадают в канбан и распределяются по менеджерам.",
  },
];

function formatAverage(value) {
  if (!value) {
    return null;
  }

  return value.toLocaleString("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export default function CatalogPage() {
  const feedbackQueries = useQueries({
    queries: utpCatalog.map((landing) => ({
      queryKey: ["landing-ad-feedback", landing.slug],
      queryFn: () => fetchLandingAdFeedback(landing.slug),
      staleTime: 30_000,
    })),
  });

  const feedbackSummaryBySlug = useMemo(
    () =>
      Object.fromEntries(
        utpCatalog.map((landing, index) => {
          const items = Array.isArray(feedbackQueries[index]?.data)
            ? feedbackQueries[index].data
            : [];
          const ratedItems = items.filter((item) => item.rating);
          const commentsCount = items.filter((item) => item.comment).length;
          const averageRating = ratedItems.length
            ? ratedItems.reduce((sum, item) => sum + item.rating, 0) / ratedItems.length
            : null;

          return [
            landing.slug,
            {
              ratedCount: ratedItems.length,
              commentsCount,
              averageRating,
            },
          ];
        }),
      ),
    [feedbackQueries],
  );

  const overallFeedback = useMemo(() => {
    return Object.values(feedbackSummaryBySlug).reduce(
      (result, item) => ({
        ratedCount: result.ratedCount + item.ratedCount,
        commentsCount: result.commentsCount + item.commentsCount,
        averageRatingTotal:
          result.averageRatingTotal +
          (item.averageRating ? item.averageRating * item.ratedCount : 0),
      }),
      {
        ratedCount: 0,
        commentsCount: 0,
        averageRatingTotal: 0,
      },
    );
  }, [feedbackSummaryBySlug]);

  const overallAverage =
    overallFeedback.ratedCount > 0
      ? overallFeedback.averageRatingTotal / overallFeedback.ratedCount
      : null;

  return (
    <div className="min-h-screen bg-[#111214] text-white">
      <SeoMeta
        title="RED Engineering | Витрина лендингов и CRM"
        description="Демонстрационная витрина RED Engineering: 8 B2B-лендингов, 32 рекламных объявления с оценкой и CRM-сценарий обработки заявок."
      />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111214]/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link to="/" className="transition-opacity hover:opacity-90">
            <BrandMark subtitle="Demo Hub RED Engineering" />
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="#variants"
              className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-[#c4c9d4] transition-colors hover:border-white/20 hover:text-white md:inline-flex"
            >
              Все направления
            </a>
            <Link
              to={CRM_PATH}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Открыть CRM-демо
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(220,38,38,0.16),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.08),_transparent_28%)]" />
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-[#8a8f9a]">
                Landing Hub RED Engineering
              </div>
              <h1 className="max-w-5xl text-4xl font-bold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-7xl">
                Инженерные решения и поставки оборудования
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#9fa4af] md:text-xl">
                Это витрина для заказчика: здесь он сравнивает 8 лендингов, смотрит
                рекламные объявления для Яндекс Директ, ставит оценки и затем открывает
                CRM, чтобы увидеть весь путь заявки от формы до канбан-доски.
              </p>

              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {platformHighlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm"
                    >
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-[#8a8f9a]">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <aside className="mt-10 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(220,38,38,0.14),rgba(255,255,255,0.04))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-7">
              <div className="text-xs uppercase tracking-[0.35em] text-red-200">
                Сводка по демо
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="text-3xl font-semibold text-white">8</div>
                  <div className="mt-2 text-sm text-[#cfd5dd]">лендингов под отдельные УТП</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="text-3xl font-semibold text-white">32</div>
                  <div className="mt-2 text-sm text-[#cfd5dd]">объявления для сравнения и оценки</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-semibold text-white">
                      {overallFeedback.ratedCount}
                    </div>
                    <div className="text-sm text-[#8a8f9a]">/ 32 оценено</div>
                  </div>
                  <div className="mt-2 text-sm text-[#cfd5dd]">
                    Средняя оценка: {overallAverage ? `${formatAverage(overallAverage)}★` : "пока нет"}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="text-3xl font-semibold text-white">
                    {overallFeedback.commentsCount}
                  </div>
                  <div className="mt-2 text-sm text-[#cfd5dd]">
                    комментариев оставлено заказчиком
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <Workflow className="h-4 w-4 text-red-300" />
                  Как показывать демо
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  {demoSteps.map((step, index) => (
                    <div key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-[#cdd3dc]">
                      <div className="text-xs uppercase tracking-[0.3em] text-[#8a8f9a]">
                        Шаг {index + 1}
                      </div>
                      <div className="mt-2 text-base font-medium text-white">{step.title}</div>
                      <div className="mt-2">{step.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-12">
          <div className="rounded-[32px] border border-white/10 bg-[#121418] p-6 sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.35em] text-red-500">
                  Сценарий демонстрации
                </div>
                <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                  Лендинг, объявления и CRM в одной цепочке
                </h2>
              </div>
              <Link
                to={CRM_PATH}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white transition-colors hover:border-white/20"
              >
                Перейти в CRM-демо
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
                  <Boxes className="h-5 w-5" />
                </div>
                <div className="mt-4 text-xl font-semibold text-white">1. УТП и лендинг</div>
                <div className="mt-3 text-sm leading-relaxed text-[#8f96a3]">
                  Каждое направление оформлено как самостоятельная посадочная страница с
                  собственным оффером, аргументацией и CTA.
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div className="mt-4 text-xl font-semibold text-white">2. Объявления и обратная связь</div>
                <div className="mt-3 text-sm leading-relaxed text-[#8f96a3]">
                  Внизу страницы заказчик открывает 4 объявления, сравнивает подачу,
                  ставит звезды и оставляет комментарии.
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div className="mt-4 text-xl font-semibold text-white">3. CRM и обработка лида</div>
                <div className="mt-3 text-sm leading-relaxed text-[#8f96a3]">
                  CRM показывает, как заявка попадает в канбан, получает ответственного и
                  проходит путь до коммерческого предложения.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="variants" className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-16">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.35em] text-red-500">
                Направления и УТП
              </div>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                Карточки лендингов для показа заказчику
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-[#8a8f9a]">
              На каждой карточке видно, какой оффер демонстрируется, сколько объявлений
              уже оценено и с каким средним рейтингом заказчик отреагировал на формулировки.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {utpCatalog.map((landing) => {
              const feedback = feedbackSummaryBySlug[landing.slug] ?? {
                ratedCount: 0,
                commentsCount: 0,
                averageRating: null,
              };

              return (
                <article
                  key={landing.slug}
                  className="group rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.35em] text-[#8a8f9a]">
                        {landing.category}
                      </div>
                      <h3 className="mt-3 text-2xl font-semibold text-white">
                        {landing.utp.name}
                      </h3>
                    </div>
                    <div className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
                      4 Ads
                    </div>
                  </div>

                  <p className="mt-5 text-base leading-relaxed text-[#9aa0aa]">
                    {landing.annotation}
                  </p>

                  <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="text-xs uppercase tracking-[0.35em] text-[#707784]">
                      Ключевой оффер
                    </div>
                    <p className="mt-3 text-lg font-medium text-white">{landing.usp}</p>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#7f8692]">
                        <Star className="h-3.5 w-3.5 text-amber-300" />
                        Рейтинг
                      </div>
                      <div className="mt-3 text-xl font-semibold text-white">
                        {feedback.averageRating
                          ? `${formatAverage(feedback.averageRating)}★`
                          : "Нет"}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#7f8692]">
                        <Megaphone className="h-3.5 w-3.5 text-red-300" />
                        Оценено
                      </div>
                      <div className="mt-3 text-xl font-semibold text-white">
                        {feedback.ratedCount} / 4
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#7f8692]">
                        <MessageSquareText className="h-3.5 w-3.5 text-sky-300" />
                        Комментарии
                      </div>
                      <div className="mt-3 text-xl font-semibold text-white">
                        {feedback.commentsCount}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="text-xs uppercase tracking-[0.35em] text-[#707784]">
                      Пример объявления
                    </div>
                    <div className="mt-3 text-base font-medium text-white">
                      {landing.ads[0]?.headline1}
                    </div>
                    <div className="mt-2 text-sm leading-relaxed text-[#8a8f9a]">
                      {landing.ads[0]?.description}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#b7bcc6]">
                      UTM-ready
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#b7bcc6]">
                      Sticky Ads Panel
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#b7bcc6]">
                      CRM-linked
                    </span>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                      to={`/${landing.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                    >
                      Открыть лендинг
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <div className="text-sm text-[#7f8692]">
                      Карточка {landing.number} из 8
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
