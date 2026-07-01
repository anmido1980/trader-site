# Архитектура: структура файлов и компонентов

## Дерево файлов

```
d:\Yandex.Disk\Project\Claude\Site\
├── docs/                          # Техническая документация
│   ├── spec.md
│   ├── tech-stack.md
│   ├── architecture.md
│   ├── animation-spec.md
│   ├── deploy.md
│   └── agent-prompt.md
├── public/                        # Статические ассеты (копируются как есть)
│   ├── favicon.svg
│   ├── og-image.png               # Open Graph image
│   └── images/
│       ├── partners/              # Логотипы партнёров
│       └── hero-bg/               # Фон для Hero (если не Canvas)
├── src/
│   ├── pages/
│   │   └── index.astro            # Главная (и единственная) страница
│   ├── layouts/
│   │   └── Layout.astro           # Базовый HTML-скелет: head, meta, скрипты, футер
│   ├── components/
│   │   ├── Header.astro           # Навигация (fixed, прозрачная → blur)
│   │   ├── Hero.astro             # Секция Hero
│   │   ├── MetricCounter.astro    # Анимированный счётчик (доходность, сделки и т.д.)
│   │   ├── Benefits.astro         # Секция Польза (контейнер)
│   │   ├── BenefitCard.astro      # Карточка одной пользы
│   │   ├── TradeTable.astro       # Мини-таблица последних сделок
│   │   ├── BacktestCards.astro    # Карточки бэктестов
│   │   ├── Trust.astro            # Секция Доверие (контейнер)
│   │   ├── CaseCard.astro         # Карточка кейса
│   │   ├── TestimonialSlider.astro # Слайдер отзывов
│   │   ├── PartnerLogos.astro    # Логотипы партнёров
│   │   ├── CtaSection.astro      # Секция CTA
│   │   ├── ContactForm.astro     # Форма заявки (интерактивный остров)
│   │   └── Footer.astro          # Футер
│   ├── data/
│   │   ├── metrics.json          # Ключевые метрики для Hero
│   │   ├── trades.json           # Последние сделки для мини-таблицы
│   │   ├── backtests.json        # Результаты бэктестов
│   │   ├── cases.json            # Кейсы
│   │   ├── testimonials.json     # Отзывы
│   │   └── partners.json         # Партнёры (имя, логотип-URL)
│   ├── scripts/
│   │   ├── animations.ts         # GSAP-анимации, ScrollTrigger-триггеры
│   │   ├── smooth-scroll.ts      # Инициализация Lenis
│   │   └── counter.ts            # Логика анимированных счётчиков
│   └── styles/
│       ├── global.css            # Reset, CSS Custom Properties, типографика, утилиты
│       └── animations.css         # Ключевые кадры, transition-утилиты
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── .gitignore
```

## Компоненты

### Layout.astro

**Ответственность:** HTML-скелет, подключение шрифтов, CSS, скриптов. Мета-теги, Open Graph.

**Props:**
- `title: string` — заголовок страницы
- `description: string` — мета-описание

**Слоты:** `<slot />` — основной контент страницы

**Подключает:**
- Google Fonts (Inter, preconnect)
- `global.css`
- `animations.css`
- Lenis (инициализация)
- GSAP + ScrollTrigger (регистрация)
- `animations.ts` (основные триггеры)

---

### Header.astro

**Ответственность:** Фиксированная навигация, якорные ссылки на секции.

**Поведение:**
- При скролле > 50px: фон с `backdrop-blur`, полупрозрачный
- Мобильное меню: гамбургер → раскрытие

**Содержимое:**
- Логотип / имя (слева)
- Навигация: Hero | Польза | Доверие | CTA (справа, якорные ссылки)
- Якорные ссылки используют `href="#section-id"`, Lenis обрабатывает плавный скролл

---

### Hero.astro

**Ответственность:** Первый экран, главный оффер, ключевые метрики.

**Внутренние компоненты:** `MetricCounter.astro` (×4)

**Данные из:** `metrics.json`

**Структура:**
```
<section id="hero">
  <div class="hero-bg">          <!-- Canvas / CSS-градиент -->
  <div class="hero-content">
    <h1>Заголовок</h1>
    <p>Подзаголовок</p>
    <div class="metrics">        <!-- 4 × MetricCounter -->
    <a class="cta-btn">          <!-- Кнопка -->
  </div>
</section>
```

---

### MetricCounter.astro

**Ответственность:** Анимированный счётчик числа (доходность, количество сделок и т.д.).

**Props:**
- `label: string` — подпись (например, «Доходность за год»)
- `value: number` — целевое значение
- `suffix: string` — суффикс (% , шт., пт.)
- `prefix: string` — префикс (+, -)

**Поведение:** При появлении в viewport (ScrollTrigger) — анимация от 0 до `value` за 2 секунды.

---

### Benefits.astro

**Ответственность:** Контейнер секции Польза, заголовок секции, слот для карточек.

**Внутренние компоненты:** `BenefitCard.astro` (×4)

**Структура:**
```
<section id="benefits">
  <h2>Заголовок секции</h2>
  <div class="benefits-grid">
    <!-- 4 × BenefitCard -->
  </div>
</section>
```

---

### BenefitCard.astro

**Ответственность:** Одна карточка пользы.

**Props:**
- `icon: string` — SVG-иконка (inline)
- `title: string`
- `description: string`

**Слот:** `<slot />` — дополнительный визуал (таблица сделок, карточки бэктестов, логотипы бирж, пример разбора сделки)

---

### TradeTable.astro

