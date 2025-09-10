---
title: Примеры использования
description: Практические примеры использования Nuxt Render Cache в различных сценариях
navigation:
  icon: i-lucide-code
---

# Примеры использования

Эта секция содержит практические примеры использования Nuxt Render Cache в различных сценариях - от простых страниц до сложных приложений.

## Базовые примеры

### Кеширование домашней страницы

```vue [pages/index.vue]
<template>
  <div>
    <!-- Кеширование основной части страницы -->
    <CacheRender
      cache-key="page:home"
      :hard-ttl="300"
      :soft-ttl="60"
      :cache-tags="['page', 'home', 'public']"
    >
      <div class="home-page">
        <HeroSection />
        <FeaturesList />
        <Testimonials :data="testimonials" />
        <LatestNews :articles="news" />
      </div>
    </CacheRender>

    <!-- Отдельное кеширование для персонализированного контента -->
    <CacheRender
      v-if="user"
      :cache-key="`user:${user.id}:feed`"
      :hard-ttl="180"
      :soft-ttl="30"
      :cache-tags="['user', 'feed', `user:${user.id}`]"
    >
      <PersonalizedFeed :user="user" />
    </CacheRender>
  </div>
</template>

<script setup>
// Данные для страницы
const testimonials = await $fetch('/api/testimonials');
const news = await $fetch('/api/news');
const user = await $fetch('/api/user');
</script>
```

### Кеширование компонентов с данными

```vue [components/ProductList.vue]
<template>
  <CacheRender
    cache-key="products:list"
    :hard-ttl="600"
    :soft-ttl="120"
    :cache-tags="['products', 'catalog']"
  >
    <div class="product-grid">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </CacheRender>
</template>

<script setup>
// Данные загружаются только при первом рендере или истечении кеша
const products = await $fetch('/api/products');
</script>
```

## Продвинутые примеры

### Кеширование с динамическими ключами

```vue [pages/products/[id].vue]
<template>
  <div>
    <!-- Кеш зависит от ID продукта -->
    <CacheRender
      :cache-key="`product:${$route.params.id}:details`"
      :hard-ttl="900"
      :soft-ttl="300"
      :cache-tags="['product', `product:${$route.params.id}`]"
    >
      <ProductDetails :product="product" />
    </CacheRender>

    <!-- Кеш для похожих продуктов -->
    <CacheRender
      :cache-key="`product:${$route.params.id}:related`"
      :hard-ttl="1800"
      :soft-ttl="600"
      :cache-tags="['product', 'related', `product:${$route.params.id}`]"
    >
      <RelatedProducts :product="product" />
    </CacheRender>
  </div>
</template>

<script setup>
const product = await $fetch(`/api/products/${$route.params.id}`);
</script>
```

### Кеширование результатов поиска

```vue [pages/search.vue]
<template>
  <div>
    <SearchForm v-model="query" @submit="performSearch" />

    <!-- Кеш зависит от поискового запроса и параметров -->
    <CacheRender
      :cache-key="`search:query:${query}:page:${page}:sort:${sort}`"
      :hard-ttl="300"
      :soft-ttl="60"
      :cache-tags="['search', 'results']"
    >
      <SearchResults
        :query="query"
        :page="page"
        :sort="sort"
        :results="searchResults"
      />
    </CacheRender>
  </div>
</template>

<script setup>
const route = useRoute();
const query = ref(route.query.q || '');
const page = ref(parseInt(route.query.page) || 1);
const sort = ref(route.query.sort || 'relevance');

const searchResults = ref(null);

const performSearch = async () => {
  searchResults.value = await $fetch('/api/search', {
    query: { q: query.value, page: page.value, sort: sort.value },
  });
};

// Выполняем поиск при загрузке страницы
await performSearch();
</script>
```

### Кеширование API дашборда

