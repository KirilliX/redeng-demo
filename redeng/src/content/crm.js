export const crmStatuses = [
  {
    id: "new",
    title: "Новые",
    description: "Только что поступили с лендингов.",
    accentClass: "border-red-500/30 bg-red-500/10",
  },
  {
    id: "in_progress",
    title: "В работе",
    description: "Уточняем вводные и собираем КП.",
    accentClass: "border-amber-500/30 bg-amber-500/10",
  },
  {
    id: "contacted",
    title: "Связались",
    description: "Контакт установлен, обсуждаем детали.",
    accentClass: "border-sky-500/30 bg-sky-500/10",
  },
  {
    id: "offer_sent",
    title: "КП отправлено",
    description: "Коммерческое предложение уже у клиента.",
    accentClass: "border-violet-500/30 bg-violet-500/10",
  },
  {
    id: "won",
    title: "Сделка",
    description: "Заявка конвертировалась в продажу.",
    accentClass: "border-emerald-500/30 bg-emerald-500/10",
  },
  {
    id: "lost",
    title: "Закрыто",
    description: "Сделка не состоялась или перенесена.",
    accentClass: "border-white/15 bg-white/5",
  },
];

export const crmStatusMap = Object.fromEntries(
  crmStatuses.map((status) => [status.id, status]),
);

export const crmUserRoles = [
  {
    id: "superuser",
    title: "Суперпользователь",
    description:
      "Полный доступ к CRM: пользователи, роли, ответственные, редактирование заявок и администрирование.",
    accentClass: "border-red-500/30 bg-red-500/10 text-red-300",
    permissions: [
      "Управление пользователями и ролями",
      "Доступ ко всем заявкам и статусам",
      "Назначение ответственных",
      "Редактирование карточек и комментариев",
    ],
  },
  {
    id: "manager",
    title: "Менеджер",
    description:
      "Рабочий доступ к CRM: ведение заявок, drag-and-drop по канбану, примечания и редактирование карточек.",
    accentClass: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    permissions: [
      "Просмотр всех заявок",
      "Смена статусов и drag-and-drop",
      "Редактирование данных заявки",
      "Работа с ответственными и примечаниями",
    ],
  },
];

export const crmUserRoleMap = Object.fromEntries(
  crmUserRoles.map((role) => [role.id, role]),
);
