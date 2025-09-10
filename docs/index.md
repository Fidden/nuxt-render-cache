---
layout: home

title: Nuxt Render Cache
description: Мощная библиотека для кеширования рендеринга компонентов в Nuxt 3 приложениях

hero:
  name: Nuxt Render Cache
  text: 🚀 Ускорьте ваше Nuxt приложение до 60x
  tagline: Мощная система кеширования для SSR с поддержкой Redis, умными блокировками и двухуровневым TTL. Кешируйте компоненты и данные без потери производительности.
  actions:
    - theme: brand
      text: Начать использовать
      link: /1.getting-started/1.installation

features:
  - icon: ⚡
    title: Молниеносная производительность
    details: Время ответа из кеша всего 1-5ms. 60x быстрее обычного рендеринга.
  - icon: 🏗️
    title: Распределенное кеширование
    details: Redis кластеры с Pub/Sub синхронизацией для масштабируемых приложений.
  - icon: 🔒
    title: Умные блокировки
    details: Предотвращает дублирование рендеринга. Эффективное использование ресурсов.
  - icon: 🎯
    title: Двухуровневый TTL
    details: Soft TTL для фонового обновления + Hard TTL для полного истечения кеша.
  - icon: 📊
    title: Полный мониторинг
    details: REST API для статистики, ключей и детального контроля над кешем.
  - icon: 🏷️
    title: Гибкое тегирование
    details: Инвалидация по тегам для группового управления кешем.
---

## 📈 Производительность

<div class="performance-stats">
  <div class="stat-card">
    <div class="stat-number">60x</div>
    <div class="stat-label">Быстрее рендеринга</div>
    <div class="stat-desc">1-5ms из кеша</div>
  </div>

  <div class="stat-card">
    <div class="stat-number">90%</div>
    <div class="stat-label">Экономия CPU</div>
    <div class="stat-desc">На повторных запросах</div>
  </div>

  <div class="stat-card">
    <div class="stat-number">1000+</div>
    <div class="stat-label">RPS</div>
    <div class="stat-desc">На кешированный контент</div>
  </div>
</div>

## 🏆 Преимущества

<div class="comparison-table">
  <div class="comparison-header">
    <span>Характеристика</span>
    <span>Nuxt Render Cache</span>
    <span>SWR</span>
    <span>ISR</span>
  </div>

  <div class="comparison-row">
    <span>Тип кеширования</span>
    <span class="highlight">🖥️ Серверное (SSR)</span>
    <span>🖱️ Клиентское</span>
    <span>🖥️ Серверное</span>
  </div>

  <div class="comparison-row">
    <span>Распределенность</span>
    <span class="highlight">✅ Redis кластеры</span>
    <span>❌ Только клиент</span>
    <span>⚠️ Файловая система</span>
  </div>

  <div class="comparison-row">
    <span>Производительность</span>
    <span class="highlight">⚡ 1-5ms</span>
    <span>🐌 Зависит от клиента</span>
    <span>🐌 Пересборка</span>
  </div>

  <div class="comparison-row">
    <span>Масштабируемость</span>
    <span class="highlight">✅ Горизонтальное</span>
    <span>⚠️ Ограничено</span>
    <span>⚠️ Ограничено</span>
  </div>
</div>

## 💡 Когда использовать

<div class="use-cases">
  <div class="use-case">
    <div class="use-case-icon">🚀</div>
    <h4>Высоконагруженные приложения</h4>
    <p>Тысячи одновременных запросов к одним данным</p>
  </div>

  <div class="use-case">
    <div class="use-case-icon">🏢</div>
    <h4>Распределенные системы</h4>
    <p>Несколько серверов с синхронизацией кеша</p>
  </div>

  <div class="use-case">
    <div class="use-case-icon">⚡</div>
    <h4>Тяжелые вычисления</h4>
    <p>Графики, аналитика, ML модели на сервере</p>
  </div>

  <div class="use-case">
    <div class="use-case-icon">🎯</div>
    <h4>SEO-критичные приложения</h4>
    <p>Быстрый первый рендер для поисковиков</p>
  </div>