```vue [pages/dashboard.vue]
<template>
  <div>
    <!-- Кеширование метрик с частым обновлением -->
    <CacheRender
      cache-key="dashboard:metrics"
      :hard-ttl="180"
      :soft-ttl="30"
      :cache-tags="['dashboard', 'metrics', 'realtime']"
    >
      <MetricsGrid :metrics="metrics" />
    </CacheRender>

    <!-- Кеширование графиков с более длительным TTL -->
    <CacheRender
      cache-key="dashboard:charts"
      :hard-ttl="600"
      :soft-ttl="120"
      :cache-tags="['dashboard', 'charts']"
    >
      <ChartsSection :data="chartData" />
    </CacheRender>

    <!-- Кеширование таблицы с данными -->
    <CacheRender
      cache-key="dashboard:table"
      :hard-ttl="300"
      :soft-ttl="60"
      :cache-tags="['dashboard', 'table', 'data']"
    >
      <DataTable :items="tableData" />
    </CacheRender>
  </div>
</template>

<script setup>
// Данные обновляются часто
const metrics = await $fetch('/api/dashboard/metrics');

// Графики обновляются реже
const chartData = await $fetch('/api/dashboard/charts');

// Таблица с данными
const tableData = await $fetch('/api/dashboard/table');
</script>
```

## Примеры с composables

### Программное кеширование

```typescript [composables/useCachedApi.ts]
import { useRenderCache } from 'nuxt-render-cache';

export const useCachedApi = () => {
  const apiCache = useRenderCache({
    cacheKey: 'api:products',
    hardTtl: 300, // 5 минут
    softTtl: 60, // 1 минута
    cacheTags: ['api', 'products'],
  });

  const fetchProducts = async (category?: string) => {
    const cacheKey = category
      ? `api:products:category:${category}`
      : 'api:products';

    // Создаем новый экземпляр с динамическим ключом
    const categoryCache = useRenderCache({
      cacheKey,
      hardTtl: 300,
      softTtl: 60,
      cacheTags: ['api', 'products', category ? `category:${category}` : 'all'],
    });

    // Этот код выполнится только при первом запросе или истечении кеша
    const products = await $fetch('/api/products', {
      query: category ? { category } : {},
    });

    return products;
  };

  return {
    fetchProducts,
  };
};
```

### Кеширование с обработкой ошибок

```typescript [composables/useResilientCache.ts]
import { useRenderCache } from 'nuxt-render-cache';

export const useResilientCache = () => {
  const createResilientCache = (options: {
    cacheKey: string;
    hardTtl: number;
    softTtl: number;
    cacheTags: string[];
    fallbackData?: any;
  }) => {
    const renderCache = useRenderCache(options);

    const renderWithFallback = async (
      slots: Slots,
      instance: ComponentInternalInstance
    ) => {
      try {
        return await renderCache.render(slots, instance);
      } catch (error) {
        console.error(`Cache error for ${options.cacheKey}:`, error);

        // Возвращаем fallback данные или рендерим без кеша
        if (options.fallbackData) {
          return options.fallbackData;
        }

        // Fallback рендеринг
        return await renderComponentToString(slots, instance);
      }
    };

    return {
      render: renderWithFallback,
    };
  };

  return {
    createResilientCache,
  };
};
```

### Управление кешем через API

```typescript [composables/useCacheManager.ts]
import { useCache } from 'nuxt-render-cache';

export const useCacheManager = () => {
  const cache = useCache();

  // Получение статистики кеша
  const getCacheStats = async () => {
    try {
      const response = await $fetch('/api/render-cache/stats', {
        headers: { 'x-render-cache-api': process.env.RENDER_CACHE_API_TOKEN },
      });
      return response;
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return null;
    }
  };

  // Очистка кеша по тегам
  const invalidateByTags = async (tags: string[]) => {
    try {
      const response = await $fetch('/api/render-cache/keys', {
        method: 'DELETE',
        headers: {
          'x-render-cache-api': process.env.RENDER_CACHE_API_TOKEN,
          'Content-Type': 'application/json',
        },
        body: { tags },
      });
      return response;
    } catch (error) {
      console.error('Failed to invalidate cache:', error);
      return null;
    }
  };

  // Полная очистка кеша
  const clearAllCache = async () => {
    try {
      const response = await $fetch('/api/render-cache/clear', {
        method: 'DELETE',
        headers: { 'x-render-cache-api': process.env.RENDER_CACHE_API_TOKEN },
      });
      return response;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return null;
    }
  };

  // Автоматическая инвалидация при изменениях данных
  const invalidateOnDataChange = async (entity: string, id: string) => {
    const tags = [entity, `${entity}:${id}`];

    if (entity === 'user') {
      tags.push('profile', 'feed');
    } else if (entity === 'product') {
      tags.push('catalog', 'inventory');
    }

    return await invalidateByTags(tags);
  };

  return {
    getCacheStats,
    invalidateByTags,
    clearAllCache,
    invalidateOnDataChange,
  };
};
```

