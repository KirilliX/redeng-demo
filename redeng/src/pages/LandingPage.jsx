import { useEffect, useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  FileUp,
  FolderKanban,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import BrandMark from "@/components/BrandMark";
import OtherSolutionsSection from "@/components/landing/OtherSolutionsSection";
import StickyAdsPanel from "@/components/landing/StickyAdsPanel";
import SeoMeta from "@/components/SeoMeta";
import { utpCatalog } from "@/content/utpCatalog";
import { submitLead } from "@/lib/api";
import { CATALOG_PATH, CRM_PATH } from "@/lib/routes";
import { getLeadTracking, initializeTracking } from "@/lib/utm";

function buildInitialValues(fields) {
  const initialValues = {};

  for (const field of fields) {
    if (field.type !== "file") {
      initialValues[field.name] = "";
    }
  }

  return initialValues;
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="max-w-3xl">
      <div className="text-sm uppercase tracking-[0.35em] text-red-500">{eyebrow}</div>
      <h2 className="mt-4 text-3xl font-bold text-white md:text-5xl">{title}</h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-[#8f96a3] md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

function LeadCaptureSection({ landing, onSentChange }) {
  const [values, setValues] = useState(buildInitialValues(landing.form.fields));
  const [attachment, setAttachment] = useState(null);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues(buildInitialValues(landing.form.fields));
    setAttachment(null);
    setSent(false);
    setSubmitError("");
    setIsSubmitting(false);
    onSentChange(false);
  }, [landing.form.fields, landing.slug, onSentChange]);

  function updateField(name, nextValue) {
    setValues((currentValues) => ({
      ...currentValues,
      [name]: nextValue,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitError("");
      setIsSubmitting(true);

      await submitLead({
        landingSlug: landing.slug,
        values,
        tracking: getLeadTracking(landing.slug),
        attachment,
      });

      setSent(true);
      onSentChange(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Не удалось отправить заявку.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      id="lead-form"
      className="relative overflow-hidden border-t border-white/10 bg-[#0d0e10] py-20 lg:py-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.05),_transparent_30%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1fr_480px] lg:px-10">
        <div>
          <SectionHeading
            eyebrow="Форма заявки"
            title={landing.form.title}
            description={landing.form.description}
          />

          <div className="mt-10 flex flex-col gap-4">
            {landing.form.highlights.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-red-500/40 bg-red-500/15 text-red-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="text-base leading-relaxed text-[#c7ccd4]">{point}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="text-sm uppercase tracking-[0.35em] text-[#8a8f9a]">
              Как попадает в CRM
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                "UTM-метки сохраняются при первом визите",
                "Заявка автоматически фиксируется в базе данных",
                "Карточка сразу появляется на канбан-доске",
              ].map((point) => (
                <div key={point} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#aeb4bf]">
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#15171a] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {landing.form.fields.map((field) => (
                <div key={field.name}>
                  <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#7f8692]">
                    {field.label}
                    {field.required ? " *" : ""}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      required={field.required}
                      value={values[field.name] ?? ""}
                      onChange={(event) => updateField(field.name, event.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#5d6470] focus:border-red-500/40"
                    />
                  ) : field.type === "file" ? (
                    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-sm text-[#c4c9d4] transition-colors hover:border-red-500/35 hover:bg-white/10">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
                          <FileUp className="h-5 w-5" />
                        </div>
                        <div>
                          <div>{attachment ? attachment.name : "Выберите файл"}</div>
                          <div className="text-xs text-[#6c7380]">
                            {field.accept ?? "PDF, DOCX, XLSX, ZIP"}
                          </div>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept={field.accept}
                        onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      value={values[field.name] ?? ""}
                      onChange={(event) => updateField(field.name, event.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#5d6470] focus:border-red-500/40"
                    />
                  )}
                </div>
              ))}

              {submitError && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Отправляем заявку..." : landing.form.submitLabel}
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-xs leading-relaxed text-[#5f6672]">
                Отправляя форму, вы разрешаете связаться с вами по поводу расчёта,
                коммерческого предложения и уточнения параметров поставки.
              </p>
            </form>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="mt-8 text-2xl font-semibold text-white">
                {landing.form.successTitle}
              </h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-[#8f96a3]">
                {landing.form.successText}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setValues(buildInitialValues(landing.form.fields));
                  setAttachment(null);
                  onSentChange(false);
                }}
                className="mt-8 rounded-full border border-white/10 px-5 py-3 text-sm text-white transition-colors hover:border-white/25"
              >
                Отправить ещё одну заявку
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({ landing }) {
  const [isLeadSent, setIsLeadSent] = useState(false);

  useEffect(() => {
    initializeTracking(landing.slug);
  }, [landing.slug]);

  return (
    <div className="min-h-screen bg-[#111214] text-white">
      <SeoMeta title={landing.seoTitle} description={landing.seoDescription} />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111214]/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-6">
            <Link
              to={CATALOG_PATH}
              className="inline-flex items-center gap-2 text-sm text-[#8a8f9a] transition-colors hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Все лендинги
            </Link>
            <BrandMark compact />
          </div>

          <div className="hidden items-center gap-6 text-sm text-[#8a8f9a] md:flex">
            <a href="#problem" className="transition-colors hover:text-white">
              Проблема
            </a>
            <a href="#solution" className="transition-colors hover:text-white">
              Решение
            </a>
            <a href="#benefits" className="transition-colors hover:text-white">
              Преимущества
            </a>
            <a href="#lead-form" className="transition-colors hover:text-white">
              Форма
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={CRM_PATH}
              className="hidden items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-[#d5d9df] transition-colors hover:border-white/25 hover:text-white lg:inline-flex"
            >
              <FolderKanban className="h-4 w-4" />
              CRM
            </Link>
            <a
              href="#lead-form"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              {landing.hero.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="pb-40 lg:pb-48">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(220,38,38,0.16),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.06),_transparent_25%)]" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
          <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-10 lg:pb-24 lg:pt-24">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-[#8a8f9a]">
                  {landing.hero.eyebrow}
                </div>
                <h1 className="mt-8 max-w-5xl text-4xl font-bold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-7xl">
                  {landing.hero.title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#9da3af] md:text-2xl">
                  {landing.hero.subtitle}
                </p>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#lead-form"
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-red-600 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    {landing.hero.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#lead-form"
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-white/10"
                  >
                    <FileUp className="h-4 w-4 text-[#9ca3af]" />
                    {landing.hero.secondaryCta}
                  </a>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                <div className="text-xs uppercase tracking-[0.35em] text-[#7e8591]">
                  Главный оффер
                </div>
                <p className="mt-4 text-2xl font-semibold leading-tight text-white">
                  {landing.usp}
                </p>
                <div className="mt-6 space-y-4">
                  {landing.stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                      <div className="text-lg font-semibold text-white">{stat.value}</div>
                      <div className="mt-1 text-sm text-[#8a8f9a]">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <SectionHeading
            eyebrow={landing.audienceTitle}
            title="Ключевая аудитория лендинга"
            description="Страница сфокусирована на тех ролях, которые принимают решение, влияют на подбор или отвечают за закупку."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {landing.audience.map((item) => (
              <div
                key={item}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-base leading-relaxed text-[#d4d8de]"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section id="problem" className="border-y border-white/10 bg-[#0d0e10]">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
            <SectionHeading
              eyebrow="Проблема рынка"
              title={landing.problemTitle}
              description="На каждом лендинге мы усиливаем ту боль, с которой B2B-заказчик приходит в поиск или рекламу."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {landing.problems.map((item, index) => (
                <article
                  key={item}
                  className="rounded-[28px] border border-white/10 bg-[#15171a] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.24)]"
                >
                  <div className="text-5xl font-black leading-none text-white/10">
                    0{index + 1}
                  </div>
                  <p className="mt-6 text-base leading-relaxed text-[#c6cbd4]">{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="solution" className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div>
              <SectionHeading
                eyebrow="Решение"
                title={landing.solutionTitle}
                description={landing.solutionLead}
              />

              <div className="mt-8 grid gap-4">
                {landing.solutionChecks.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="text-base leading-relaxed text-[#d2d7de]">{item}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(220,38,38,0.13),rgba(255,255,255,0.03))] p-7">
              <div className="text-sm uppercase tracking-[0.35em] text-[#8a8f9a]">
                Как выглядит цикл работы
              </div>
              <div className="mt-8 space-y-5">
                {[
                  "Получаем вводные, спецификацию или проект.",
                  "Проверяем состав заявки и сверяем требования.",
                  "Собираем коммерческое предложение и комплект документов.",
                  "Передаём заявку в CRM и ведём до отгрузки.",
                ].map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div className="pt-1 text-sm leading-relaxed text-[#d6dae1]">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="border-y border-white/10 bg-[#0d0e10]">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
            <SectionHeading
              eyebrow="Преимущества"
              title={landing.benefitsTitle}
              description="Этот блок усиливает решение аргументами, которые важны и инженеру, и снабжению, и руководителю проекта."
            />

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              {landing.benefits.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[28px] border border-white/10 bg-[#15171a] p-7 shadow-[0_16px_60px_rgba(0,0,0,0.24)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-[#9ca3af]">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-7">
              <SectionHeading
                eyebrow="Применение"
                title={landing.applicationsTitle}
                description="Это помогает посетителю быстро соотнести страницу со своей реальной задачей и объектом."
              />
              <div className="mt-8 flex flex-wrap gap-3">
                {landing.applications.map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-[#d2d7de]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-7">
              <SectionHeading
                eyebrow="B2B-аргументы"
                title={landing.b2bTitle}
                description="Этот блок усиливает доверие со стороны отдела снабжения, инженеров и project team."
              />
              <div className="mt-8 space-y-4">
                {landing.b2bArguments.map((item) => (
                  <div key={item} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-red-400">
                      <FolderKanban className="h-4 w-4" />
                    </div>
                    <div className="text-sm leading-relaxed text-[#d4d9e0]">{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <LeadCaptureSection landing={landing} onSentChange={setIsLeadSent} />
        <OtherSolutionsSection currentSlug={landing.slug} landings={utpCatalog} />
      </main>

      <StickyAdsPanel landing={landing} isFormSubmitted={isLeadSent} />
    </div>
  );
}
