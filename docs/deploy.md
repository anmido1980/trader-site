# Деплой и обновление

## Сборка

```bash
# Установка зависимостей
npm install

# Dev-сервер (localhost:4321)
npm run dev

# Продакшн-сборка
npm run build

# Превью собранного сайта
npm run preview
```

Результат сборки: папка `dist/` — чистый HTML, CSS, JS. Готова к деплою на любой статический хостинг.

---

## Варианты хостинга

### GitHub Pages (бесплатно)

**Плюсы:** Бесплатно, Git-based деплой, HTTPS из коробки.
**Минусы:** Только статика, нет серверных функций, репозиторий публичный для бесплатного тира.

**Настройка:**

1. Создать репозиторий на GitHub
2. Push кода
3. Settings → Pages → Source: GitHub Actions
4. Создать `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

---

### Netlify (бесплатный тир)

**Плюсы:** Автодеплой из Git, формы из коробки (Formspree не нужен), redirect/headers конфиг.
**Минусы:** 100GB bandwidth/месяц на бесплатном тире.

**Настройка:**

1. Подключить репозиторий на netlify.com
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Netlify автоматически деплоит при push в main

**Формы Netlify (альтернатива Formspree):**
Добавить `data-netlify="true"` и `name="contact"` в форму. Netlify перехватывает отправку.

---

### Vercel (бесплатный тир)

**Плюсы:** Автодеплой, Edge-функции если понадобятся, превью-деплой для PR.
**Минусы:** Коммерческий — условия могут меняться.

**Текущая настройка проекта:**

- Фреймворк: Astro 5
- Адаптер: `@astrojs/vercel@9.0.5`
- Режим вывода: `server` (SSR + возможность добавлять API/формы)
- Сборка: `npm run build`
- Папка сборки: управляется адаптером (`.vercel/output`)

**Пошаговая настройка:**

1. **Подготовить локально**

   ```bash
   npm install
   npm run check
   npm run build
   ```

2. **Создать репозиторий на GitHub**
   - Название: например `trader-site`.
   - Не добавлять README/.gitignore — они уже в проекте.
   - Скопировать URL репозитория.

3. **Запушить код**

   ```bash
   git remote add origin https://github.com/<USERNAME>/<REPO>.git
   git branch -M main
   git push -u origin main
   ```

4. **Импортировать в Vercel**
   - Открыть [vercel.com](https://vercel.com) → «Add New... → Project».
   - Выбрать GitHub-репозиторий.
   - Framework Preset: **Astro** (определяется автоматически).
   - Root Directory: оставить `/` (если репозиторий содержит только сайт).
   - Build Command: `npm run build`.
   - Output Directory: оставить пустым (управляется адаптером).
   - Нажать **Deploy**.

5. **Подключить свой домен**
   - В проекте Vercel открыть вкладку **Domains**.
   - Ввести домен, например `example.com`, и нажать **Add**.
   - Vercel покажет требуемые DNS-записи:
     - Для корневого домена (`@`) — запись типа `A`.
     - Для `www` — запись типа `CNAME`.
   - Добавить эти записи у регистратора домена.
   - Дождаться propagated DNS (обычно до 24 часов, часто быстрее).
   - В Vercel SSL-сертификат выдаётся автоматически.

**Последующие обновления:**

- Любой `git push` в `main` запускает автодеплой.
- Pull Request получает собственный превью-URL.
- Обновлять данные: менять JSON в `src/data/` → `git commit` → `git push`.

---

### Свой VPS / хостинг

**Плюсы:** Полный контроль, любой домен.
**Минусы:** Нужно настраивать сервер, Nginx/Caddy, SSL.

**Минимальная конфигурация Nginx:**

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    root /var/www/trader-site/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статики
    location ~* \.(css|js|png|jpg|svg|woff2|avif|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Обновление данных (результаты торговли)

### Процесс

1. Обновить JSON-файл в `src/data/` (например, `trades.json`, `metrics.json`)
2. `npm run build` — пересборка
3. Деплой (push в main → CI/CD, или ручной)

### Автоматизация (опционально)

Если Антон хочет обновлять данные без ручного редактирования JSON:

1. **Google Sheets → JSON:** Скрипт Google Apps Script экспортирует таблицу в JSON, скачивается перед сборкой
2. **Telegram-бот:** Отправляет сделку ботом → обновляет JSON в репозитории → GitHub Actions запускает пересборку
3. **Простой скрипт на Python:** Читает CSV от брокера → генерирует JSON → git commit + push

### Рекомендация для старта

Начать с ручного обновления JSON + push → CI/CD. Когда процесс устоится — добавить автоматизацию.

---

## Домен

1. Зарегистрировать домен (Reg.ru, Nic.ru, Cloudflare)
2. Настроить DNS:
   - CNAME `www` → хостинг
   - A record `@` → IP хостинга (для VPS) или CNAME для Netlify/Vercel
3. Включить HTTPS (Let's Encrypt для VPS, или автоматический для Netlify/Vercel/GitHub Pages)

---

## Мониторинг (опционально)

- **Uptime:** UptimeRobot (бесплатно) — проверяет доступность каждые 5 минут
- **Аналитика:** Plausible / Umami (privacy-friendly) вместо Google Analytics