## Реальные сценарии использования

### Электронная коммерция

```vue [pages/products.vue]
<template>
  <div>
    <!-- Кеш для списка продуктов -->
    <CacheRender
      cache-key="products:list"
      :hard-ttl="600"
      :soft-ttl="120"
      :cache-tags="['products', 'catalog']"
    >
      <ProductGrid :products="products" />
    </CacheRender>

    <!-- Кеш для фильтров и категорий -->
    <CacheRender
      cache-key="products:filters"
      :hard-ttl="1800"
      :soft-ttl="600"
      :cache-tags="['products', 'filters', 'categories']"
    >
      <ProductFilters :categories="categories" />
    </CacheRender>

    <!-- Кеш для популярных продуктов -->
    <CacheRender
      cache-key="products:popular"
      :hard-ttl="300"
      :soft-ttl="60"
      :cache-tags="['products', 'popular', 'featured']"
    >
      <PopularProducts :products="popularProducts" />
    </CacheRender>
  </div>
</template>

<script setup>
const products = await $fetch('/api/products');
const categories = await $fetch('/api/categories');
const popularProducts = await $fetch('/api/products/popular');
</script>
```

### Блог/CMS система

```vue [pages/blog.vue]
<template>
  <div>
    <!-- Кеш для списка статей -->
    <CacheRender
      cache-key="blog:posts:list"
      :hard-ttl="900"
      :soft-ttl="300"
      :cache-tags="['blog', 'posts', 'list']"
    >
      <BlogPostList :posts="posts" />
    </CacheRender>

    <!-- Кеш для популярных статей -->
    <CacheRender
      cache-key="blog:posts:popular"
      :hard-ttl="1800"
      :soft-ttl="600"
      :cache-tags="['blog', 'posts', 'popular']"
    >
      <PopularPosts :posts="popularPosts" />
    </CacheRender>

    <!-- Кеш для категорий -->
    <CacheRender
      cache-key="blog:categories"
      :hard-ttl="3600"
      :soft-ttl="1800"
      :cache-tags="['blog', 'categories']"
    >
      <BlogCategories :categories="categories" />
    </CacheRender>
  </div>
</template>

<script setup>
const posts = await $fetch('/api/blog/posts');
const popularPosts = await $fetch('/api/blog/posts/popular');
const categories = await $fetch('/api/blog/categories');
</script>
```

### Социальная сеть

```vue [pages/feed.vue]
<template>
  <div>
    <!-- Персонализированная лента -->
    <CacheRender
      :cache-key="`feed:user:${user.id}`"
      :hard-ttl="300"
      :soft-ttl="60"
      :cache-tags="['feed', 'user', `user:${user.id}`]"
    >
      <UserFeed :posts="feedPosts" />
    </CacheRender>

    <!-- Рекомендации -->
    <CacheRender
      :cache-key="`recommendations:user:${user.id}`"
      :hard-ttl="600"
      :soft-ttl="120"
      :cache-tags="['recommendations', `user:${user.id}`]"
    >
      <Recommendations :posts="recommendedPosts" />
    </CacheRender>

    <!-- Популярные тренды -->
    <CacheRender
      cache-key="trends:global"
      :hard-ttl="180"
      :soft-ttl="30"
      :cache-tags="['trends', 'global']"
    >
      <GlobalTrends :trends="trends" />
    </CacheRender>
  </div>
</template>

<script setup>
const user = await $fetch('/api/user');
const feedPosts = await $fetch(`/api/feed/${user.id}`);
const recommendedPosts = await $fetch(`/api/recommendations/${user.id}`);
const trends = await $fetch('/api/trends');
</script>
```

## Оптимизации производительности

### Стратегии TTL для разных типов контента

