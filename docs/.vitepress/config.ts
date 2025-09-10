import { defineConfig } from 'vitepress';
import ru from './locales/ru';

export default defineConfig({
  title: 'Nuxt Render Cache',
  description:
    'Мощная библиотека для кеширования рендеринга компонентов в Nuxt 3 приложениях',

  // Язык по умолчанию
  lang: 'ru-RU',

  // Базовый путь
  base: '/',

  // Настройки темы
  themeConfig: {
    // Название сайта
    siteTitle: 'Nuxt Render Cache',

    // Навигация
    nav: [
      { text: ru['nav.home'], link: '/' },
      {
        text: ru['nav.documentation'],
        items: [
          {
            text: ru['nav.installation'],
            link: '/1.getting-started/1.installation',
          },
          { text: ru['nav.components'], link: '/2.essentials/1.components' },
          { text: ru['nav.composables'], link: '/2.essentials/2.composables' },
          { text: ru['nav.api'], link: '/2.essentials/3.api' },
          {
            text: ru['nav.architecture'],
            link: '/2.essentials/4.architecture',
          },
          { text: ru['nav.examples'], link: '/3.examples/' },
        ],
      },
    ],

    // Боковое меню
    sidebar: [
      {
        text: ru['sidebar.getting-started'],
        collapsed: false,
        items: [
          {
            text: ru['docs.installation.title'],
            link: '/1.getting-started/1.installation',
          },
        ],
      },
      {
        text: ru['sidebar.essentials'],
        collapsed: false,
        items: [
          {
            text: ru['docs.components.title'],
            link: '/2.essentials/1.components',
            items: [
              {
                text: 'CacheRender компонент',
                link: '/2.essentials/1.components#cache-render-компонент',
              },
              {
                text: 'Пропы и настройки',
                link: '/2.essentials/1.components#пропы-и-настройки',
              },
              {
                text: 'Примеры использования',
                link: '/2.essentials/1.components#примеры-использования',
              },
            ],
          },
          {
            text: ru['docs.composables.title'],
            link: '/2.essentials/2.composables',
            items: [
              {
                text: 'useRenderCache',
                link: '/2.essentials/2.composables#userendercache',
              },
              {
                text: 'useCache',
                link: '/2.essentials/2.composables#usecache',
              },
              {
                text: 'Продвинутые примеры',
                link: '/2.essentials/2.composables#продвинутые-примеры',
              },
            ],
          },
          {
            text: ru['docs.api.title'],
            link: '/2.essentials/3.api',
            items: [
              {
                text: 'Управление кешем',
                link: '/2.essentials/3.api#управление-кешем',
              },
              {
                text: 'Статистика',
                link: '/2.essentials/3.api#статистика',
              },
              {
                text: 'API ключи',
                link: '/2.essentials/3.api#api-ключи',
              },
            ],
          },
          {
            text: ru['docs.architecture.title'],
            link: '/2.essentials/4.architecture',
            items: [
              {
                text: 'Архитектура системы',
                link: '/2.essentials/4.architecture#архитектура-системы',
              },
              {
                text: 'Алгоритм кеширования',
                link: '/2.essentials/4.architecture#алгоритм-кеширования',
              },
              {
                text: 'Двухуровневый TTL',
                link: '/2.essentials/4.architecture#двухуровневый-ttl',
              },
            ],
          },
        ],
      },
      {
        text: ru['sidebar.examples'],
        collapsed: false,
        items: [
          {
            text: 'Примеры использования',
            link: '/3.examples/',
            items: [
              {
                text: 'Базовый пример',
                link: '/3.examples/#базовый-пример',
              },
              {
                text: 'Распределенное кеширование',
                link: '/3.examples/#распределенное-кеширование',
              },
              {
                text: 'API интеграция',
                link: '/3.examples/#api-интеграция',
              },
            ],
          },
        ],
      },
    ],

    // Социальные ссылки
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/your-username/nuxt-render-cache',
      },
    ],

    // Нижний колонтитул
    footer: {
      message: ru['message.footer-message'],
      copyright: ru['message.footer-copyright'],
    },

    // Настройки поиска
    search: {
      provider: 'local',
      options: {
        locales: {
          'ru-RU': {
            translations: {
              button: {
                buttonText: ru['button.search'],
                buttonAriaLabel: ru['button.search'],
              },
              modal: {
                displayDetails: 'Показать подробный список',
                resetButtonTitle: 'Сбросить поиск',
                backButtonTitle: 'Вернуться к результатам поиска',
                noResultsText: ru['message.no-results'],
                footer: {
                  selectText: 'для выбора',
                  selectKeyAriaLabel: 'введите',
                  navigateText: 'для навигации',
                  navigateUpKeyAriaLabel: 'стрелка вверх',
                  navigateDownKeyAriaLabel: 'стрелка вниз',
                  closeText: 'закрыть',
                  closeKeyAriaLabel: 'escape',
                },
              },
            },
          },
        },
      },
    },

    // Настройки темы
    outline: {
      level: [2, 3],
      label: ru['message.on-this-page'],
    },

    // Текст для редактирования на GitHub
    editLink: {
      pattern:
        'https://github.com/your-username/nuxt-render-cache/edit/main/docs/:path',
      text: ru['button.edit-page'],
    },

    // Текст для последнего обновления
    lastUpdated: {
      text: ru['message.last-updated'],
    },

    // Кнопка возврата наверх
    returnToTopLabel: ru['button.return-to-top'],

    // Текст для предыдущей/следующей страницы
    docFooter: {
      prev: ru['message.previous-page'],
      next: ru['message.next-page'],
    },
  },

  // Настройки локализации
  locales: {
    root: {
      label: ru['site.title'],
      lang: 'ru-RU',
      title: ru['site.title'],
      description: ru['description.home'],
    },
  },

  // Настройки сборки
  vite: {
    // Оптимизации для VitePress
    optimizeDeps: {
      include: ['@vueuse/core'],
    },
  },

  // Мета-теги
  head: [
    [
      'meta',
      { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    ],
    ['meta', { name: 'description', content: ru['description.home'] }],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'nuxt, render, cache, ssr, redis, performance, typescript, рендеринг, кеширование, производительность',
      },
    ],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
  ],

  // Плагины и middleware
  markdown: {
    // Настройки для markdown
    lineNumbers: true,

    // Конфигурация контейнеров
    container: {
      tipLabel: '💡 Подсказка',
      warningLabel: '⚠️ Внимание',
      dangerLabel: '🚨 Опасность',
      infoLabel: 'ℹ️ Информация',
      detailsLabel: '📋 Подробности',
    },
  },

  // Sitemap
  sitemap: {
    hostname: 'https://nuxt-render-cache.dev',
  },
});
