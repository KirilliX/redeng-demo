import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";
import multer from "multer";

import {
  addLeadNote,
  authenticateUser,
  closeDatabase,
  createLead,
  createSessionForUser,
  getLeadById,
  getUserBySessionToken,
  listAdFeedback,
  listAssignableUsers,
  listLeads,
  listUsers,
  revokeSession,
  saveAdFeedback,
  saveUser,
  updateLeadDetails,
  updateLeadStatus,
  uploadsDir,
} from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
const indexFile = path.join(distDir, "index.html");
const app = express();

const port = Number(process.env.PORT ?? 8787);
const apiBasePath = process.env.API_BASE_PATH ?? "/api";
const uploadsBasePath = process.env.UPLOADS_BASE_PATH ?? "/uploads";
const staticBasePath = process.env.STATIC_BASE_PATH ?? "/";
const crmAuthEnabled = process.env.CRM_AUTH_ENABLED === "true";
const authCookieName = process.env.CRM_AUTH_COOKIE ?? "redeng_crm_session";
const authCookieSecure = process.env.CRM_AUTH_COOKIE_SECURE === "true";
const authCookieMaxAge =
  Number(process.env.CRM_SESSION_DAYS ?? 14) * 24 * 60 * 60 * 1000;

app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadsDir);
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extension}`;
    callback(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

function removeUploadedFile(filePath) {
  if (!filePath) {
    return;
  }

  fs.rm(filePath, { force: true }, () => {});
}

function getCookies(request) {
  const rawCookie = request.headers.cookie ?? "";

  return rawCookie.split(";").reduce((result, part) => {
    const [name, ...rest] = part.trim().split("=");

    if (!name) {
      return result;
    }

    result[name] = decodeURIComponent(rest.join("="));
    return result;
  }, {});
}

function getSessionToken(request) {
  return getCookies(request)[authCookieName] ?? null;
}

function setAuthCookie(response, token) {
  response.cookie(authCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: authCookieSecure,
    path: "/",
    maxAge: authCookieMaxAge,
  });
}

function clearAuthCookie(response) {
  response.clearCookie(authCookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: authCookieSecure,
    path: "/",
  });
}

function getDemoCrmUser() {
  const users = listUsers();

  return (
    users.find((user) => user.role === "superuser" && user.is_active) ??
    users.find((user) => user.is_active) ??
    null
  );
}

function serializeCrmUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    auth_enabled: crmAuthEnabled,
  };
}

function requireAuthenticatedUser(request, response, next) {
  if (!crmAuthEnabled) {
    const demoUser = getDemoCrmUser();

    if (!demoUser) {
      response.status(503).json({ error: "CRM user is not configured." });
      return;
    }

    request.crmUser = demoUser;
    next();
    return;
  }

  const user = getUserBySessionToken(getSessionToken(request));

  if (!user) {
    clearAuthCookie(response);
    response.status(401).json({ error: "Authentication required." });
    return;
  }

  request.crmUser = user;
  next();
}

function requireRole(...allowedRoles) {
  return (request, response, next) => {
    if (!crmAuthEnabled) {
      next();
      return;
    }

    if (!request.crmUser) {
      response.status(401).json({ error: "Authentication required." });
      return;
    }

    if (!allowedRoles.includes(request.crmUser.role)) {
      response.status(403).json({ error: "Insufficient permissions." });
      return;
    }

    next();
  };
}

app.use(uploadsBasePath, express.static(uploadsDir));

app.get(`${apiBasePath}/health`, (_request, response) => {
  response.json({
    ok: true,
    service: "red-engineering-api",
    timestamp: new Date().toISOString(),
  });
});

app.get(`${apiBasePath}/landings/:landingSlug/ad-feedback`, (request, response) => {
  const items = listAdFeedback(request.params.landingSlug);

  if (!items.length) {
    response.status(404).json({ error: "Landing not found." });
    return;
  }

  response.json({ items });
});

app.put(`${apiBasePath}/ads/:adId/feedback`, (request, response) => {
  try {
    const feedback = saveAdFeedback(request.params.adId, {
      rating: request.body?.rating,
      comment: request.body?.comment,
    });

    if (!feedback) {
      response.status(404).json({ error: "Ad not found." });
      return;
    }

    response.json({ ok: true, feedback });
  } catch (error) {
    response.status(400).json({
      error:
        error instanceof Error ? error.message : "Could not save ad feedback.",
    });
  }
});

app.post(`${apiBasePath}/leads`, upload.single("attachment"), (request, response) => {
  try {
    const { landingSlug, name, phone } = request.body;

    if (!landingSlug || !name || !phone) {
      removeUploadedFile(request.file?.path);
      response.status(400).json({
        error: "landingSlug, name and phone are required.",
      });
      return;
    }

    const lead = createLead({
      landingSlug,
      name,
      company: request.body.company,
      phone,
      volume: request.body.volume,
      comment: request.body.comment,
      attachmentFilename: request.file?.filename,
      attachmentOriginalName: request.file?.originalname,
      attachmentMime: request.file?.mimetype,
      attachmentSize: request.file?.size,
      utmSource: request.body.utmSource,
      utmMedium: request.body.utmMedium,
      utmCampaign: request.body.utmCampaign,
      utmContent: request.body.utmContent,
      utmTerm: request.body.utmTerm,
      referrer: request.body.referrer,
      firstPage: request.body.firstPage,
      pageUrl: request.body.pageUrl,
      firstVisitAt: request.body.firstVisitAt,
    });

    response.status(201).json({ ok: true, lead });
  } catch (error) {
    removeUploadedFile(request.file?.path);
    response.status(500).json({
      error: error instanceof Error ? error.message : "Could not create lead.",
    });
  }
});

app.post(`${apiBasePath}/admin/auth/login`, (request, response) => {
  if (!crmAuthEnabled) {
    const demoUser = getDemoCrmUser();

    if (!demoUser) {
      response.status(503).json({ error: "CRM user is not configured." });
      return;
    }

    clearAuthCookie(response);
    response.json({ ok: true, user: serializeCrmUser(demoUser) });
    return;
  }

  const identifier =
    typeof request.body?.identifier === "string" ? request.body.identifier : "";
  const password =
    typeof request.body?.password === "string" ? request.body.password : "";
  const user = authenticateUser(identifier, password);

  if (!user) {
    clearAuthCookie(response);
    response.status(401).json({ error: "Invalid login or password." });
    return;
  }

  const session = createSessionForUser(user.id);

  if (!session) {
    clearAuthCookie(response);
    response.status(401).json({ error: "Could not create session." });
    return;
  }

  setAuthCookie(response, session.token);
  response.json({ ok: true, user: serializeCrmUser(session.user) });
});

app.post(`${apiBasePath}/admin/auth/logout`, requireAuthenticatedUser, (request, response) => {
  if (!crmAuthEnabled) {
    clearAuthCookie(response);
    response.json({ ok: true });
    return;
  }

  revokeSession(getSessionToken(request));
  clearAuthCookie(response);
  response.json({ ok: true });
});

app.get(`${apiBasePath}/admin/auth/me`, requireAuthenticatedUser, (request, response) => {
  response.json({ user: serializeCrmUser(request.crmUser) });
});

app.get(
  `${apiBasePath}/admin/users/assignable`,
  requireAuthenticatedUser,
  (request, response) => {
    response.json({
      items: listAssignableUsers(),
    });
  },
);

app.get(
  `${apiBasePath}/admin/users`,
  requireAuthenticatedUser,
  requireRole("superuser"),
  (_request, response) => {
    response.json({
      items: listUsers(),
    });
  },
);

app.post(
  `${apiBasePath}/admin/users`,
  requireAuthenticatedUser,
  requireRole("superuser"),
  (request, response) => {
    try {
      const user = saveUser(null, {
        fullName: request.body?.fullName,
        email: request.body?.email,
        login: request.body?.login,
        role: request.body?.role,
        password: request.body?.password,
        isActive: request.body?.isActive,
      });

      response.status(201).json({ ok: true, user });
    } catch (error) {
      response.status(400).json({
        error: error instanceof Error ? error.message : "Could not save user.",
      });
    }
  },
);

app.put(
  `${apiBasePath}/admin/users/:userId`,
  requireAuthenticatedUser,
  requireRole("superuser"),
  (request, response) => {
    try {
      const user = saveUser(Number(request.params.userId), {
        fullName: request.body?.fullName,
        email: request.body?.email,
        login: request.body?.login,
        role: request.body?.role,
        password: request.body?.password,
        isActive: request.body?.isActive,
      });

      if (!user) {
        response.status(404).json({ error: "User not found." });
        return;
      }

      response.json({ ok: true, user });
    } catch (error) {
      response.status(400).json({
        error: error instanceof Error ? error.message : "Could not update user.",
      });
    }
  },
);

app.get(`${apiBasePath}/admin/leads`, requireAuthenticatedUser, (_request, response) => {
  response.json({
    items: listLeads(),
  });
});

app.patch(
  `${apiBasePath}/admin/leads/:leadId/status`,
  requireAuthenticatedUser,
  (request, response) => {
    const leadId = Number(request.params.leadId);
    const { status } = request.body;

    if (!status) {
      response.status(400).json({ error: "status is required." });
      return;
    }

    try {
      const lead = updateLeadStatus(leadId, status, request.crmUser.id);

      if (!lead) {
        response.status(404).json({ error: "Lead not found." });
        return;
      }

      response.json({ ok: true, lead });
    } catch (error) {
      response.status(400).json({
        error: error instanceof Error ? error.message : "Could not update lead.",
      });
    }
  },
);

app.patch(
  `${apiBasePath}/admin/leads/:leadId`,
  requireAuthenticatedUser,
  (request, response) => {
    try {
      const lead = updateLeadDetails(
        Number(request.params.leadId),
        {
          name: request.body?.name,
          company: request.body?.company,
          phone: request.body?.phone,
          volume: request.body?.volume,
          comment: request.body?.comment,
          assignedUserId: request.body?.assignedUserId,
        },
        request.crmUser.id,
      );

      if (!lead) {
        response.status(404).json({ error: "Lead not found." });
        return;
      }

      response.json({ ok: true, lead });
    } catch (error) {
      response.status(400).json({
        error: error instanceof Error ? error.message : "Could not update lead.",
      });
    }
  },
);

app.post(
  `${apiBasePath}/admin/leads/:leadId/notes`,
  requireAuthenticatedUser,
  (request, response) => {
    const leadId = Number(request.params.leadId);
    const note = typeof request.body.note === "string" ? request.body.note.trim() : "";

    if (!note) {
      response.status(400).json({ error: "note is required." });
      return;
    }

    const lead = addLeadNote(leadId, note, request.crmUser.id);

    if (!lead) {
      response.status(404).json({ error: "Lead not found." });
      return;
    }

    response.status(201).json({ ok: true, lead });
  },
);

app.get(
  `${apiBasePath}/admin/leads/:leadId`,
  requireAuthenticatedUser,
  (request, response) => {
    const lead = getLeadById(Number(request.params.leadId));

    if (!lead) {
      response.status(404).json({ error: "Lead not found." });
      return;
    }

    response.json({ lead });
  },
);

if (fs.existsSync(distDir)) {
  if (staticBasePath === "/") {
    app.use(express.static(distDir));
  } else {
    app.use(staticBasePath, express.static(distDir));
  }
}

app.get(
  /^(?!\/api|\/uploads|\/landing-api|\/landing-uploads|\/landing-static).*/,
  (request, response) => {
    if (!fs.existsSync(indexFile)) {
      response.status(503).send("Client build is missing. Run `npm run build` first.");
      return;
    }

    response.sendFile(indexFile);
  },
);

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`RED Engineering server is listening on http://0.0.0.0:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => {
      closeDatabase();
      process.exit(0);
    });
  });
}
