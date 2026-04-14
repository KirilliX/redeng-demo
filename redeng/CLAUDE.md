# CLAUDE.md — Контекст проекта RED Engineering

## Что это за проект

B2B-демо для инженерной компании **RED Engineering** (red-eng.ru).
Многостраничный лендинг-хаб + CRM для управления лидами.

## Стек

- **Frontend**: React 18 + Vite, Tailwind CSS, Radix UI, React Router, TanStack Query
- **Backend**: Node.js + Express 5, SQLite (`node:sqlite`, требует Node.js v22+)
- **Auth**: сессии через куки (`/api/auth/*`), `CRM_AUTH_ENABLED` в `.env`
- **Deploy**: GitHub Actions → SSH → VPS (45.90.33.153), домен red-eng.ru

## Структура

```
redeng/
  src/
    content/        # Контент лендингов (landingVariants.js, utpCatalog.js)
    pages/          # CatalogPage, CrmPage + лендинги (Landing01..Landing08)
    components/     # UI-компоненты
    lib/            # api.js (CRM API), utm.js, utils
  server/
    index.js        # Express сервер (порт 8787)
    db.js           # SQLite БД, seed данных при старте
```

## Ключевые соглашения

- **Ветка для работы**: всегда `main` → триггерит автодеплой
- **Node.js**: v22+ обязательно (используется `node:sqlite`)
- **Порт**: 8787 (Express раздаёт и API, и собранный фронтенд)
- **БД**: SQLite, файл `server/storage/redeng.sqlite` (в .gitignore)
- **Загрузки**: `server/storage/uploads/` (в .gitignore)

## Деплой

```bash
npm run build          # собрать фронтенд
git push origin main   # → GitHub Actions → VPS
```

GitHub Actions: `.github/workflows/deploy.yml`
Запускается на push в main, умеет принимать кастомную команду через workflow_dispatch.

## Что нельзя трогать без явной задачи

- `server/db.js` — схема БД и seed, менять осторожно
- `src/content/landingVariants.js` — структура лендингов, от неё зависит роутинг
- `.github/workflows/deploy.yml` — пайплайн деплоя

## История очистки

- Удалены все артефакты Base44 (base44Client.js, AuthContext.jsx, app-params.js)
- Проект переименован из `base44-app` в `redeng`
- Auth в проекте — собственная CRM-авторизация (loginAdmin/logoutAdmin в src/lib/api.js)
