# Спецификация анимаций

## Общие принципы

- **GSAP 3.12+** — основная библиотека анимаций
- **ScrollTrigger** — анимации, привязанные к скроллу
- **Lenis** — плавный скролл, интеграция с ScrollTrigger
- **Производительность:** анимируем только `transform` и `opacity` (GPU-ускоренные свойства). Не анимируем `width`, `height`, `top`, `left`.
- **Уважение к пользователю:** проверяем `prefers-reduced-motion` — при активации отключаем анимации, показываем контент сразу.

## Инициализация

### Порядок (в Layout.astro `<script>`)

```javascript
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// 1. Регистрация плагина
gsap.registerPlugin(ScrollTrigger);

// 2. Проверка reduced motion
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// 3. Инициализация Lenis
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: "vertical",
  smoothWheel: true,
});

// 4. Связка Lenis ↔ ScrollTrigger
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// 5. Если reduced motion — отключаем Lenis
if (prefersReducedMotion) {
  lenis.destroy();
}
```

---

## Анимации по секциям

### Hero

| Элемент               | Тип                     | Триггер          | Параметры                                                                  |
| --------------------- | ----------------------- | ---------------- | -------------------------------------------------------------------------- |
| Фон (Canvas/градиент) | Fade-in + scale         | Page load        | `opacity: 0→1, scale: 1.1→1, duration: 1.5, ease: power2.out`              |
| H1 заголовок          | Fade-in + slide-up      | Page load + 0.3s | `y: 60→0, opacity: 0→1, duration: 1, ease: power3.out`                     |
| Подзаголовок          | Fade-in + slide-up      | Page load + 0.6s | `y: 40→0, opacity: 0→1, duration: 0.8, ease: power3.out`                   |
| CTA-кнопка            | Fade-in + scale         | Page load + 0.9s | `scale: 0.8→1, opacity: 0→1, duration: 0.6, ease: back.out(1.7)`           |
| Метрики (4 счётчика)  | Каскад: fade-in + count | Page load + 1.2s | Каждый + 0.15s задержка. `y: 30→0, opacity: 0→1`, затем запуск `countUp()` |

#### Счётчик (countUp)

```javascript
function countUp(element, target, duration = 2, prefix = "", suffix = "") {
  const obj = { value: 0 };
  gsap.to(obj, {
    value: target,
    duration: duration,
    ease: "power2.out",
    onUpdate: () => {
      element.textContent = prefix + Math.round(obj.value) + suffix;
    },
  });
}
```

- Вызывается через ScrollTrigger `onEnter` или при page load для Hero
- Каждому `.metric-value` назначается `data-target`, `data-prefix`, `data-suffix`

---

### Benefits

| Элемент                          | Тип                        | Триггер                           | Параметры                                                                                           |
| -------------------------------- | -------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| Заголовок секции (H2)            | Fade-in + slide-up         | ScrollTrigger (входит в viewport) | `y: 50→0, opacity: 0→1, duration: 0.8, ease: power3.out, start: "top 85%"`                          |
| Карточки пользы (4 шт.)          | Каскад: fade-in + slide-up | ScrollTrigger                     | Каждая + 0.15s задержка. `y: 60→0, opacity: 0→1, duration: 0.7, ease: power3.out, start: "top 80%"` |
| Мини-таблица сделок (в карточке) | Fade-in                    | ScrollTrigger                     | `opacity: 0→1, duration: 0.6, delay: 0.3`                                                           |
| Карточки бэктестов               | Каскад                     | ScrollTrigger                     | Аналогично карточкам пользы                                                                         |

---

### Trust

| Элемент                   | Тип                             | Триггер       | Параметры                                                                   |
| ------------------------- | ------------------------------- | ------------- | --------------------------------------------------------------------------- |
| Заголовок секции          | Fade-in + slide-up              | ScrollTrigger | Аналогично Benefits                                                         |
| Карточки кейсов (2-3 шт.) | Каскад: fade-in + scale         | ScrollTrigger | `scale: 0.9→1, opacity: 0→1, duration: 0.6, stagger: 0.2, start: "top 80%"` |
| Слайдер отзывов           | Fade-in                         | ScrollTrigger | `opacity: 0→1, duration: 0.8`                                               |
| Логотипы партнёров        | Каскад: fade-in (слева направо) | ScrollTrigger | `x: -30→0, opacity: 0→1, duration: 0.5, stagger: 0.1, start: "top 85%"`     |

---

### CTA

