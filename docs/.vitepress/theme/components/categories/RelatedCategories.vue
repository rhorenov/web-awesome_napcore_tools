<template>
  <RelatedLinks label="Related categories:" :items="relatedCategories" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vitepress';
import { getCategoryBySlug } from '@/core/metadata/categories';
import RelatedLinks, { type RelatedLink } from '../RelatedLinks.vue';

const route = useRoute();

// Auto-detect current category from route
const currentCategorySlug = computed(() => {
  // Extract category from route path
  // e.g., /categories/validators -> validators
  const match = route.path.match(/\/categories\/([^/.]+)/);
  return match ? match[1] : null;
});

// Get related categories for the current category
const relatedCategories = computed<RelatedLink[]>(() => {
  if (!currentCategorySlug.value) {
    return [];
  }

  // Find the current category
  const currentCategory = getCategoryBySlug(currentCategorySlug.value);
  if (!currentCategory || !currentCategory.related || currentCategory.related.length === 0) {
    return [];
  }

  // Map related slugs to links, skipping unknown slugs
  return currentCategory.related
    .map((slug) => getCategoryBySlug(slug))
    .filter((cat) => cat !== undefined)
    .map((cat) => ({ title: cat.title, href: `/categories/${cat.slug}` }));
});
</script>