</div>

## 🎉 Начните использовать прямо сейчас

<div class="cta-section">
  <div class="cta-content">
    <h2>Готовы ускорить ваше приложение?</h2>
    <p>Присоединяйтесь к тысячам разработчиков, которые уже используют Nuxt Render Cache для создания высокопроизводительных приложений.</p>
    <div class="cta-buttons">
      <a href="/1.getting-started/1.installation" class="cta-button primary">
        🚀 Начать использование
      </a>
      <a href="/2.essentials/1.components" class="cta-button secondary">
        📖 Изучить документацию
      </a>
    </div>
  </div>
</div>

<style>
/* Quick Start Grid */
.quick-start-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.step-card {
  padding: 2rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 0.75rem;
  background: var(--vp-c-bg-soft);
  text-align: center;
  position: relative;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--vp-c-brand);
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.step-card h3 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
}

.install-code {
  display: block;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 0.5rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  margin: 0;
  text-align: center;
}

.step-card pre {
  margin: 0;
}

.step-card code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
}

/* Performance Stats */
.performance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat-card {
  padding: 2rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--vp-c-bg-soft) 0%, var(--vp-c-bg) 100%);
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--vp-c-brand);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 0.25rem;
}

.stat-desc {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin: 0;
}

/* Examples Grid */
.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.example-card {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 0.5rem;
  background: var(--vp-c-bg-soft);
}

.example-card h4 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.125rem;
}

.example-card pre {
  margin: 0;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 0.25rem;
  padding: 1rem;
  overflow-x: auto;
}

.example-card code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  line-height: 1.4;
}

/* Comparison Table */
.comparison-table {
  margin: 2rem 0;
  border: 1px solid var(--vp-c-border);
  border-radius: 0.5rem;
  overflow: hidden;
}

.comparison-header {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-border);
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.comparison-header span,
.comparison-row span {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
}

.comparison-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr;
  border-bottom: 1px solid var(--vp-c-border);
}

.comparison-row:nth-child(even) {
  background: var(--vp-c-bg-soft);
}

.comparison-row:last-child {
  border-bottom: none;
}

.highlight {
  color: var(--vp-c-brand);
  font-weight: 600;
}

/* Use Cases */
.use-cases {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.use-case {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 0.5rem;
  background: var(--vp-c-bg-soft);
  text-align: center;
}

.use-case-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.use-case h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.125rem;
}

.use-case p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.4;
}

/* CTA Section */
.cta-section {
  margin: 3rem 0 2rem 0;
  padding: 3rem 2rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 1rem;
  background: linear-gradient(135deg, var(--vp-c-brand) 0%, var(--vp-c-brand-dark) 100%);
  color: white;
  text-align: center;
}

.cta-content h2 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: bold;
}

.cta-content p {
  margin: 0 0 2rem 0;
  font-size: 1.125rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  display: inline-block;
  padding: 0.875rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
}

.cta-button.primary {
  background: white;
  color: var(--vp-c-brand);
  border: 1px solid white;
}

.cta-button.primary:hover {
  background: transparent;
  color: white;
  border-color: white;
}

.cta-button.secondary {
  background: transparent;
  color: white;
  border: 1px solid white;
}

.cta-button.secondary:hover {
  background: white;
  color: var(--vp-c-brand);
}

/* Responsive Design */
@media (max-width: 768px) {
  .quick-start-grid,
  .performance-stats,
  .examples-grid,
  .use-cases {
    grid-template-columns: 1fr;
  }

  .comparison-header,
  .comparison-row {
    grid-template-columns: 1fr;
  }

  .comparison-header span:first-child,
  .comparison-row span:first-child {
    font-weight: 600;
    background: var(--vp-c-bg-soft);
    border-bottom: 1px solid var(--vp-c-border);
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .cta-button {
    width: 100%;
    max-width: 300px;
  }
}
</style>
