import { useDeferredValue, useEffect, useMemo, useState } from "react";

import {
  DragDropContext,
  Draggable,
  Droppable,
} from "@hello-pangea/dnd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarRange,
  FileText,
  FolderKanban,
  GripVertical,
  LoaderCircle,
  LogOut,
  PhoneCall,
  Save,
  Search,
  ShieldCheck,
  UserCheck,
  UserCircle2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { crmStatusMap, crmStatuses, crmUserRoleMap, crmUserRoles } from "@/content/crm";
import {
  createAdminLeadNote,
  fetchAdminLeads,
  fetchAdminSession,
  fetchAdminUsers,
  fetchAssignableUsers,
  loginAdmin,
  logoutAdmin,
  saveAdminUser,
  updateAdminLead,
  updateAdminLeadStatus,
} from "@/lib/api";
import { CATALOG_PATH } from "@/lib/routes";
import { cn } from "@/lib/utils";

const SESSION_QUERY_KEY = ["admin-session"];
const LEADS_QUERY_KEY = ["admin-leads"];
const ASSIGNABLE_USERS_QUERY_KEY = ["assignable-users"];
const ADMIN_USERS_QUERY_KEY = ["admin-users"];

function formatDateTime(value) {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildLeadForm(lead) {
  if (!lead) {
    return {
      name: "",
      company: "",
      phone: "",
      volume: "",
      comment: "",
      assignedUserId: "",
    };
  }

  return {
    name: lead.name ?? "",
    company: lead.company ?? "",
    phone: lead.phone ?? "",
    volume: lead.volume ?? "",
    comment: lead.comment ?? "",
    assignedUserId: lead.assigned_user_id ? String(lead.assigned_user_id) : "",
  };
}

function buildUserForm(user) {
  return {
    fullName: user?.full_name ?? "",
    email: user?.email ?? "",
    login: user?.login ?? "",
    role: user?.role ?? "manager",
    password: "",
    isActive: user ? Boolean(user.is_active) : true,
  };
}

function StatusBadge({ statusId }) {
  const status = crmStatusMap[statusId] ?? crmStatuses[0];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium text-white",
        status.accentClass,
      )}
    >
      {status.title}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, description }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-[#7f8692]">
            {label}
          </div>
          <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-[#8f96a3]">{description}</div>
    </div>
  );
}

