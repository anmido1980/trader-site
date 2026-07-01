# Чеклист деплоя на Vercel

## Что сделано

- Установлен адаптер `@astrojs/vercel@9.0.5` (совместим с Astro 5).
- `astro.config.mjs` переключён в режим `server` с адаптером Vercel — можно добавлять API/формы в будущем.
- Локальная сборка проходит: `npm run check` и `npm run build` без ошибок.
- Инициализирован git-репозиторий, `.gitignore` очищен от служебных артефактов.
- Обновлена документация `docs/deploy.md`.

## Что нужно сделать тебе

### 1. Создать репозиторий на GitHub

1. Открыть [github.com/new](https://github.com/new).
2. Repository name: `trader-site` (или любое другое).
3. Оставить **Public** (для бесплатного Vercel проще) или выбрать **Private**.
4. НЕ ставить галочки «Add README» / «Add .gitignore» — они уже есть в проекте.
5. Нажать **Create repository**.
6. Скопировать URL, например `https://github.com/USERNAME/trader-site.git`.

### 2. Запушить код

В папке `d:\Yandex.Disk\Project\Claude\Site` выполнить:

```bash
git remote add origin https://github.com/USERNAME/trader-site.git
git branch -M main
git push -u origin main
```

> Важно: локально автор коммита установлен как `Anton <anton@local.dev>`. Перед пушем можно заменить на свой настоящий email:
>
> ```bash
> git config user.name "Твоё Имя"
> git config user.email "твой@email.com"
> git commit --amend --reset-author --no-edit
> git push -u origin main
> ```

### 3. Импортировать в Vercel

1. Открыть [vercel.com](https://vercel.com) и войти в аккаунт.
2. Нажать **Add New... → Project**.
3. Выбрать только что созданный GitHub-репозиторий.
4. Настройки:
   - **Framework Preset**: Astro (определяется автоматически).
   - **Root Directory**: `/` (оставить как есть, если в репозитории только сайт).
   - **Build Command**: `npm run build`.
   - **Output Directory**: оставить пустым — адаптер Vercel управляет им сам.
5. Нажать **Deploy**.
6. Через 1–2 минуты сайт будет доступен по URL вида `https://trader-site-USERNAME.vercel.app`.

### 4. Подключить свой домен

1. В проекте Vercel перейти во вкладку **Domains**.
2. Ввести свой домен, например `example.com`, нажать **Add**.
3. Vercel покажет DNS-записи:
   - Для корневого домена (`@`) — запись `A`.
   - Для `www` — запись `CNAME`.
4. Добавить эти записи в панели регистратора домена (Reg.ru, Nic.ru, Cloudflare и т.п.).
5. Дождаться обновления DNS (обычно от нескольких минут до 24 часов).
6. Vercel автоматически выдаст SSL-сертификат.

### 5. Проверить

- Открыть URL из Vercel.
- Убедиться, что страница загружается, анимации работают, изображения на месте.

## Дальнейшие обновления

- Любой `git push` в ветку `main` запускает автодеплой.
- Pull Request получает отдельный preview-URL.
- Обновлять данные: править JSON в `src/data/` → `git commit` → `git push`.