| Элемент         | Тип                    | Триггер         | Параметры                                                          |
| --------------- | ---------------------- | --------------- | ------------------------------------------------------------------ |
| Фон секции      | Параллакс (субтильный) | ScrollTrigger   | `background-position-y` или `transform: translateY`, `scrub: true` |
| Заголовок       | Fade-in + slide-up     | ScrollTrigger   | Аналогично другим секциям                                          |
| Форма           | Fade-in + scale        | ScrollTrigger   | `scale: 0.95→1, opacity: 0→1, duration: 0.8`                       |
| Кнопка отправки | Pulse (циклическая)    | После появления | `scale: 1→1.05→1, duration: 2, repeat: -1, ease: power1.inOut`     |

---

### Footer

- Без анимаций. Статичный.

---

### Header (навигация)

| Элемент        | Тип                     | Триггер           | Параметры                                                       |
| -------------- | ----------------------- | ----------------- | --------------------------------------------------------------- |
| Фон навигации  | Backdrop-blur + opacity | Scroll > 50px     | CSS transition: `background-color 300ms, backdrop-filter 300ms` |
| Мобильное меню | Slide-down              | Клик на гамбургер | `height: 0→auto, opacity: 0→1, duration: 0.3`                   |

---

## Hover-анимации (CSS)

```css
/* Карточки */
.card {
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

/* Кнопки */
.btn {
  transition:
    background-color var(--transition-fast),
    transform var(--transition-fast);
}
.btn:hover {
  transform: scale(1.02);
}
.btn:active {
  transform: scale(0.98);
}

/* Логотипы партнёров */
.partner-logo {
  filter: grayscale(100%);
  opacity: 0.5;
  transition:
    filter var(--transition-slow),
    opacity var(--transition-slow);
}
.partner-logo:hover {
  filter: grayscale(0%);
  opacity: 1;
}
```

---

## Слайдер отзывов

Реализация без библиотек, на CSS scroll-snap + минимальный JS:

```html
<div class="testimonial-slider">
  <div class="testimonial-track">
    <div class="testimonial-slide">...</div>
    <div class="testimonial-slide">...</div>
    <div class="testimonial-slide">...</div>
  </div>
  <div class="testimonial-dots">
    <button class="dot active"></button>
    <button class="dot"></button>
    <button class="dot"></button>
  </div>
</div>
```

```css
.testimonial-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}
.testimonial-slide {
  scroll-snap-align: start;
  flex: 0 0 100%;
}
```

```javascript
// Автопрокрутка каждые 5 секунд, пауза при hover
let autoScroll;
const track = document.querySelector('.testimonial-track');

function startAutoScroll() {
  autoScroll = setInterval(() => {
    const nextSlide = /* вычислить следующий */;
    track.scrollTo({ left: nextSlide.offsetLeft, behavior: 'smooth' });
  }, 5000);
}

track.addEventListener('mouseenter', () => clearInterval(autoScroll));
track.addEventListener('mouseleave', startAutoScroll);
startAutoScroll();
```

---

## Performance

### Оптимизации

1. **will-change:** Добавлять `will-change: transform, opacity` только элементам, которые будут анимированы, и удалять после завершения.
2. **contain: layout style:** Для анимируемых секций — изоляция перерисовки.
3. **Lazy-анимации:** ScrollTrigger-триггеры не активны, пока секция не в viewport.
4. **Удаление триггеров:** При `once: true` — триггер удаляется после первого срабатывания (меньше нагрузки при скролле).
5. **requestAnimationFrame:** GSAP использует свой rAF-цикл, Lenis тоже — конфликтов нет (gsap.ticker).

### Reduced motion

```javascript
if (prefersReducedMotion) {
  // Показать все элементы без анимаций
  gsap.set("[data-animate]", { opacity: 1, y: 0, scale: 1 });
  // Не инициализировать Lenis
  // Не запускать ScrollTrigger-анимации
}
```

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Итоговая карта анимаций

| Секция   | Page load                            | Scroll-triggered                       | Hover    | Auto         |
| -------- | ------------------------------------ | -------------------------------------- | -------- | ------------ |
| Header   | —                                    | Фон при скролле                        | —        | —            |
| Hero     | Фон, H1, подзаголовок, CTA, счётчики | —                                      | Кнопка   | —            |
| Benefits | —                                    | Заголовок, карточки, таблица, бэктесты | Карточки | —            |
| Trust    | —                                    | Заголовок, кейсы, слайдер, логотипы    | Логотипы | Слайдер (5s) |
| CTA      | —                                    | Заголовок, форма, параллакс фона       | Кнопка   | Pulse кнопки |
| Footer   | —                                    | —                                      | Ссылки   | —            |
