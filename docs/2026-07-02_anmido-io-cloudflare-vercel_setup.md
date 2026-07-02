# Настройка anmido.io: Vercel + Cloudflare DNS

Дата: 2026-07-02
Статус: актуальная рабочая схема

## Итоговая схема

```
Пользователь → Cloudflare DNS → A-запись на IP Vercel → Vercel (origin) → Astro-сайт
```

- **Vercel** — основная платформа для деплоя и сборки.
- **Cloudflare** — только DNS, без проксирования.
- Сайт `anmido.io` доступен без VPN благодаря тому, что A-записи указывают на рабочие IP Vercel, возвращаемые для дефолтного домена проекта.

## Почему не CNAME на cname.vercel-dns.com

Стандартный CNAME для кастомных доменов Vercel:

```
www.anmido.io → cname.vercel-dns.com
```

разрешается в IP `66.33.60.35`, `76.76.21.123`, которые блокируются провайдером без VPN.

При этом дефолтный домен проекта:

```
trader-site-rho.vercel.app
```

разрешается в IP `64.29.17.131`, `216.198.79.131`, которые доступны без VPN. С этими IP и правильным доменным именем (SNI) Vercel корректно отдаёт сайт.

## Текущие DNS-записи в Cloudflare

| Type | Name  | Value          | Proxy    |
| ---- | ----- | -------------- | -------- |
| A    | `@`   | `64.29.17.131` | DNS only |
| A    | `www` | `64.29.17.131` | DNS only |

Допускается добавить вторые A-записи на `216.198.79.131` для избыточности.

## Как настроить / восстановить

### 1. Проверить актуальные IP Vercel для проекта

```bash
nslookup -type=A trader-site-rho.vercel.app 8.8.8.8
```

Если IP изменились — обновить A-записи в Cloudflare.

### 2. Открыть DNS-записи домена

Cloudflare Dashboard → выбрать домен `anmido.io` → раздел **DNS** → **Records**.

### 3. Настроить A-записи

Удалить все лишние A/CNAME записи для `@` и `www`. Добавить:

- **A** `@` → `64.29.17.131` (DNS only)
- **A** `www` → `64.29.17.131` (DNS only)

### 4. Проксирование Cloudflare

**Proxy status: DNS only** (серое облако). Проксирование не используется, иначе сайт будет недоступен без VPN.

### 5. SSL/TLS

Cloudflare → `anmido.io` → **SSL/TLS** → **Overview**:

- Режим: **Full (strict)**.

Хотя прокси отключён, этот параметр может быть актуален для других поддоменов.

### 6. Редирект www → apex

В Vercel Dashboard → `trader-site` → Settings → Domains можно настроить, чтобы `www.anmido.io` редиректил на `anmido.io`, или наоборот.

## Что нужно сделать в Vercel

1. Открыть `vercel.com/9199987/trader-site/settings/domains`.
2. Убедиться, что `anmido.io` и `www.anmido.io` добавлены и показывают **Production**.
3. Если статус не Production — нажать **Refresh** и дождаться проверки.

## Проверка доступности

```bash
nslookup -type=A anmido.io 8.8.8.8
curl -I https://anmido.io
curl -I https://www.anmido.io
```

Ожидаемый результат: `HTTP/2 200` или `HTTP/1.1 200`.

## Проверка без VPN

Открыть в браузере:

```text
https://anmido.io
https://www.anmido.io
https://trader-site-rho.vercel.app
```

Все три должны открываться. Если дефолтный `vercel.app` работает, а кастомный домен нет — проверить актуальные IP через `nslookup trader-site-rho.vercel.app` и обновить A-записи.

## Важное предупреждение

Vercel может изменить IP-адреса для `trader-site-rho.vercel.app`. В этом случае:

1. Сайт перестанет открываться без VPN.
2. Нужно заново выполнить `nslookup trader-site-rho.vercel.app`.
3. Обновить A-записи в Cloudflare.

Для автоматизации можно настроить мониторинг доступности `https://anmido.io` и алерт при недоступности.

## Связанные изменения в коде

В `astro.config.mjs` добавлен:

```js
site: 'https://anmido.io',
```

Это нужно для корректного формирования canonical URL, sitemap и OpenGraph-ссылок.

## Ссылки

- Vercel docs: https://vercel.com/docs/concepts/projects/domains
- Cloudflare DNS docs: https://developers.cloudflare.com/dns/manage-dns-records/
