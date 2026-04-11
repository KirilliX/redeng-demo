import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

import { crmStatuses } from "../src/content/crm.js";
import { utpCatalog } from "../src/content/utpCatalog.js";
import { landingVariantsMap } from "../src/content/landingVariants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storageRoot = process.env.STORAGE_DIR ?? path.join(__dirname, "storage");
const dbFilePath = process.env.DB_FILE ?? path.join(storageRoot, "redeng.sqlite");
const statusIds = crmStatuses.map((status) => status.id);
const roleIds = ["superuser", "manager"];
const sessionLifetimeDays = Number(process.env.CRM_SESSION_DAYS ?? 14);
const publicUploadsBasePath = process.env.PUBLIC_UPLOADS_BASE_PATH ?? "/uploads";

export const uploadsDir = process.env.UPLOADS_DIR ?? path.join(storageRoot, "uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

const database = new DatabaseSync(dbFilePath);
database.exec("PRAGMA journal_mode = WAL");
database.exec("PRAGMA foreign_keys = ON");

database.exec(`
  CREATE TABLE IF NOT EXISTS landings (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    annotation TEXT NOT NULL,
    order_index INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS crm_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    login TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS crm_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES crm_users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    landing_slug TEXT NOT NULL,
    landing_title TEXT NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    phone TEXT NOT NULL,
    volume TEXT,
    comment TEXT,
    attachment_filename TEXT,
    attachment_original_name TEXT,
    attachment_mime TEXT,
    attachment_size INTEGER,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    referrer TEXT,
    first_page TEXT,
    page_url TEXT,
    first_visit_at TEXT,
    assigned_user_id INTEGER,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (landing_slug) REFERENCES landings (slug),
    FOREIGN KEY (assigned_user_id) REFERENCES crm_users (id)
  );

  CREATE TABLE IF NOT EXISTS lead_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    note TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS lead_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    previous_status TEXT,
    next_status TEXT,
    payload TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ads (
    id TEXT PRIMARY KEY,
    landing_slug TEXT NOT NULL,
    utp_id TEXT NOT NULL,
    label TEXT NOT NULL,
    headline_1 TEXT NOT NULL,
    headline_2 TEXT NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ad_feedback (
    ad_id TEXT PRIMARY KEY,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (ad_id) REFERENCES ads (id) ON DELETE CASCADE
  );
`);

function ensureColumnExists(tableName, columnName, definition) {
  const columns = database.prepare(`PRAGMA table_info(${tableName})`).all();

  if (!columns.some((column) => column.name === columnName)) {
    database.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

ensureColumnExists("leads", "assigned_user_id", "INTEGER REFERENCES crm_users(id)");
ensureColumnExists("crm_users", "last_login_at", "TEXT");

const leadSelectClause = `
  SELECT
    leads.*,
    crm_users.full_name AS assigned_user_name,
    crm_users.role AS assigned_user_role,
    crm_users.email AS assigned_user_email
  FROM leads
  LEFT JOIN crm_users ON crm_users.id = leads.assigned_user_id
`;

const upsertLandingStatement = database.prepare(`
  INSERT INTO landings (slug, title, annotation, order_index)
  VALUES (?, ?, ?, ?)
  ON CONFLICT (slug) DO UPDATE SET
    title = excluded.title,
    annotation = excluded.annotation,
    order_index = excluded.order_index
`);

const upsertAdStatement = database.prepare(`
  INSERT INTO ads (
    id,
    landing_slug,
    utp_id,
    label,
    headline_1,
    headline_2,
    description,
    order_index
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT (id) DO UPDATE SET
    landing_slug = excluded.landing_slug,
    utp_id = excluded.utp_id,
    label = excluded.label,
    headline_1 = excluded.headline_1,
    headline_2 = excluded.headline_2,
    description = excluded.description,
    order_index = excluded.order_index
`);

const insertLeadStatement = database.prepare(`
  INSERT INTO leads (
    landing_slug,
    landing_title,
    name,
    company,
    phone,
    volume,
    comment,
    attachment_filename,
    attachment_original_name,
    attachment_mime,
    attachment_size,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    referrer,
    first_page,
    page_url,
    first_visit_at,
    assigned_user_id,
    status,
    created_at,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateLeadStatusStatement = database.prepare(`
  UPDATE leads
  SET status = ?, updated_at = ?
  WHERE id = ?
`);

const updateLeadDetailsStatement = database.prepare(`
  UPDATE leads
  SET
    name = ?,
    company = ?,
    phone = ?,
    volume = ?,
    comment = ?,
    assigned_user_id = ?,
    updated_at = ?
  WHERE id = ?
`);

const insertNoteStatement = database.prepare(`
  INSERT INTO lead_notes (lead_id, note, created_at)
  VALUES (?, ?, ?)
`);

const insertEventStatement = database.prepare(`
  INSERT INTO lead_events (
    lead_id,
    event_type,
    previous_status,
    next_status,
    payload,
    created_at
  )
  VALUES (?, ?, ?, ?, ?, ?)
`);

const selectLeadStatement = database.prepare(`
  ${leadSelectClause}
  WHERE leads.id = ?
`);

const selectLeadsStatement = database.prepare(`
  ${leadSelectClause}
  ORDER BY datetime(leads.created_at) DESC
`);

const selectLeadPlainStatement = database.prepare(`
  SELECT *
  FROM leads
  WHERE id = ?
`);

const selectNotesStatement = database.prepare(`
  SELECT id, lead_id, note, created_at
  FROM lead_notes
  ORDER BY datetime(created_at) ASC
`);

const selectAssignableUsersStatement = database.prepare(`
  SELECT id, full_name, email, login, role, is_active, last_login_at, created_at, updated_at
  FROM crm_users
  WHERE is_active = 1
  ORDER BY
    CASE role
      WHEN 'superuser' THEN 0
      ELSE 1
    END,
    lower(full_name) ASC
`);

const selectUsersStatement = database.prepare(`
  SELECT id, full_name, email, login, role, is_active, last_login_at, created_at, updated_at
  FROM crm_users
  ORDER BY
    CASE role
      WHEN 'superuser' THEN 0
      ELSE 1
    END,
    lower(full_name) ASC
`);

const selectUserByIdStatement = database.prepare(`
  SELECT *
  FROM crm_users
  WHERE id = ?
`);

const selectUserByLoginStatement = database.prepare(`
  SELECT *
  FROM crm_users
  WHERE lower(login) = lower(?)
  LIMIT 1
`);

const selectUserByIdentifierStatement = database.prepare(`
  SELECT *
  FROM crm_users
  WHERE lower(login) = lower(?) OR lower(email) = lower(?)
  LIMIT 1
`);

const selectUserByEmailStatement = database.prepare(`
  SELECT *
  FROM crm_users
  WHERE lower(email) = lower(?)
  LIMIT 1
`);

const countActiveSuperusersStatement = database.prepare(`
  SELECT COUNT(*) AS count
  FROM crm_users
  WHERE role = 'superuser' AND is_active = 1
`);

const insertUserStatement = database.prepare(`
  INSERT INTO crm_users (
    full_name,
    email,
    login,
    role,
    password_hash,
    is_active,
    last_login_at,
    created_at,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateUserStatement = database.prepare(`
  UPDATE crm_users
  SET
    full_name = ?,
    email = ?,
    login = ?,
    role = ?,
    is_active = ?,
    updated_at = ?
  WHERE id = ?
`);

const updateUserPasswordStatement = database.prepare(`
  UPDATE crm_users
  SET password_hash = ?, updated_at = ?
  WHERE id = ?
`);

const updateUserLastLoginStatement = database.prepare(`
  UPDATE crm_users
  SET last_login_at = ?, updated_at = ?
  WHERE id = ?
`);

const insertSessionStatement = database.prepare(`
  INSERT INTO crm_sessions (
    user_id,
    token_hash,
    created_at,
    updated_at,
    expires_at
  )
  VALUES (?, ?, ?, ?, ?)
`);

const selectSessionByTokenHashStatement = database.prepare(`
  SELECT
    crm_sessions.id AS session_id,
    crm_sessions.user_id,
    crm_sessions.token_hash,
    crm_sessions.created_at AS session_created_at,
    crm_sessions.updated_at AS session_updated_at,
    crm_sessions.expires_at,
    crm_users.*
  FROM crm_sessions
  INNER JOIN crm_users ON crm_users.id = crm_sessions.user_id
  WHERE crm_sessions.token_hash = ?
  LIMIT 1
`);

const deleteSessionByTokenHashStatement = database.prepare(`
  DELETE FROM crm_sessions
  WHERE token_hash = ?
`);

const touchSessionStatement = database.prepare(`
  UPDATE crm_sessions
  SET updated_at = ?
  WHERE token_hash = ?
`);

const deleteExpiredSessionsStatement = database.prepare(`
  DELETE FROM crm_sessions
  WHERE datetime(expires_at) <= datetime(?)
`);

const selectAdStatement = database.prepare(`
  SELECT *
  FROM ads
  WHERE id = ?
`);

const selectAdFeedbackRowsStatement = database.prepare(`
  SELECT
    ads.id AS ad_id,
    ads.landing_slug,
    ads.utp_id,
    ads.label,
    ads.headline_1,
    ads.headline_2,
    ads.description,
    ads.order_index,
    ad_feedback.rating,
    ad_feedback.comment,
    ad_feedback.created_at AS feedback_created_at,
    ad_feedback.updated_at AS feedback_updated_at
  FROM ads
  LEFT JOIN ad_feedback ON ad_feedback.ad_id = ads.id
  WHERE (? IS NULL OR ads.landing_slug = ?)
  ORDER BY ads.order_index ASC
`);

const selectAdFeedbackByIdStatement = database.prepare(`
  SELECT
    ads.id AS ad_id,
    ads.landing_slug,
    ads.utp_id,
    ads.label,
    ads.headline_1,
    ads.headline_2,
    ads.description,
    ads.order_index,
    ad_feedback.rating,
    ad_feedback.comment,
    ad_feedback.created_at AS feedback_created_at,
    ad_feedback.updated_at AS feedback_updated_at
  FROM ads
  LEFT JOIN ad_feedback ON ad_feedback.ad_id = ads.id
  WHERE ads.id = ?
`);

const upsertAdFeedbackStatement = database.prepare(`
  INSERT INTO ad_feedback (
    ad_id,
    rating,
    comment,
    created_at,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT (ad_id) DO UPDATE SET
    rating = excluded.rating,
    comment = excluded.comment,
    updated_at = excluded.updated_at
`);

function cleanText(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function normalizeUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    full_name: row.full_name,
    email: row.email,
    login: row.login,
    role: row.role,
    is_active: Boolean(row.is_active),
    last_login_at: row.last_login_at ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeLead(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    id: Number(row.id),
    attachment_size:
      row.attachment_size === null || row.attachment_size === undefined
        ? null
        : Number(row.attachment_size),
    assigned_user_id:
      row.assigned_user_id === null || row.assigned_user_id === undefined
        ? null
        : Number(row.assigned_user_id),
    attachment_url: row.attachment_filename
      ? `${publicUploadsBasePath}/${encodeURIComponent(row.attachment_filename)}`
      : null,
  };
}

function normalizeAdFeedback(row) {
  if (!row) {
    return null;
  }

  return {
    ad_id: row.ad_id,
    landing_slug: row.landing_slug,
    utp_id: row.utp_id,
    label: row.label,
    headline_1: row.headline_1,
    headline_2: row.headline_2,
    description: row.description,
    order_index: Number(row.order_index),
    rating:
      row.rating === null || row.rating === undefined ? null : Number(row.rating),
    comment: row.comment ?? null,
    created_at: row.feedback_created_at ?? null,
    updated_at: row.feedback_updated_at ?? null,
  };
}

function getNotesByLeadId() {
  const grouped = new Map();

  for (const row of selectNotesStatement.all()) {
    const notes = grouped.get(row.lead_id) ?? [];
    notes.push({
      id: Number(row.id),
      note: row.note,
      created_at: row.created_at,
    });
    grouped.set(row.lead_id, notes);
  }

  return grouped;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
  if (typeof passwordHash !== "string" || !passwordHash.startsWith("scrypt:")) {
    return false;
  }

  const [, salt, storedHash] = passwordHash.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(storedHash, "hex");

  if (candidate.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(candidate, expected);
}

function hashSessionToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function assertRole(role) {
  if (!roleIds.includes(role)) {
    throw new Error("Unsupported user role.");
  }
}

function ensureAssignableUser(userId) {
  if (userId === null || userId === undefined) {
    return null;
  }

  const numericUserId = Number(userId);

  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    throw new Error("Responsible user is invalid.");
  }

  const user = selectUserByIdStatement.get(numericUserId);

  if (!user || !Boolean(user.is_active)) {
    throw new Error("Responsible user is not available.");
  }

  return numericUserId;
}

function ensureUserCanBeSaved({ fullName, email, login, role, password }, currentUser) {
  const normalizedFullName = cleanText(fullName);
  const normalizedEmail = cleanText(email)?.toLowerCase() ?? null;
  const normalizedLogin = cleanText(login) ?? null;

  if (!normalizedFullName || !normalizedEmail || !normalizedLogin) {
    throw new Error("Full name, email and login are required.");
  }

  if (password !== undefined && password !== null && String(password).trim() !== "") {
    if (String(password).trim().length < 4) {
      throw new Error("Password must contain at least 4 characters.");
    }
  } else if (!currentUser) {
    throw new Error("Password is required for a new user.");
  }

  assertRole(role);

  const loginOwner = selectUserByLoginStatement.get(normalizedLogin);
  if (loginOwner && (!currentUser || Number(loginOwner.id) !== Number(currentUser.id))) {
    throw new Error("User with this login already exists.");
  }

  const emailOwner = selectUserByEmailStatement.get(normalizedEmail);
  if (emailOwner && (!currentUser || Number(emailOwner.id) !== Number(currentUser.id))) {
    throw new Error("User with this email already exists.");
  }

  return {
    fullName: normalizedFullName,
    email: normalizedEmail,
    login: normalizedLogin,
  };
}

function seedLandings() {
  const orderedLandings = Object.values(landingVariantsMap).sort((left, right) =>
    left.number.localeCompare(right.number),
  );

  for (const landing of orderedLandings) {
    upsertLandingStatement.run(
      landing.slug,
      landing.shortTitle,
      landing.annotation,
      Number(landing.number),
    );
  }
}

function seedAds() {
  for (const landing of utpCatalog) {
    landing.ads.forEach((ad, index) => {
      upsertAdStatement.run(
        ad.id,
        landing.slug,
        landing.utp.id,
        ad.label,
        ad.headline1,
        ad.headline2,
        ad.description,
        index + 1,
      );
    });
  }
}

function seedUsers() {
  const defaults = [
    {
      fullName: process.env.CRM_DEFAULT_ADMIN_NAME ?? "Denis",
      email: process.env.CRM_DEFAULT_ADMIN_EMAIL ?? "denis@redeng.local",
      login: process.env.CRM_DEFAULT_ADMIN_LOGIN ?? "Denis",
      password: process.env.CRM_DEFAULT_ADMIN_PASSWORD ?? "Best",
      role: "superuser",
    },
    {
      fullName: process.env.CRM_DEFAULT_MANAGER_NAME ?? "Менеджер RED Engineering",
      email: process.env.CRM_DEFAULT_MANAGER_EMAIL ?? "manager@redeng.local",
      login: process.env.CRM_DEFAULT_MANAGER_LOGIN ?? "manager",
      password: process.env.CRM_DEFAULT_MANAGER_PASSWORD ?? "redeng-manager-2026",
      role: "manager",
    },
  ];

  const now = new Date().toISOString();

  for (const item of defaults) {
    if (selectUserByLoginStatement.get(item.login)) {
      continue;
    }

    insertUserStatement.run(
      item.fullName,
      item.email.toLowerCase(),
      item.login,
      item.role,
      hashPassword(item.password),
      1,
      null,
      now,
      now,
    );
  }
}

function cleanupExpiredSessions() {
  deleteExpiredSessionsStatement.run(new Date().toISOString());
}

export function listLeads() {
  const notesByLeadId = getNotesByLeadId();

  return selectLeadsStatement.all().map((row) => ({
    ...normalizeLead(row),
    notes: notesByLeadId.get(row.id) ?? [],
  }));
}

export function createLead(input) {
  const landing = landingVariantsMap[input.landingSlug];

  if (!landing) {
    throw new Error("Unknown landing variant.");
  }

  const now = new Date().toISOString();
  const result = insertLeadStatement.run(
    landing.slug,
    landing.shortTitle,
    cleanText(input.name),
    cleanText(input.company),
    cleanText(input.phone),
    cleanText(input.volume),
    cleanText(input.comment),
    cleanText(input.attachmentFilename),
    cleanText(input.attachmentOriginalName),
    cleanText(input.attachmentMime),
    input.attachmentSize ?? null,
    cleanText(input.utmSource),
    cleanText(input.utmMedium),
    cleanText(input.utmCampaign),
    cleanText(input.utmContent),
    cleanText(input.utmTerm),
    cleanText(input.referrer),
    cleanText(input.firstPage),
    cleanText(input.pageUrl),
    cleanText(input.firstVisitAt),
    null,
    "new",
    now,
    now,
  );

  const leadId = Number(result.lastInsertRowid);

  insertEventStatement.run(
    leadId,
    "created",
    null,
    "new",
    JSON.stringify({
      landingSlug: landing.slug,
      pageUrl: cleanText(input.pageUrl),
      utmSource: cleanText(input.utmSource),
      utmCampaign: cleanText(input.utmCampaign),
    }),
    now,
  );

  return getLeadById(leadId);
}

export function getLeadById(leadId) {
  const lead = normalizeLead(selectLeadStatement.get(leadId));

  if (!lead) {
    return null;
  }

  return {
    ...lead,
    notes: getNotesByLeadId().get(leadId) ?? [],
  };
}

export function updateLeadStatus(leadId, nextStatus, actorUserId = null) {
  if (!statusIds.includes(nextStatus)) {
    throw new Error("Unsupported lead status.");
  }

  const currentLead = selectLeadPlainStatement.get(leadId);

  if (!currentLead) {
    return null;
  }

  const now = new Date().toISOString();

  updateLeadStatusStatement.run(nextStatus, now, leadId);
  insertEventStatement.run(
    leadId,
    "status_changed",
    currentLead.status,
    nextStatus,
    JSON.stringify({
      actorUserId:
        actorUserId === null || actorUserId === undefined ? null : Number(actorUserId),
    }),
    now,
  );

  return getLeadById(leadId);
}

export function updateLeadDetails(leadId, input, actorUserId = null) {
  const currentLead = selectLeadPlainStatement.get(leadId);

  if (!currentLead) {
    return null;
  }

  const name = cleanText(input.name);
  const phone = cleanText(input.phone);

  if (!name || !phone) {
    throw new Error("Lead name and phone are required.");
  }

  const now = new Date().toISOString();
  const assignedUserId = ensureAssignableUser(input.assignedUserId);
  const payload = {
    actorUserId:
      actorUserId === null || actorUserId === undefined ? null : Number(actorUserId),
    fields: {
      name,
      company: cleanText(input.company),
      phone,
      volume: cleanText(input.volume),
      comment: cleanText(input.comment),
      assignedUserId,
    },
  };

  updateLeadDetailsStatement.run(
    name,
    cleanText(input.company),
    phone,
    cleanText(input.volume),
    cleanText(input.comment),
    assignedUserId,
    now,
    leadId,
  );

  insertEventStatement.run(
    leadId,
    "lead_updated",
    currentLead.status,
    currentLead.status,
    JSON.stringify(payload),
    now,
  );

  return getLeadById(leadId);
}

export function addLeadNote(leadId, note, actorUserId = null) {
  const currentLead = selectLeadPlainStatement.get(leadId);

  if (!currentLead) {
    return null;
  }

  const normalizedNote = note.trim();
  const now = new Date().toISOString();

  insertNoteStatement.run(leadId, normalizedNote, now);
  insertEventStatement.run(
    leadId,
    "note_added",
    currentLead.status,
    currentLead.status,
    JSON.stringify({
      note: normalizedNote,
      actorUserId:
        actorUserId === null || actorUserId === undefined ? null : Number(actorUserId),
    }),
    now,
  );

  return getLeadById(leadId);
}

export function listUsers() {
  return selectUsersStatement.all().map(normalizeUser);
}

export function listAssignableUsers() {
  return selectAssignableUsersStatement.all().map(normalizeUser);
}

export function saveUser(userId, input) {
  const currentUser =
    userId === null || userId === undefined ? null : selectUserByIdStatement.get(userId);
  const normalizedFields = ensureUserCanBeSaved(input, currentUser);
  const role = input.role;
  const password =
    input.password === undefined || input.password === null
      ? ""
      : String(input.password).trim();
  const isActive = input.isActive === false ? 0 : 1;
  const now = new Date().toISOString();

  if (
    currentUser &&
    currentUser.role === "superuser" &&
    Boolean(currentUser.is_active) &&
    (role !== "superuser" || !Boolean(isActive)) &&
    Number(countActiveSuperusersStatement.get().count) <= 1
  ) {
    throw new Error("At least one active superuser must remain in the system.");
  }

  if (!currentUser) {
    const result = insertUserStatement.run(
      normalizedFields.fullName,
      normalizedFields.email,
      normalizedFields.login,
      role,
      hashPassword(password),
      isActive,
      null,
      now,
      now,
    );

    return normalizeUser(selectUserByIdStatement.get(Number(result.lastInsertRowid)));
  }

  updateUserStatement.run(
    normalizedFields.fullName,
    normalizedFields.email,
    normalizedFields.login,
    role,
    isActive,
    now,
    Number(userId),
  );

  if (password) {
    updateUserPasswordStatement.run(hashPassword(password), now, Number(userId));
  }

  return normalizeUser(selectUserByIdStatement.get(Number(userId)));
}

export function authenticateUser(identifier, password) {
  const normalizedIdentifier = cleanText(identifier)?.toLowerCase() ?? null;
  const normalizedPassword = typeof password === "string" ? password : "";

  if (!normalizedIdentifier || !normalizedPassword) {
    return null;
  }

  const user = selectUserByIdentifierStatement.get(
    normalizedIdentifier,
    normalizedIdentifier,
  );

  if (!user || !Boolean(user.is_active)) {
    return null;
  }

  if (!verifyPassword(normalizedPassword, user.password_hash)) {
    return null;
  }

  return normalizeUser(user);
}

export function createSessionForUser(userId) {
  cleanupExpiredSessions();

  const user = selectUserByIdStatement.get(userId);

  if (!user || !Boolean(user.is_active)) {
    return null;
  }

  const token = randomBytes(32).toString("hex");
  const now = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + sessionLifetimeDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  insertSessionStatement.run(
    Number(userId),
    hashSessionToken(token),
    now,
    now,
    expiresAt,
  );
  updateUserLastLoginStatement.run(now, now, Number(userId));

  return {
    token,
    expiresAt,
    user: normalizeUser(user),
  };
}

export function getUserBySessionToken(token) {
  if (!token) {
    return null;
  }

  cleanupExpiredSessions();

  const tokenHash = hashSessionToken(token);
  const row = selectSessionByTokenHashStatement.get(tokenHash);

  if (!row || !Boolean(row.is_active)) {
    return null;
  }

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    deleteSessionByTokenHashStatement.run(tokenHash);
    return null;
  }

  touchSessionStatement.run(new Date().toISOString(), tokenHash);

  return normalizeUser(row);
}

export function revokeSession(token) {
  if (!token) {
    return;
  }

  deleteSessionByTokenHashStatement.run(hashSessionToken(token));
}

export function listAdFeedback(landingSlug = null) {
  return selectAdFeedbackRowsStatement
    .all(landingSlug, landingSlug)
    .map(normalizeAdFeedback);
}

export function saveAdFeedback(adId, input) {
  const ad = selectAdStatement.get(adId);

  if (!ad) {
    return null;
  }

  const rating = Number(input.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer from 1 to 5.");
  }

  const comment = cleanText(input.comment);
  const now = new Date().toISOString();

  upsertAdFeedbackStatement.run(adId, rating, comment, now, now);

  return normalizeAdFeedback(selectAdFeedbackByIdStatement.get(adId));
}

export function closeDatabase() {
  database.close();
}

seedLandings();
seedAds();
seedUsers();
cleanupExpiredSessions();
