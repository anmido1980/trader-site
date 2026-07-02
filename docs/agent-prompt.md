# Промпт для AI-агента: реализация сайта трейдера

## Роль

Ты — frontend-разработчик. Реализуй сайт трейдера по спецификации ниже. Строго следуй архитектуре, не добавляй зависимости, не указанные в стеке.

---

## Стек

- **Astro 5.x** (output: static)
- **GSAP 3.12+** + ScrollTrigger
- **Lenis** (плавный скролл)
- **CSS** — Custom Properties + Astro scoped styles (без Tailwind)
- **Шрифт:** Inter (Google Fonts)
- **Формы:** Formspree / Netlify Forms (внешний сервис)

---

## Порядок реализации

### Шаг 1: Инициализация проекта

1. `npm create astro@latest` в рабочей папке (пустой шаблон)
2. Установить зависимости: `npm install gsap lenis`
3. Установить dev-зависимости: `npm install -D typescript prettier prettier-plugin-astro`
4. Создать `astro.config.mjs` (output: 'static')
5. Создать `tsconfig.json` (strict: false, allowJs: true)

### Шаг 2: Глобальные стили и Layout

1. Создать `src/styles/global.css` — reset, CSS Custom Properties (цвета, отступы, типографика), утилиты
2. Создать `src/styles/animations.css` — transition-утилиты, @keyframes для hover
3. Создать `src/layouts/Layout.astro`:
   - HTML-скелет (lang="ru")
   - Meta-теги (charset, viewport, description, OG)
   - Подключение Inter (Google Fonts, preconnect)
   - Подключение global.css и animations.css
   - Инициализация Lenis + GSAP/ScrollTrigger в `<script>`
   - Проверка prefers-reduced-motion

### Шаг 3: Данные (JSON)

Создать `src/data/` с placeholder-данными:

1. `metrics.json` — метрики Hero (4 счётчика)
2. `trades.json` — последние 5 сделок
3. `backtests.json` — 3 бэктеста
4. `cases.json` — 2-3 кейса
5. `testimonials.json` — 3-4 отзыва
6. `partners.json` — 4-5 партнёров

Использовать реалистичные placeholder-данные (инструменты ММВБ: Si, RI, BR, SBER и т.д.)

### Шаг 4: Компоненты — по порядку

Реализовать компоненты последовательно, каждый — полностью (HTML + CSS + JS):

1. **Header.astro** — фиксированная навигация, якорные ссылки, мобильное меню (гамбургер), backdrop-blur при скролле
2. **Hero.astro** + **MetricCounter.astro** — заголовок, подзаголовок, CTA-кнопка, 4 анимированных счётчика, фоновый Canvas-градиент
3. **Benefits.astro** + **BenefitCard.astro** — 4 карточки пользы
4. **TradeTable.astro** — мини-таблица последних сделок (вставляется в слот BenefitCard)
5. **BacktestCards.astro** — карточки бэктестов (вставляется в слот BenefitCard)
6. **Trust.astro** + **CaseCard.astro** — кейсы
7. **TestimonialSlider.astro** — слайдер отзывов (CSS scroll-snap + автопрокрутка)
8. **PartnerLogos.astro** — ряд логотипов (grayscale → цветной при hover)
9. **CtaSection.astro** + **ContactForm.astro** — форма (имя, email, telegram, кнопка), альтернативная кнопка «Написать в Telegram», inline-валидация
10. **Footer.astro** — навигация, контакты, дисклеймер, копирайт

### Шаг 5: Сборка страницы

1. Создать `src/pages/index.astro` — импорт всех компонентов, компоновка секций
2. Каждая секция: `<section id="hero">`, `<section id="benefits">`, `<section id="trust">`, `<section id="cta">`

### Шаг 6: Анимации

1. Создать `src/scripts/animations.ts`:
   - ScrollTrigger-анимации для каждой секции (fade-in, slide-up, cascade)
   - Счётчики Hero (countUp при page load)
   - Параллакс для CTA-фона
2. Создать `src/scripts/counter.ts` — логика анимированных счётчиков
3. Создать `src/scripts/smooth-scroll.ts` — Lenis-инициализация (если вынести из Layout)
4. Подключить скрипты в Layout

### Шаг 7: Статические ассеты

1. `public/favicon.svg` — SVG-фавиконка
2. `public/og-image.png` — placeholder для Open Graph (1200×630)
3. Placeholder-логотипы партнёров (SVG в `public/images/partners/`)

### Шаг 8: Тестирование и финализация

1. `npm run build` — проверить, что сборка проходит без ошибок
2. `npm run preview` — проверить результат локально
3. Проверить адаптивность (mobile, tablet, desktop)
4. Проверить анимации (scroll, hover, счётчики)
5. Проверить работу формы (валидация, отправка)
6. Проверить prefers-reduced-motion
7. Lighthouse audit (цель: Performance > 90, Accessibility > 90)

