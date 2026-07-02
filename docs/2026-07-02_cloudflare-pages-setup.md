> **Примечание (2026-07-02):** основное решение — оставить Vercel и направить домен на рабочие IP через A-записи (см. `2026-07-02_anmido-io-cloudflare-vercel_setup.md`). Cloudflare Pages описан ниже как альтернативный/резервный вариант, если подход с Vercel перестанет работать.

# Развёртывание сайта на Cloudflare Pages

Дата: 2026-07-02
Статус: альтернативный вариант

## Почему Cloudflare Pages

Схема с Vercel + Cloudflare proxy не работала без VPN, потому что IP-адреса Cloudflare CDN (`188.114.96.x`, `188.114.97.x`) блокировались провайдером.

Cloudflare Pages использует другие edge-ноды и может быть доступен без VPN из РФ. План — развернуть статический сайт напрямую на Cloudflare Pages и направить `anmido.io` / `www.anmido.io` туда.

## Итоговая схема

```
Пользователь → Cloudflare Pages (хостинг + CDN) → anmido.io
```

Vercel можно оставить как резервный origin или полностью отказаться от него.

## Подготовка в коде

Astro уже собирается в static (`output: 'static'` в `astro.config.mjs`). Дополнительных изменений в коде не требуется.

Убедись, что в `astro.config.mjs` задано:

```js
site: 'https://anmido.io',
```

Это уже сделано.

## Вариант A: Подключить Cloudflare Pages к Git-репозиторию (рекомендуется)

### 1. Зарегистрировать/войти в Cloudflare

https://dash.cloudflare.com

### 2. Открыть Pages

Слева меню **Workers & Pages** → **Pages** → **Create a project**.

### 3. Подключить репозиторий

- Выбери **Connect to Git**.
- Авторизуй Cloudflare к своему GitHub/GitLab-репозиторию.
- Выбери репозиторий с сайтом (`trader-site` или как он называется).

### 4. Настроить сборку

В полях укажи:

| Поле                   | Значение        |
| ---------------------- | --------------- |
| Framework preset       | `Astro`         |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

### 5. Переменные окружения (если нужны)

Если в будущем появятся переменные — добавить в раздел **Environment variables**.

### 6. Deploy

Нажми **Save and Deploy**. Первый деплой займёт 1–2 минуты.

### 7. Подключить домен

После успешного деплоя открой проект → **Custom domains** → **Set up a custom domain**.

Добавь:

- `anmido.io`
- `www.anmido.io`

Cloudflare сам обновит DNS-записи в твоей зоне `anmido.io`.

### 8. Редирект www ↔ apex (опционально)

Cloudflare Pages автоматически перенаправляет `www` на apex или наоборот — в зависимости от того, какой домен назначен основным. Выбери в настройках, какой адрес использовать как canonical.

## Вариант B: Прямая загрузка сборки (upload)

Если не хочешь подключать Git:

### 1. Собрать локально

```bash
cd d:/Yandex.Disk/Project/Claude/Site
npm run build
```

### 2. Создать Pages-проект через upload

Cloudflare Dashboard → **Workers & Pages** → **Pages** → **Upload assets**.

Загрузи содержимое папки `dist/`.

### 3. Подключить домен

Аналогично варианту A, шаг 7.

## Обновление DNS для Cloudflare Pages

Если домен уже в той же зоне Cloudflare, Pages сам настроит DNS. Но если записи были направлены на Vercel, их нужно изменить:

### Apex `anmido.io`

| Type  | Name | Value                      | Proxy   |
| ----- | ---- | -------------------------- | ------- |
| CNAME | `@`  | `<project-name>.pages.dev` | Proxied |

Cloudflare Pages поддерживает CNAME на apex для зон, делегированных на Cloudflare.

### `www.anmido.io`

| Type  | Name  | Value                      | Proxy   |
| ----- | ----- | -------------------------- | ------- |
| CNAME | `www` | `<project-name>.pages.dev` | Proxied |

## После миграции

### Что оставить в Vercel

Рекомендуется оставить Vercel как backup на случай проблем с Cloudflare Pages:

- Не удаляй проект `trader-site` из Vercel.
- Отключи кастомные домены в Vercel или оставь `trader-site-rho.vercel.app` как fallback-URL.

### Что проверить

1. `https://anmido.io` открывается без VPN.
2. `https://www.anmido.io` открывается без VPN.
3. `https://<project-name>.pages.dev` открывается.
4. Все ссылки на сайте используют `https://anmido.io`.

## Откат

Если что-то пойдёт не так:

1. В Cloudflare DNS верни запись `anmido.io` на `a396d6ce74c0727b.vercel-dns-017.com.` с DNS only.
2. `www.anmido.io` верни на `cname.vercel-dns.com` с Proxied.
3. В Vercel нажми **Refresh** рядом с доменами.
4. Сайт снова будет работать через Vercel + Cloudflare proxy (с VPN).

## Ссылки

- Cloudflare Pages docs: https://developers.cloudflare.com/pages/
- Astro on Cloudflare Pages: https://docs.astro.build/en/guides/deploy/cloudflare/
- Cloudflare custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
