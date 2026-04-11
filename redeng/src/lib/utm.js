const STORAGE_KEY = "redeng-tracking-context";
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

function canUseBrowserStorage() {
  return typeof window !== "undefined";
}

function getStoredTracking() {
  if (!canUseBrowserStorage()) {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : {};
  } catch {
    return {};
  }
}

function saveTrackingContext(context) {
  if (!canUseBrowserStorage()) {
    return context;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  return context;
}

export function initializeTracking(landingSlug = null) {
  if (!canUseBrowserStorage()) {
    return {};
  }

  const currentUrl = new URL(window.location.href);
  const stored = getStoredTracking();
  const next = { ...stored };
  const hasIncomingUtm = UTM_KEYS.some((key) => currentUrl.searchParams.get(key));

  if (hasIncomingUtm) {
    for (const key of UTM_KEYS) {
      const value = currentUrl.searchParams.get(key);
      if (value) {
        next[key] = value;
      }
    }
  }

  if (!next.firstVisitAt) {
    next.firstVisitAt = new Date().toISOString();
  }

  if (!next.firstPage) {
    next.firstPage = currentUrl.pathname;
  }

  if (!next.referrer && document.referrer) {
    next.referrer = document.referrer;
  }

  if (landingSlug) {
    next.lastLandingSlug = landingSlug;
  }

  next.pageUrl = currentUrl.href;
  next.lastTouchAt = new Date().toISOString();

  return saveTrackingContext(next);
}

export function getLeadTracking(landingSlug) {
  const context = initializeTracking(landingSlug);

  return {
    utmSource: context.utm_source ?? "",
    utmMedium: context.utm_medium ?? "",
    utmCampaign: context.utm_campaign ?? "",
    utmContent: context.utm_content ?? "",
    utmTerm: context.utm_term ?? "",
    referrer: context.referrer ?? "",
    firstPage: context.firstPage ?? "",
    pageUrl: context.pageUrl ?? (canUseBrowserStorage() ? window.location.href : ""),
    firstVisitAt: context.firstVisitAt ?? "",
  };
}