---

## Дизайн-система

### Цвета (тёмная тема)

| Токен                    | Значение  | Использование            |
| ------------------------ | --------- | ------------------------ |
| `--color-bg-primary`     | `#0a0e1a` | Основной фон             |
| `--color-bg-secondary`   | `#111827` | Фон секций (чередование) |
| `--color-bg-card`        | `#1a2035` | Фон карточек             |
| `--color-text-primary`   | `#f8fafc` | Основной текст           |
| `--color-text-secondary` | `#94a3b8` | Второстепенный текст     |
| `--color-accent-green`   | `#22c55e` | Прибыль, позитив         |
| `--color-accent-red`     | `#ef4444` | Убыток, негатив          |
| `--color-accent-blue`    | `#3b82f6` | CTA, ссылки              |

### Типографика

- H1: 3.5rem / 700 (desktop), 2rem (mobile)
- H2: 2.5rem / 700 (desktop), 1.75rem (mobile)
- H3: 1.5rem / 600
- Body: 1rem / 400, line-height 1.6
- Small: 0.875rem

### Breakpoints

- Mobile: < 768px
- Tablet: 768px – 1024px
- Desktop: > 1024px

### Отступы секций

- Вертикальный padding: `var(--spacing-2xl)` (8rem desktop, 4rem mobile)

---

## JSON-схемы

### metrics.json

```json
{
  "title": "string",
  "subtitle": "string",
  "ctaText": "string",
  "ctaLink": "string (anchor)",
  "items": [
    {
      "label": "string",
      "value": "number",
      "prefix": "string",
      "suffix": "string"
    }
  ]
}
```

### trades.json

```json
{
  "trades": [
    {
      "date": "YYYY-MM-DD",
      "instrument": "string",
      "direction": "Long|Short",
      "entry": "number",
      "exit": "number",
      "result": "string"
    }
  ]
}
```

### backtests.json

```json
{
  "backtests": [
    {
      "name": "string",
      "period": "string",
      "returnPct": "string",
      "maxDrawdown": "string",
      "instrument": "string"
    }
  ]
}
```

### cases.json

```json
{
  "cases": [
    {
      "period": "string",
      "instrument": "string",
      "strategy": "string",
      "result": "string",
      "link": "string"
    }
  ]
}
```

### testimonials.json

```json
{
  "testimonials": [
    {
      "name": "string",
      "role": "string",
      "text": "string",
      "photo": "string (path)"
    }
  ]
}
```

### partners.json

```json
{
  "partners": [{ "name": "string", "logo": "string (path)" }]
}
```

---

## Карта анимаций

| Секция   | Page load              | Scroll                         | Hover            | Auto         |
| -------- | ---------------------- | ------------------------------ | ---------------- | ------------ |
| Header   | —                      | Фон (backdrop-blur)            | —                | —            |
| Hero     | Все элементы, счётчики | —                              | CTA-кнопка       | —            |
| Benefits | —                      | Заголовок + карточки (cascade) | Карточки (lift)  | —            |
| Trust    | —                      | Заголовок + кейсы + логотипы   | Логотипы (color) | Слайдер (5s) |
| CTA      | —                      | Заголовок + форма + параллакс  | Кнопка           | Pulse кнопки |
| Footer   | —                      | —                              | Ссылки           | —            |

**Параметры GSAP по умолчанию:**

- ScrollTrigger start: `"top 85%"` (заголовки), `"top 80%"` (карточки)
- ease: `power3.out`
- stagger: `0.15s` (карточки)
- duration: `0.6s – 1s`
- once: `true` (анимация срабатывает один раз)

---

## Критерии приёмки

1. **Сборка:** `npm run build` без ошибок, `dist/` содержит HTML/CSS/JS
2. **Адаптивность:** Корректно отображается на mobile (375px), tablet (768px), desktop (1280px)
3. **Анимации:** Плавные, без рывков, уважают prefers-reduced-motion
4. **Форма:** Валидирует email, показывает успех/ошибку
5. **Счётчики:** Анимируются при появлении, показывают корректные значения из metrics.json
6. **Слайдер отзывов:** Автопрокрутка, пауза при hover, навигация точками
7. **Навигация:** Якорные ссылки — плавный скролл к секциям, backdrop-blur при прокрутке
8. **Данные:** Все секции рендерятся из JSON-файлов, placeholder-данные реалистичны
9. **SEO:** Мета-теги, OG, семантический HTML (header, main, section, footer)
10. **Lighthouse:** Performance > 85, Accessibility > 90