```typescript [utils/cacheStrategies.ts]
// Стратегии TTL для разных типов контента
export const cacheStrategies = {
  // Статический контент (редко изменяется)
  static: {
    hard: 3600, // 1 час
    soft: 1800, // 30 минут
  },

  // Динамический контент
  dynamic: {
    hard: 600, // 10 минут
    soft: 120, // 2 минуты
  },

  // Реальное время
  realtime: {
    hard: 60, // 1 минута
    soft: 30, // 30 секунд
  },

  // Персонализированный контент
  personalized: {
    hard: 900, // 15 минут
    soft: 300, // 5 минут
  },

  // API данные
  api: {
    hard: 300, // 5 минут
    soft: 60, // 1 минута
  },
};

// Вспомогательные функции
export const getCacheConfig = (type: keyof typeof cacheStrategies) => {
  return cacheStrategies[type];
};

export const createCacheKey = (...parts: string[]) => {
  return parts.join(':');
};

export const createCacheTags = (...tags: string[]) => {
  return tags;
};
```

### Автоматическая инвалидация при изменениях

```typescript [server/api/content/post.put.ts]
// Автоматическая инвалидация кеша при обновлении контента
export default defineEventHandler(async (event) => {
  const { id, ...data } = await readBody(event);

  // Обновляем контент в базе данных
  const updatedPost = await updatePost(id, data);

  // Инвалидируем связанный кеш
  const cacheTags = ['blog', 'posts', `post:${id}`];

  try {
    await $fetch('/api/render-cache/keys', {
      method: 'DELETE',
      headers: {
        'x-render-cache-api': process.env.RENDER_CACHE_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: { tags: cacheTags },
    });
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
    // Не прерываем обновление контента из-за ошибки инвалидации
  }

  return updatedPost;
});
```

### Мониторинг производительности

```typescript [composables/usePerformanceMonitor.ts]
import { useCache } from 'nuxt-render-cache';

export const usePerformanceMonitor = () => {
  const cache = useCache();

  const monitorCachePerformance = async () => {
    const startTime = Date.now();

    // Измеряем время получения данных из кеша
    const cacheHit = await cache.get('performance:test');
    const cacheTime = Date.now() - startTime;

    // Получаем общую статистику
    const stats = await cache.getStats();

    return {
      cacheTime,
      cacheHit: !!cacheHit,
      totalKeys: stats.totalKeys,
      hitRate: calculateHitRate(stats.redisInfo),
      memoryUsage: parseInt(stats.redisInfo.used_memory || '0'),
    };
  };

  const calculateHitRate = (redisInfo: Record<string, string>) => {
    const hits = parseInt(redisInfo.keyspace_hits || '0');
    const misses = parseInt(redisInfo.keyspace_misses || '0');
    const total = hits + misses;

    return total > 0 ? (hits / total) * 100 : 0;
  };

  const logPerformanceMetrics = async () => {
    const metrics = await monitorCachePerformance();

    console.log('Cache Performance Metrics:', {
      'Cache Response Time': `${metrics.cacheTime}ms`,
      'Cache Hit': metrics.cacheHit ? 'Yes' : 'No',
      'Total Keys': metrics.totalKeys,
      'Hit Rate': `${metrics.hitRate.toFixed(2)}%`,
      'Memory Usage': `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)} MB`,
    });

    return metrics;
  };

  return {
    monitorCachePerformance,
    logPerformanceMetrics,
  };
};
```

## Заключение

Эти примеры демонстрируют различные подходы к использованию Nuxt Render Cache в реальных приложениях. Вы можете адаптировать их под свои нужды, комбинируя различные стратегии кеширования для достижения оптимальной производительности.

Ключевые принципы эффективного использования:

1. **Правильный выбор TTL** - адаптируйте время жизни под характер контента
2. **Умное тегирование** - группируйте связанные данные для эффективной инвалидации
3. **Мониторинг** - отслеживайте производительность и hit rate кеша
4. **Graceful degradation** - обеспечивайте работу без кеша при сбоях
5. **Автоматическая инвалидация** - очищайте кеш при изменениях данных

Для более сложных сценариев изучите разделы [Архитектура](/essentials/architecture) и [API](/essentials/api).