**Ответственность:** Мини-таблица последних сделок (5 строк).

**Данные из:** `trades.json`

**Props:** нет (импортирует данные напрямую)

**Структура:** HTML-таблица с колонками: Дата, Инструмент, Направление, Вход, Выход, Результат (%)

---

### BacktestCards.astro

**Ответственность:** Карточки с результатами бэктестов стратегий.

**Данные из:** `backtests.json`

**Структура:** Grid из карточек. Каждая: название стратегии, период, доходность, макс. просадка.

---

### Trust.astro

**Ответственность:** Контейнер секции Доверие.

**Внутренние компоненты:** `CaseCard.astro`, `TestimonialSlider.astro`, `PartnerLogos.astro`

---

### CaseCard.astro

**Ответственность:** Карточка кейса.

**Props:**
- `period: string` — период
- `instrument: string` — инструмент
- `strategy: string` — стратегия
- `result: string` — доходность
- `link: string` — ссылка на разбор

**Данные из:** `cases.json`

---

### TestimonialSlider.astro

**Ответственность:** Слайдер отзывов.

**Данные из:** `testimonials.json`

**Поведение:** Автопрокрутка каждые 5 секунд, пауза при hover, свайп на мобильных.

**Реализация:** Vanilla JS + CSS scroll-snap (без библиотек).

---

### PartnerLogos.astro

**Ответственность:** Ряд логотипов партнёров.

**Данные из:** `partners.json`

**Структура:** Flex-ряд логотипов, hover — grayscale → цветной.

---

### CtaSection.astro

**Ответственность:** Контейнер CTA-секции.

**Внутренние компоненты:** `ContactForm.astro`

**Дополнительный элемент:** Кнопка «Написать в Telegram» — ссылка на Telegram Антона, стилизована как альтернативный CTA

---

### ContactForm.astro

**Ответственность:** Интерактивная форма (имя, email, telegram, кнопка).

**Тип:** Клиентский остров (`client:load` не нужен — vanilla JS через `<script>`)

**Валидация:** HTML5 + JS (email pattern, required поля)

**Отправка:** Formspree / Getform (action URL в форме)

**Обратная связь:** После отправки — замена формы на сообщение «Спасибо!»

---

### Footer.astro

**Ответственность:** Навигация, контакты, дисклеймер, копирайт.

**Структура:**
```
<footer>
  <nav>Якорные ссылки</nav>
  <div class="contacts">Email, Telegram, Телефон</div>
  <div class="social">Ссылки с иконками</div>
  <div class="legal">Дисклеймер, конфиденциальность, ©</div>
</footer>
```

---

## JSON-схемы данных

### metrics.json

```json
{
  "title": "Результаты, которые говорят сами за себя",
  "subtitle": "Реальная статистика торговли...",
  "ctaText": "Посмотреть результаты",
  "ctaLink": "#benefits",
  "items": [
    { "label": "Доходность за год", "value": 87, "prefix": "+", "suffix": "%" },
    { "label": "Сделок за год", "value": 342, "prefix": "", "suffix": "" },
    { "label": "Win rate", "value": 68, "prefix": "", "suffix": "%" },
    { "label": "Профит на сделку", "value": 24, "prefix": "+", "suffix": " пт" }
  ]
}
```

### trades.json

```json
{
  "trades": [
    {
      "date": "2026-05-28",
      "instrument": "Si-6.26",
      "direction": "Long",
      "entry": 92500,
      "exit": 93100,
      "result": "+0.65%"
    }
  ]
}
```

### backtests.json

```json
{
  "backtests": [
    {
      "name": "Mean Reversion Si",
      "period": "2024-01 — 2025-12",
      "returnPct": "+42%",
      "maxDrawdown": "-8%",
      "instrument": "Si (фьючерс на доллар)"
    }
  ]
}
```

### cases.json

```json
{
  "cases": [
    {
      "period": "Янв — Июнь 2026",
      "instrument": "Фьючерсы ММВБ",
      "strategy": "Скальпинг на ликвидности",
      "result": "+34%",
      "link": "#"
    }
  ]
}
```

### testimonials.json

```json
{
  "testimonials": [
    {
      "name": "Иван П.",
      "role": "Трейдер",
      "text": "Благодаря разборам сделок стал лучше понимать рынок.",
      "photo": "/images/testimonials/ivan.jpg"
    }
  ]
}
```

### partners.json

```json
{
  "partners": [
    { "name": "ММВБ", "logo": "/images/partners/micex.svg" },
    { "name": "Interactive Brokers", "logo": "/images/partners/ib.svg" },
    { "name": "TradingView", "logo": "/images/partners/tradingview.svg" }
  ]
}
```

## Связи между компонентами

```
Layout.astro
├── Header.astro
├── <slot /> (index.astro)
│   ├── Hero.astro
│   │   └── MetricCounter.astro ×4
│   ├── Benefits.astro
│   │   ├── BenefitCard.astro ×4
│   │   │   ├── (слот: TradeTable.astro)
│   │   │   └── (слот: BacktestCards.astro)
│   ├── Trust.astro
│   │   ├── CaseCard.astro ×N
│   │   ├── TestimonialSlider.astro
│   │   └── PartnerLogos.astro
│   ├── CtaSection.astro
│   │   └── ContactForm.astro
│   └── Footer.astro
```

**Поток данных:**
- `index.astro` импортирует JSON из `src/data/`
- Передаёт данные в компоненты через props
- Компоненты рендерят статический HTML
- Клиентские скрипты (`src/scripts/`) добавляют интерактивность после загрузки