function LoginPanel({ onSubmit, error, isSubmitting }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({ identifier, password });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12 lg:px-10">
      <div className="grid w-full gap-10 lg:grid-cols-[1.2fr_420px]">
        <div className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.18),_transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-8 sm:p-10">
          <div className="text-xs uppercase tracking-[0.35em] text-red-500">
            RED Engineering CRM
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Демо-воронка, которая связывает лендинги, заявки и работу менеджеров.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#a0a6b2] sm:text-lg">
            Здесь заказчик видит, как лид с лендинга попадает в канбан, получает
            ответственного и двигается по этапам до коммерческого предложения.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              "Заявки приходят со всех 8 лендингов с сохранением UTM-меток.",
              "Карточки можно двигать по канбану, редактировать и закреплять за менеджером.",
              "Суперпользователь управляет доступом и командой прямо внутри CRM.",
            ].map((point) => (
              <div
                key={point}
                className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-[#c7ccd4]"
              >
                {point}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={CATALOG_PATH}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white transition-colors hover:border-white/25"
            >
              Вернуться в витрину
            </Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#15171a] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="text-sm uppercase tracking-[0.35em] text-[#7f8692]">
            Вход в админку
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-white">Авторизация</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#8f96a3]">
            Войдите под администратором или менеджером, чтобы посмотреть канбан,
            редактирование карточек и распределение заявок.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#7f8692]">
                Логин или email
              </label>
              <input
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#5d6470] focus:border-red-500/35"
                placeholder="Denis"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#7f8692]">
                Пароль
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#5d6470] focus:border-red-500/35"
                placeholder="Введите пароль"
                required
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Входим..." : "Открыть CRM"}
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function LeadCard({ lead, index, isSelected, onSelect }) {
  return (
    <Draggable draggableId={String(lead.id)} index={index}>
      {(provided, snapshot) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "rounded-[26px] border bg-[#15171a] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-all",
            isSelected
              ? "border-red-500/35 bg-[linear-gradient(180deg,rgba(220,38,38,0.1),rgba(255,255,255,0.03))]"
              : "border-white/10 bg-white/5 hover:border-white/20",
            snapshot.isDragging && "border-red-500/40 shadow-[0_24px_80px_rgba(0,0,0,0.38)]",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => onSelect(lead.id)}
              className="flex-1 text-left"
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-base font-semibold text-white">{lead.name}</div>
                <StatusBadge statusId={lead.status} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#9ba2ae]">
                {lead.company ? <span>{lead.company}</span> : null}
                <span className="inline-flex items-center gap-1.5">
                  <PhoneCall className="h-3.5 w-3.5 text-red-400" />
                  {lead.phone}
                </span>
              </div>
            </button>

            <div
              aria-label="Перетащить заявку"
              className="flex h-10 w-10 flex-shrink-0 select-none touch-none items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-[#9ba2ae] transition-colors hover:border-red-500/30 hover:text-white"
              style={{ touchAction: "none" }}
              {...provided.dragHandleProps}
            >
              <GripVertical className="h-4 w-4" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelect(lead.id)}
            className="mt-4 block w-full text-left"
          >
            <div className="text-sm text-[#d6dbe3]">{lead.landing_title}</div>
            {lead.comment ? (
              <div className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#8f96a3]">
                {lead.comment}
              </div>
            ) : (
              <div className="mt-3 text-sm text-[#67707d]">Комментарий не добавлен</div>
            )}
          </button>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-[#7f8692]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarRange className="h-3.5 w-3.5" />
              {formatDateTime(lead.created_at)}
            </span>
            {lead.assigned_user_name ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-sky-200">
                <UserCheck className="h-3.5 w-3.5" />
                {lead.assigned_user_name}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[#c0c6d0]">
                Без ответственного
              </span>
            )}
          </div>
        </article>
      )}
    </Draggable>
  );
}

function Column({ status, leads, selectedLeadId, onSelect }) {
  return (
    <div className="flex min-h-[520px] w-[320px] flex-shrink-0 flex-col rounded-[32px] border border-white/10 bg-[#121418]">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-white">{status.title}</div>
            <div className="mt-2 text-sm leading-relaxed text-[#8f96a3]">
              {status.description}
            </div>
          </div>
          <div
            className={cn(
              "inline-flex min-w-10 items-center justify-center rounded-2xl border px-3 py-2 text-sm font-semibold text-white",
              status.accentClass,
            )}
          >
            {leads.length}
          </div>
        </div>
      </div>

      <Droppable droppableId={status.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-y-contain p-4 touch-pan-y",
              snapshot.isDraggingOver && "bg-white/[0.03]",
            )}
          >
            {leads.map((lead, index) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                index={index}
                isSelected={selectedLeadId === lead.id}
                onSelect={onSelect}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

function TeamPanel({
  currentUser,
  users,
  userForm,
  userFormMode,
  userError,
  userNotice,
  isSavingUser,
  onEditUser,
  onChange,
  onReset,
  onSubmit,
}) {
  if (currentUser?.role !== "superuser") {
    return null;
  }

  return (
    <section className="rounded-[34px] border border-white/10 bg-[#121418] p-6 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.35em] text-red-500">
            Команда и роли
          </div>
          <h2 className="mt-4 text-3xl font-semibold text-white">Доступ в админку</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#8f96a3]">
            Суперпользователь управляет доступом в CRM, назначает роли и контролирует,
            кто может вести заявки.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm text-white transition-colors hover:border-white/20"
        >
          Новый пользователь
        </button>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          {(users ?? []).map((user) => {
            const role = crmUserRoleMap[user.role];
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => onEditUser(user)}
                className="w-full rounded-[24px] border border-white/10 bg-white/5 p-4 text-left transition-colors hover:border-red-500/25 hover:bg-red-500/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-medium text-white">{user.full_name}</div>
                    <div className="mt-2 text-sm text-[#9097a4]">{user.email}</div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs",
                      role?.accentClass ?? "border-white/10 bg-white/5 text-white",
                    )}
                  >
                    {role?.title ?? user.role}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#7f8692]">
                  <span>login: {user.login}</span>
                  <span>{user.is_active ? "Активен" : "Отключен"}</span>
                  {user.last_login_at ? (
                    <span>вход: {formatDateTime(user.last_login_at)}</span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="text-xs uppercase tracking-[0.35em] text-[#7f8692]">
            {userFormMode === "edit" ? "Редактирование" : "Создание"}
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-white">
            {userFormMode === "edit" ? "Профиль пользователя" : "Новый пользователь"}
          </h3>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#7f8692]">
                Полное имя
              </label>
              <input
                value={userForm.fullName}
                onChange={(event) => onChange("fullName", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#101216] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500/35"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#7f8692]">
                Email
              </label>
              <input
                type="email"
                value={userForm.email}
                onChange={(event) => onChange("email", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#101216] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500/35"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#7f8692]">
                Логин
              </label>
              <input
                value={userForm.login}
                onChange={(event) => onChange("login", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#101216] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500/35"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#7f8692]">
                Роль
              </label>
              <select
                value={userForm.role}
                onChange={(event) => onChange("role", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#101216] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500/35"
              >
                {crmUserRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#7f8692]">
                Пароль
              </label>
              <input
                type="password"
                value={userForm.password}
                onChange={(event) => onChange("password", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#101216] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500/35"
                placeholder={userFormMode === "edit" ? "Оставьте пустым, чтобы не менять" : "Не менее 8 символов"}
              />
            </div>

            <label className="mt-2 inline-flex items-center gap-3 text-sm text-[#d2d7df]">
              <input
                type="checkbox"
                checked={Boolean(userForm.isActive)}
                onChange={(event) => onChange("isActive", event.target.checked)}
                className="h-4 w-4 rounded border-white/15 bg-[#101216]"
              />
              Пользователь активен
            </label>

            <div className="md:col-span-2">
              <div className="rounded-2xl border border-white/10 bg-[#101216] p-4 text-sm leading-relaxed text-[#8f96a3]">
                {(crmUserRoleMap[userForm.role]?.permissions ?? []).join(" • ")}
              </div>
            </div>

            {userError ? (
              <div className="md:col-span-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {userError}
              </div>
            ) : null}

            {userNotice ? (
              <div className="md:col-span-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {userNotice}
              </div>
            ) : null}

            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSavingUser}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingUser ? "Сохраняем..." : "Сохранить пользователя"}
                {isSavingUser ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center rounded-full border border-white/10 px-5 py-3 text-sm text-white transition-colors hover:border-white/20"
              >
                Очистить форму
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function CrmPage() {
  const queryClient = useQueryClient();
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [landingFilter, setLandingFilter] = useState("all");
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [leadForm, setLeadForm] = useState(buildLeadForm(null));
  const [leadError, setLeadError] = useState("");
  const [leadNotice, setLeadNotice] = useState("");
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteError, setNoteError] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [boardError, setBoardError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState(buildUserForm(null));
  const [userError, setUserError] = useState("");
  const [userNotice, setUserNotice] = useState("");
  const [isSavingUser, setIsSavingUser] = useState(false);

  const deferredSearch = useDeferredValue(searchValue);

  const sessionQuery = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchAdminSession,
  });

  const currentUser = sessionQuery.data ?? null;
  const isAuthEnabled = currentUser?.auth_enabled !== false;

  const leadsQuery = useQuery({
    queryKey: LEADS_QUERY_KEY,
    queryFn: fetchAdminLeads,
    enabled: Boolean(currentUser),
  });

  const assignableUsersQuery = useQuery({
    queryKey: ASSIGNABLE_USERS_QUERY_KEY,
    queryFn: fetchAssignableUsers,
    enabled: Boolean(currentUser),
  });

  const usersQuery = useQuery({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: fetchAdminUsers,
    enabled: currentUser?.role === "superuser",
  });

  const leads = leadsQuery.data ?? [];
  const assignableUsers = assignableUsersQuery.data ?? [];
  const adminUsers = usersQuery.data ?? [];

  const landingOptions = useMemo(() => {
    const seen = new Map();

    for (const lead of leads) {
      if (!seen.has(lead.landing_slug)) {
        seen.set(lead.landing_slug, lead.landing_title);
      }
    }

    return Array.from(seen.entries())
      .map(([slug, title]) => ({ slug, title }))
      .sort((left, right) => left.title.localeCompare(right.title, "ru"));
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return leads.filter((lead) => {
      if (landingFilter !== "all" && lead.landing_slug !== landingFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        lead.name,
        lead.company,
        lead.phone,
        lead.comment,
        lead.landing_title,
        lead.assigned_user_name,
        lead.utm_source,
        lead.utm_campaign,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [deferredSearch, landingFilter, leads]);

  const leadsByStatus = useMemo(
    () =>
      Object.fromEntries(
        crmStatuses.map((status) => [
          status.id,
          filteredLeads.filter((lead) => lead.status === status.id),
        ]),
      ),
    [filteredLeads],
  );

  const selectedLead =
    leads.find((lead) => lead.id === selectedLeadId) ?? leads[0] ?? null;
  const selectedLeadNotes = Array.isArray(selectedLead?.notes)
    ? selectedLead.notes
    : [];

  const totalLeads = leads.length;
  const assignedLeads = leads.filter((lead) => lead.assigned_user_id).length;
  const activeDeals = leads.filter(
    (lead) => lead.status !== "won" && lead.status !== "lost",
  ).length;

  useEffect(() => {
    if (!selectedLeadId && leads[0]) {
      setSelectedLeadId(leads[0].id);
    }
  }, [leads, selectedLeadId]);

  useEffect(() => {
    if (selectedLead && selectedLead.id !== selectedLeadId) {
      setSelectedLeadId(selectedLead.id);
    }
  }, [selectedLead, selectedLeadId]);

  useEffect(() => {
    setLeadForm(buildLeadForm(selectedLead));
    setLeadError("");
    setLeadNotice("");
    setNoteError("");
  }, [selectedLeadId, selectedLead]);

  async function handleLogin(credentials) {
    try {
      setIsLoggingIn(true);
      setLoginError("");
      const user = await loginAdmin(credentials);
      queryClient.setQueryData(SESSION_QUERY_KEY, user);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ASSIGNABLE_USERS_QUERY_KEY }),
      ]);
      if (user.role === "superuser") {
        await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      }
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Не удалось выполнить вход.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logoutAdmin();
    } catch (_error) {
      // Best effort logout for expired sessions.
    } finally {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: LEADS_QUERY_KEY });
      queryClient.removeQueries({ queryKey: ASSIGNABLE_USERS_QUERY_KEY });
      queryClient.removeQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      setIsLoggingOut(false);
      setSelectedLeadId(null);
      setEditingUserId(null);
    }
  }

  async function handleDragEnd(result) {
    const leadId = Number(result.draggableId);
    const nextStatus = result.destination?.droppableId;

    if (!nextStatus || result.source.droppableId === nextStatus) {
      return;
    }

    const previousLeads = queryClient.getQueryData(LEADS_QUERY_KEY);
    setBoardError("");

    queryClient.setQueryData(LEADS_QUERY_KEY, (current) =>
      (Array.isArray(current) ? current : []).map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              status: nextStatus,
            }
          : lead,
      ),
    );

    try {
      await updateAdminLeadStatus(leadId, nextStatus);
      await queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    } catch (error) {
      queryClient.setQueryData(LEADS_QUERY_KEY, previousLeads ?? []);
      setBoardError(
        error instanceof Error ? error.message : "Не удалось переместить заявку.",
      );
    }
  }

  async function handleLeadSave(event) {
    event.preventDefault();

    if (!selectedLead) {
      return;
    }

    try {
      setIsSavingLead(true);
      setLeadError("");
      setLeadNotice("");

      await updateAdminLead(selectedLead.id, {
        name: leadForm.name,
        company: leadForm.company,
        phone: leadForm.phone,
        volume: leadForm.volume,
        comment: leadForm.comment,
        assignedUserId: leadForm.assignedUserId
          ? Number(leadForm.assignedUserId)
          : null,
      });

      setLeadNotice("Карточка обновлена.");
      await queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    } catch (error) {
      setLeadError(
        error instanceof Error ? error.message : "Не удалось сохранить карточку.",
      );
    } finally {
      setIsSavingLead(false);
    }
  }

  async function handleAddNote(event) {
    event.preventDefault();

    if (!selectedLead) {
      return;
    }

    try {
      setIsSavingNote(true);
      setNoteError("");
      await createAdminLeadNote(selectedLead.id, noteDraft);
      setNoteDraft("");
      await queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    } catch (error) {
      setNoteError(
        error instanceof Error ? error.message : "Не удалось добавить примечание.",
      );
    } finally {
      setIsSavingNote(false);
    }
  }

  function beginCreateUser() {
    setEditingUserId(null);
    setUserForm(buildUserForm(null));
    setUserError("");
    setUserNotice("");
  }

  function beginEditUser(user) {
    setEditingUserId(user.id);
    setUserForm(buildUserForm(user));
    setUserError("");
    setUserNotice("");
  }

  async function handleUserSubmit(event) {
    event.preventDefault();

    try {
      setIsSavingUser(true);
      setUserError("");
      setUserNotice("");

      const savedUser = await saveAdminUser(editingUserId, {
        fullName: userForm.fullName,
        email: userForm.email,
        login: userForm.login,
        role: userForm.role,
        password: userForm.password,
        isActive: userForm.isActive,
      });

      setEditingUserId(savedUser.id);
      setUserForm(buildUserForm(savedUser));
      setUserNotice(
        editingUserId ? "Пользователь обновлен." : "Пользователь создан.",
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ASSIGNABLE_USERS_QUERY_KEY }),
      ]);
    } catch (error) {
      setUserError(
        error instanceof Error ? error.message : "Не удалось сохранить пользователя.",
      );
    } finally {
      setIsSavingUser(false);
    }
  }

  if (sessionQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111214] text-white">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-[#c9ced7]">
          <LoaderCircle className="h-4 w-4 animate-spin text-red-400" />
          Проверяем доступ к CRM...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPanel onSubmit={handleLogin} error={loginError} isSubmitting={isLoggingIn} />;
  }

  return (
    <div className="min-h-screen bg-[#111214] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111214]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1680px] flex-col gap-4 px-6 py-4 lg:px-10 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-red-500">
                RED Engineering CRM
              </div>
              <div className="mt-1 text-lg font-semibold text-white">
                Демонстрация обработки заявок
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={CATALOG_PATH}
              className="inline-flex items-center rounded-full border border-white/10 px-4 py-2.5 text-sm text-white transition-colors hover:border-white/20"
            >
              К витрине лендингов
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#d3d8e0]">
              <ShieldCheck className="h-4 w-4 text-red-400" />
              {isAuthEnabled ? (
                <>
                  {currentUser.full_name}
                  <span className="text-[#818895]">/</span>
                  {crmUserRoleMap[currentUser.role]?.title ?? currentUser.role}
                </>
              ) : (
                "Открытый доступ CRM"
              )}
            </div>

            {isAuthEnabled ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-white transition-colors hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoggingOut ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Выйти
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1680px] space-y-8 px-6 py-8 lg:px-10">
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={FileText}
            label="Всего заявок"
            value={totalLeads}
            description="Все лиды с лендингов и тестовых форм в одной системе."
          />
          <MetricCard
            icon={UserCheck}
            label="Назначено"
            value={assignedLeads}
            description="Карточки, у которых уже есть ответственный менеджер."
          />
          <MetricCard
            icon={Users}
            label="В работе"
            value={activeDeals}
            description="Заявки, которые еще не закрыты в сделку или отказ."
          />
        </section>

        <section className="rounded-[34px] border border-white/10 bg-[#121418] p-6 sm:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-[0.35em] text-red-500">
                Канбан-доска
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                Заявки по лендингам, этапам и ответственным
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#8f96a3] sm:text-base">
                На мобильном доска скроллится только внутри рабочего поля, а заявки
                перемещаются между колонками за drag-handle без сдвига всего экрана.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,340px)_220px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f7784]" />
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Поиск по имени, компании, телефону, UTM..."
                  className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-[#5d6470] focus:border-red-500/35"
                />
              </label>

              <select
                value={landingFilter}
                onChange={(event) => setLandingFilter(event.target.value)}
                className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500/35"
              >
                <option value="all">Все лендинги</option>
                {landingOptions.map((landing) => (
                  <option key={landing.slug} value={landing.slug}>
                    {landing.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {boardError ? (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {boardError}
            </div>
          ) : null}

          {leadsQuery.error ? (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {leadsQuery.error instanceof Error
                ? leadsQuery.error.message
                : "Не удалось загрузить заявки."}
            </div>
          ) : null}

          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="min-w-0 overflow-hidden rounded-[30px] border border-white/10 bg-black/10">
              <DragDropContext onDragEnd={handleDragEnd}>
                <div
                  className="overflow-x-auto overflow-y-hidden overscroll-x-contain p-1 touch-pan-x"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <div className="flex min-w-max gap-4">
                    {crmStatuses.map((status) => (
                      <Column
                        key={status.id}
                        status={status}
                        leads={leadsByStatus[status.id] ?? []}
                        selectedLeadId={selectedLeadId}
                        onSelect={setSelectedLeadId}
                      />
                    ))}
                  </div>
                </div>
              </DragDropContext>
            </div>

            <aside className="rounded-[30px] border border-white/10 bg-[#15171a] p-6">
              {selectedLead ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.35em] text-red-500">
                        Карточка заявки
                      </div>
                      <h2 className="mt-4 text-2xl font-semibold text-white">
                        {selectedLead.name}
                      </h2>
                    </div>
                    <StatusBadge statusId={selectedLead.status} />
                  </div>

                  <div className="mt-6 grid gap-3 rounded-[28px] border border-white/10 bg-white/5 p-4 text-sm text-[#cfd5dd]">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-400" />
                      {selectedLead.landing_title}
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-red-400" />
                      {selectedLead.phone}
                    </div>
                    {selectedLead.company ? (
                      <div className="flex items-center gap-2">
                        <UserCircle2 className="h-4 w-4 text-red-400" />
                        {selectedLead.company}
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4 text-red-400" />
                      {formatDateTime(selectedLead.created_at)}
                    </div>
                    {selectedLead.attachment_url ? (
                      <a
                        href={selectedLead.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-red-300 transition-colors hover:text-red-200"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Открыть вложение
                      </a>
                    ) : null}
                  </div>

                  <form onSubmit={handleLeadSave} className="mt-6 space-y-4">
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#7f8692]">
                        Имя
                      </label>
                      <input
                        value={leadForm.name}
                        onChange={(event) =>
                          setLeadForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#101216] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500/35"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#7f8692]">
                        Компания
                      </label>
                      <input
                        value={leadForm.company}
                        onChange={(event) =>
                          setLeadForm((current) => ({
                            ...current,
                            company: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#101216] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500/35"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#7f8692]">
                        Телефон
                      </label>
                      <input
                        value={leadForm.phone}
                        onChange={(event) =>
                          setLeadForm((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#101216] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500/35"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#7f8692]">
                        Объем или спецификация
                      </label>
                      <input
                        value={leadForm.volume}
                        onChange={(event) =>
                          setLeadForm((current) => ({
                            ...current,
                            volume: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#101216] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500/35"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#7f8692]">
                        Ответственный
                      </label>
                      <select
                        value={leadForm.assignedUserId}
                        onChange={(event) =>
                          setLeadForm((current) => ({
                            ...current,
                            assignedUserId: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#101216] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500/35"
                      >
                        <option value="">Без ответственного</option>
                        {assignableUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.full_name} ({crmUserRoleMap[user.role]?.title ?? user.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#7f8692]">
                        Комментарий
                      </label>
                      <textarea
                        rows={5}
                        value={leadForm.comment}
                        onChange={(event) =>
                          setLeadForm((current) => ({
                            ...current,
                            comment: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#101216] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500/35"
                      />
                    </div>

                    {leadError ? (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {leadError}
                      </div>
                    ) : null}

                    {leadNotice ? (
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {leadNotice}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={isSavingLead}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSavingLead ? "Сохраняем..." : "Сохранить карточку"}
                      {isSavingLead ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </button>
                  </form>

                  <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
                    <div className="text-xs uppercase tracking-[0.35em] text-red-500">
                      Источник и атрибуция
                    </div>
                    <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#cfd5dd]">
                      <div>
                        <span className="text-[#7f8692]">UTM source:</span>{" "}
                        {selectedLead.utm_source ?? "n/a"}
                      </div>
                      <div>
                        <span className="text-[#7f8692]">UTM campaign:</span>{" "}
                        {selectedLead.utm_campaign ?? "n/a"}
                      </div>
                      <div>
                        <span className="text-[#7f8692]">Referrer:</span>{" "}
                        {selectedLead.referrer ?? "n/a"}
                      </div>
                      <div>
                        <span className="text-[#7f8692]">Первый визит:</span>{" "}
                        {selectedLead.first_visit_at
                          ? formatDateTime(selectedLead.first_visit_at)
                          : "n/a"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
                    <div className="text-xs uppercase tracking-[0.35em] text-red-500">
                      Примечания
                    </div>

                    <div className="mt-4 space-y-3">
                      {selectedLeadNotes.length ? (
                        selectedLeadNotes.map((note) => (
                          <div
                            key={note.id}
                            className="rounded-2xl border border-white/10 bg-[#101216] p-4"
                          >
                            <div className="text-sm leading-relaxed text-[#d3d8e0]">
                              {note.note}
                            </div>
                            <div className="mt-2 text-xs text-[#7f8692]">
                              {formatDateTime(note.created_at)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-[#101216] p-4 text-sm text-[#7f8692]">
                          Пока нет примечаний по этой заявке.
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleAddNote} className="mt-4 space-y-3">
                      <textarea
                        rows={4}
                        value={noteDraft}
                        onChange={(event) => setNoteDraft(event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-[#101216] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500/35"
                        placeholder="Добавьте рабочий комментарий для команды"
                      />
                      {noteError ? (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                          {noteError}
                        </div>
                      ) : null}
                      <button
                        type="submit"
                        disabled={isSavingNote}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white transition-colors hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSavingNote ? "Сохраняем..." : "Добавить примечание"}
                        {isSavingNote ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[640px] items-center justify-center text-center text-[#8f96a3]">
                  Заявок пока нет. Отправьте тестовую форму с любого лендинга, и карточка
                  появится здесь.
                </div>
              )}
            </aside>
          </div>
        </section>

        <TeamPanel
          currentUser={currentUser}
          users={adminUsers}
          userForm={userForm}
          userFormMode={editingUserId ? "edit" : "create"}
          userError={userError}
          userNotice={userNotice}
          isSavingUser={isSavingUser}
          onEditUser={beginEditUser}
          onChange={(field, value) =>
            setUserForm((current) => ({
              ...current,
              [field]: value,
            }))
          }
          onReset={beginCreateUser}
          onSubmit={handleUserSubmit}
        />
      </main>
    </div>
  );
}
