# Сайт инвестора/трейдера

Лендинг для публикации торговой статистики, результатов бэктестов и подписки на сигналы.

## Стек

- **Фреймворк:** Astro 5
- **Язык:** TypeScript
- **Стили:** CSS (кастомные переменные, mobile-first)
- **Анимации:** GSAP + Lenis
- **Развёртывание:** см. `docs/deploy.md`

## Команды

```bash
npm run dev      # локальный сервер разработки
npm run build    # сборка production
npm run preview  # предпросмотр сборки
npm run check    # проверка типов Astro
npm run format   # форматирование Prettier
```

## Структура папок

```
.
├── .claude/            # локальные настройки Claude Code (не синхронизируются)
├── .astro/             # кеш Astro (в .gitignore)
├── assets/images/      # исходные изображения и черновики (не публикуются)
├── docs/               # техническая документация проекта
├── node_modules/       # зависимости (в .gitignore)
├── posts/              # JSON-посты новостей/аналитики
├── public/             # статические файлы, доступные как-is после сборки
│   ├── favicon.svg
│   └── images/
├── src/
│   ├── components/     # Astro-компоненты секций и UI
│   ├── data/           # JSON-данные (рубрики, тикеры, преимущества)
│   ├── layouts/        # шаблоны страниц
│   ├── pages/          # маршруты сайта
│   ├── scripts/        # клиентские скрипты
│   ├── styles/         # глобальные стили и анимации
│   └── utils/          # вспомогательные функции
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## Документация

- `docs/spec.md` — спецификация секций и контента
- `docs/tech-stack.md` — выбор технологий
- `docs/animation-spec.md` — спецификация анимаций
- `docs/deploy.md` — инструкция по развёртыванию
- `docs/architecture.md` — архитектура проекта
- `docs/agent-prompt.md` — контекст для агента

## Нейминг файлов

По умолчанию: `YYYY-MM-DD_[тема]_[тип-файла].[расширение]`.

Примеры:

- `posts/2026-06-21_future-of-agriculture_post.json`
- `assets/images/2022-12-09_backtest-screenshot_original.png`
- `docs/architecture.md`

Технические документы в `docs/` могут иметь стабильные имена без даты, но с картой в `docs/README.md`.

## Автор

Проект Антона.
