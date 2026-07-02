# Стек и конфигурация

## Фреймворк

**Astro 5.x** — Static Site Generator

- Output mode: `static` (hybrid не нужен — все страницы предрендерены)
- Сборка: `npm run build` → папка `dist/` с чистым HTML/CSS/JS
- Dev-сервер: `npm run dev` (HMR, горячая перезагрузка)

## Зависимости

### Основные

| Пакет            | Версия | Назначение          |
| ---------------- | ------ | ------------------- |
| `astro`          | ^5.x   | Фреймворк           |
| `@astrojs/check` | latest | TypeScript-проверка |

### Анимации и интерактивность

| Пакет         | Версия | Назначение                                   |
| ------------- | ------ | -------------------------------------------- |
| `gsap`        | ^3.12  | Анимации (Timeline, ScrollTrigger, счётчики) |
| `@gsap/trial` | ^3.12  | ScrollTrigger (входит в gsap с 3.12+)        |
| `lenis`       | ^1.1   | Плавный скролл                               |

### Формы

| Пакет | Версия | Назначение                                                          |
| ----- | ------ | ------------------------------------------------------------------- |
| —     | —      | Форма через внешний сервис (Formspree/Getform), без серверного кода |

### Dev-зависимости

| Пакет                   | Версия | Назначение                   |
| ----------------------- | ------ | ---------------------------- |
| `typescript`            | ^5.x   | Типы                         |
| `prettier`              | ^3.x   | Форматирование               |
| `prettier-plugin-astro` | latest | Форматирование .astro файлов |

## astro.config.mjs

```javascript
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  build: {
    assets: "assets",
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
```

**Без интеграций** (React, Svelte, Vue) — на данном этапе не нужны. Если в будущем потребуется интерактивный дашборд с графиками, можно добавить `@astrojs/react` или `@astrojs/svelte` для островной архитектуры.

## package.json (скелетон)

```json
{
  "name": "trader-site",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "format": "prettier --write ."
  },
  "dependencies": {
    "astro": "^5.0.0",
    "gsap": "^3.12.0",
    "lenis": "^1.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "prettier": "^3.0.0",
    "prettier-plugin-astro": "^0.14.0",
    "@astrojs/check": "^0.9.0"
  }
}
```

## TypeScript

- `strict: false` — минимум типизации, чтобы не усложнять
- `allowJs: true` — GSAP и Lenis подключаются как JS
- Типы только для Astro props (в frontmatter)

## CSS

- **Без Tailwind** — меньше зависимостей, меньше бандл
- Astro scoped styles (`<style>` внутри .astro компонентов)
- Глобальные стили: `src/styles/global.css` — CSS Custom Properties, reset, типографика
- Подключение: через Layout компонент

### CSS Custom Properties (проектные токены)

```css
:root {
  /* Цвета */
  --color-bg-primary: #0a0e1a;
  --color-bg-secondary: #111827;
  --color-bg-card: #1a2035;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-accent-green: #22c55e;
  --color-accent-red: #ef4444;
  --color-accent-blue: #3b82f6;

  /* Типографика */
  --font-family: "Inter", system-ui, -apple-system, sans-serif;
  --font-size-base: 16px;
  --line-height-base: 1.6;

  /* Отступы */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;
  --spacing-2xl: 8rem;

  /* Радиусы */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;

  /* Тени */
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  --shadow-card-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.5);

  /* Транзиции */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 400ms ease;

  /* Максимальная ширина */
  --max-width: 1200px;
}
```

## Шрифты

- **Inter** (Google Fonts) — основной, загружается через `<link>` в Layout
- Fallback: system-ui, -apple-system, sans-serif
- Подключение: `preconnect` к fonts.googleapis.com + fonts.gstatic.com

## Подключение GSAP и Lenis

- GSAP: npm-пакет, импорт в клиентском скрипте (`<script>` без `is:inline` или через `is:inline` для контроля)
- ScrollTrigger: регистрируется через `gsap.registerPlugin(ScrollTrigger)`
- Lenis: npm-пакет, инициализация в клиентском скрипте Layout

### Порядок загрузки

1. HTML (статический, от Astro)
2. CSS (scoped + global, встроенный Astro)
3. Lenis (инициализация плавного скролла)
4. GSAP + ScrollTrigger (регистрация, ожидание DOMContentLoaded)
5. Анимации (ScrollTrigger-триггеры привязываются к секциям)

## Сборка и оптимизация

- Astro автоматически: минификация HTML/CSS/JS, tree-shaking, image optimization
- Изображения: использовать `astro:assets` для оптимизации (WebP, AVIF, responsive)
- Иконки: встроенные SVG (inline) — без иконочных шрифтов
- Бандл: Astro собирает JS только для интерактивных островов, остальное — статика
