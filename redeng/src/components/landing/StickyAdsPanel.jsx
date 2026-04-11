import * as React from "react"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Megaphone,
  MessageSquareText,
  Sparkles,
  Star,
  X,
} from "lucide-react"

import {
  fetchLandingAdFeedback,
  saveAdFeedback as persistAdFeedback,
} from "@/lib/api"

function formatFeedbackDate(value) {
  if (!value) {
    return null
  }

  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function StickyAdsPanel({ landing, isFormSubmitted }) {
  const queryClient = useQueryClient()
  const defaultAdId = landing.ads[0]?.id ?? ""
  const [activeAdId, setActiveAdId] = React.useState(defaultAdId)
  const [isOpen, setIsOpen] = React.useState(false)
  const [draftsByAdId, setDraftsByAdId] = React.useState({})
  const [feedbackNotice, setFeedbackNotice] = React.useState("")
  const [feedbackError, setFeedbackError] = React.useState("")
  const [savingAdId, setSavingAdId] = React.useState("")

  const feedbackQuery = useQuery({
    queryKey: ["landing-ad-feedback", landing.slug],
    queryFn: () => fetchLandingAdFeedback(landing.slug),
  })

  const feedbackByAdId = {}

  for (const item of feedbackQuery.data ?? []) {
    feedbackByAdId[item.ad_id] = item
  }

  React.useEffect(() => {
    setActiveAdId(landing.ads[0]?.id ?? "")
    setIsOpen(false)
    setFeedbackNotice("")
    setFeedbackError("")
  }, [landing.ads, landing.slug])

  React.useEffect(() => {
    const nextDrafts = {}

    for (const ad of landing.ads) {
      const savedFeedback = feedbackByAdId[ad.id]

      nextDrafts[ad.id] = {
        rating: savedFeedback?.rating ?? 0,
        comment: savedFeedback?.comment ?? "",
      }
    }

    setDraftsByAdId(nextDrafts)
  }, [feedbackQuery.data, landing.ads])

  React.useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const activeAd =
    landing.ads.find((ad) => ad.id === activeAdId) ?? landing.ads[0] ?? null
  const activeFeedback = activeAd ? feedbackByAdId[activeAd.id] ?? null : null
  const activeDraft = activeAd
    ? draftsByAdId[activeAd.id] ?? { rating: 0, comment: "" }
    : { rating: 0, comment: "" }
  const loadError =
    feedbackQuery.error instanceof Error ? feedbackQuery.error.message : ""

  if (!landing.ads.length || isFormSubmitted) {
    return null
  }

  function handleOpen(adId) {
    setActiveAdId(adId)
    setIsOpen(true)
  }

  function updateDraft(adId, patch) {
    setDraftsByAdId((currentDrafts) => ({
      ...currentDrafts,
      [adId]: {
        rating: currentDrafts[adId]?.rating ?? 0,
        comment: currentDrafts[adId]?.comment ?? "",
        ...patch,
      },
    }))
    setFeedbackNotice("")
    setFeedbackError("")
  }

  async function handleSaveFeedback() {
    if (!activeAd) {
      return
    }

    if (!activeDraft.rating) {
      setFeedbackNotice("")
      setFeedbackError("Поставьте оценку от 1 до 5 звёзд, чтобы сохранить отзыв.")
      return
    }

    try {
      setSavingAdId(activeAd.id)
      setFeedbackError("")
      setFeedbackNotice("")

      const savedFeedback = await persistAdFeedback(activeAd.id, {
        rating: activeDraft.rating,
        comment: activeDraft.comment,
      })

      queryClient.setQueryData(["landing-ad-feedback", landing.slug], (current) => {
        const items = Array.isArray(current) ? [...current] : []
        const index = items.findIndex((item) => item.ad_id === savedFeedback.ad_id)

        if (index >= 0) {
          items[index] = savedFeedback
          return items
        }

        items.push(savedFeedback)
        return items
      })

      setDraftsByAdId((currentDrafts) => ({
        ...currentDrafts,
        [activeAd.id]: {
          rating: savedFeedback.rating ?? 0,
          comment: savedFeedback.comment ?? "",
        },
      }))

      setFeedbackNotice("Оценка и комментарий сохранены.")
    } catch (error) {
      setFeedbackError(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить оценку объявления.",
      )
    } finally {
      setSavingAdId("")
    }
  }

  return (
    <>
      <div className="fixed inset-x-4 bottom-4 z-30">
        <div className="mx-auto max-w-7xl rounded-[30px] border border-white/10 bg-[#0e0f12]/94 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.48)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="flex items-start gap-3 xl:min-w-[270px]">
              <div className="mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.35em] text-[#7f8692]">
                  Рекламные объявления
                </div>
                <div className="mt-2 text-sm font-medium text-white">
                  4 формулировки под текущее УТП
                </div>
                <div className="mt-1 text-sm leading-relaxed text-[#8e95a2]">
                  {landing.utp.description}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2">
                {landing.ads.map((ad) => (
                  <button
                    key={ad.id}
                    type="button"
                    onClick={() => handleOpen(ad.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-[#d2d7df] transition-colors hover:border-red-500/35 hover:bg-red-500/10 hover:text-white"
                  >
                    <Sparkles className="h-4 w-4 text-red-400" />
                    {ad.label}
                    {feedbackByAdId[ad.id]?.rating ? (
                      <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-300">
                        {feedbackByAdId[ad.id].rating}★
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <a
              href="#lead-form"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 xl:flex-shrink-0"
            >
              {landing.form.submitLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {isOpen && activeAd && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/80 p-4 sm:items-center sm:justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-[30px] border border-white/10 bg-[#121418] text-white shadow-[0_32px_120px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-6 border-b border-white/10 px-6 py-6 sm:px-8">
              <div className="max-w-2xl">
                <div className="text-xs uppercase tracking-[0.35em] text-red-500">
                  Рекламные объявления
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                  {landing.utp.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#98a0ad]">
                  Переключайте формулировки и сравнивайте, как меняется подача
                  одного и того же оффера для рекламы и презентации клиенту.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#b7bcc6] transition-colors hover:border-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6 sm:px-8 sm:py-8">
              <div className="grid gap-2 md:grid-cols-4">
                {landing.ads.map((ad) => (
                  <button
                    key={ad.id}
                    type="button"
                    onClick={() => setActiveAdId(ad.id)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                      ad.id === activeAdId
                        ? "border-red-500/35 bg-red-500/12 text-white"
                        : "border-white/10 bg-white/5 text-[#cdd2da] hover:border-red-500/25 hover:bg-red-500/8 hover:text-white"
                    }`}
                  >
                    {ad.label}
                    {feedbackByAdId[ad.id]?.rating ? ` · ${feedbackByAdId[ad.id].rating}★` : ""}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                  <div className="text-xs uppercase tracking-[0.35em] text-[#7d8490]">
                    Заголовок 1
                  </div>
                  <div className="mt-4 text-2xl font-semibold leading-tight text-white">
                    {activeAd.headline1}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                  <div className="text-xs uppercase tracking-[0.35em] text-[#7d8490]">
                    Заголовок 2
                  </div>
                  <div className="mt-4 text-2xl font-semibold leading-tight text-white">
                    {activeAd.headline2}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(220,38,38,0.14),rgba(255,255,255,0.04))] p-6">
                <div className="text-xs uppercase tracking-[0.35em] text-[#f1b5b5]">
                  Описание
                </div>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#e8ebef]">
                  {activeAd.description}
                </p>
              </div>

              <div className="mt-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.35em] text-[#7d8490]">
                      Оценка заказчика
                    </div>
                    <div className="mt-3 text-lg font-semibold text-white">
                      Оцените это объявление и оставьте комментарий
                    </div>
                  </div>

                  {activeFeedback?.updated_at ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Сохранено {formatFeedbackDate(activeFeedback.updated_at)}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-[#94a0b0]">
                      <MessageSquareText className="h-3.5 w-3.5" />
                      Пока без оценки
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <div className="text-sm text-[#8f96a3]">Звёздная оценка</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const isActive = value <= activeDraft.rating

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateDraft(activeAd.id, { rating: value })}
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
                            isActive
                              ? "border-amber-400/35 bg-amber-400/12 text-amber-300"
                              : "border-white/10 bg-black/20 text-white/30 hover:border-amber-400/25 hover:text-amber-200"
                          }`}
                          aria-label={`Поставить ${value} звёзд`}
                        >
                          <Star className={`h-5 w-5 ${isActive ? "fill-current" : ""}`} />
                        </button>
                      )
                    })}

                    <div className="ml-1 text-sm text-[#aeb4bf]">
                      {activeDraft.rating
                        ? `${activeDraft.rating} из 5`
                        : "Выберите оценку"}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="text-sm text-[#8f96a3]">Комментарий</label>
                  <textarea
                    value={activeDraft.comment}
                    onChange={(event) =>
                      updateDraft(activeAd.id, { comment: event.target.value })
                    }
                    placeholder="Что нравится в формулировке, что смущает и что стоит усилить?"
                    rows={4}
                    className="mt-3 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#5f6672] focus:border-red-500/35"
                  />
                </div>

                {feedbackError ? (
                  <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {feedbackError}
                  </div>
                ) : null}

                {!feedbackError && loadError ? (
                  <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    Не удалось загрузить сохранённые отзывы. Можно оставить новую
                    оценку, и мы попробуем сохранить её повторно.
                  </div>
                ) : null}

                {feedbackNotice ? (
                  <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {feedbackNotice}
                  </div>
                ) : null}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-[#7d8490]">
                    Отзыв сохраняется для конкретного объявления и будет доступен при
                    следующем открытии.
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveFeedback}
                    disabled={savingAdId === activeAd.id || feedbackQuery.isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingAdId === activeAd.id ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Сохраняем...
                      </>
                    ) : (
                      <>
                        Сохранить оценку
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
