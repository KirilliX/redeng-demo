const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/landing-api";

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data
        ? data.error
        : "Request failed.";

    throw new Error(message);
  }

  return data;
}

function adminFetch(path, options = {}) {
  return fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
  });
}

export async function submitLead({
  landingSlug,
  values,
  tracking,
  attachment,
}) {
  const formData = new FormData();

  formData.append("landingSlug", landingSlug);

  for (const [key, value] of Object.entries(values)) {
    if (value) {
      formData.append(key, value);
    }
  }

  for (const [key, value] of Object.entries(tracking)) {
    if (value) {
      formData.append(key, value);
    }
  }

  if (attachment) {
    formData.append("attachment", attachment);
  }

  const data = await parseResponse(
    await fetch(`${API_BASE_URL}/leads`, {
      method: "POST",
      body: formData,
    }),
  );

  return data.lead;
}

export async function fetchLandingAdFeedback(landingSlug) {
  const data = await parseResponse(
    await fetch(
      `${API_BASE_URL}/landings/${encodeURIComponent(landingSlug)}/ad-feedback`,
    ),
  );

  return data.items ?? [];
}

export async function saveAdFeedback(adId, { rating, comment }) {
  const data = await parseResponse(
    await fetch(`${API_BASE_URL}/ads/${encodeURIComponent(adId)}/feedback`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating, comment }),
    }),
  );

  return data.feedback;
}

export async function loginAdmin({ identifier, password }) {
  const data = await parseResponse(
    await adminFetch("/admin/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    }),
  );

  return data.user;
}

export async function logoutAdmin() {
  await parseResponse(
    await adminFetch("/admin/auth/logout", {
      method: "POST",
    }),
  );
}

export async function fetchAdminSession() {
  const response = await adminFetch("/admin/auth/me");

  if (response.status === 401) {
    return null;
  }

  const data = await parseResponse(response);
  return data.user ?? null;
}

export async function fetchAdminLeads() {
  const data = await parseResponse(await adminFetch("/admin/leads"));
  return data.items ?? [];
}

export async function fetchAssignableUsers() {
  const data = await parseResponse(await adminFetch("/admin/users/assignable"));
  return data.items ?? [];
}

export async function fetchAdminUsers() {
  const data = await parseResponse(await adminFetch("/admin/users"));
  return data.items ?? [];
}

export async function saveAdminUser(userId, payload) {
  const method = userId ? "PUT" : "POST";
  const path = userId ? `/admin/users/${userId}` : "/admin/users";
  const data = await parseResponse(
    await adminFetch(path, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
  );

  return data.user;
}

export async function updateAdminLeadStatus(leadId, status) {
  const data = await parseResponse(
    await adminFetch(`/admin/leads/${leadId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }),
  );

  return data.lead;
}

export async function updateAdminLead(leadId, payload) {
  const data = await parseResponse(
    await adminFetch(`/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
  );

  return data.lead;
}

export async function createAdminLeadNote(leadId, note) {
  const data = await parseResponse(
    await adminFetch(`/admin/leads/${leadId}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note }),
    }),
  );

  return data.lead;
}
