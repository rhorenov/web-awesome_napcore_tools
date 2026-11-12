<template>
  <p v-if="relatedCategories.length > 0" class="related-categories">
    <span class="related-list">
      <span class="related-label">Related categories:</span>
      <span v-for="category in relatedCategories" :key="category.slug" class="related-item">
        <a :href="withBase(`/categories/${category.slug}`)">{{ category.title }}</a>
      </span>
    </span>
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vitepress';
import { getCategoryBySlug } from '@/core/metadata/categories';
import { withBase } from 'vitepress';

const route = useRoute();

// Auto-detect current category from route
const currentCategorySlug = computed(() => {
  // Extract category from route path
  // e.g., /categories/validators -> validators
  const match = route.path.match(/\/categories\/([^/.]+)/);
  return match ? match[1] : null;
});

// Get related categories for the current category
const relatedCategories = computed(() => {
  if (!currentCategorySlug.value) {
    return [];
  }

  // Find the current category
  const currentCategory = getCategoryBySlug(currentCategorySlug.value);
  if (!currentCategory || !currentCategory.related || currentCategory.related.length === 0) {
    return [];
  }

  // Map related slugs to full category objects
  return currentCategory.related.map((slug) => getCategoryBySlug(slug)).filter((cat) => cat !== undefined);
});
</script>

<style scoped>
/*
 * Links separated by a dot. Every item carries its dot in its left padding and the
 * list is shifted left by that padding, so the dot of the first item on a wrapped
 * line falls outside the clipped box instead of hanging at a line edge.
 */
.related-categories {
  margin: 0.5rem 0 0;
  overflow: hidden;
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.related-list {
  display: flex;
  flex-wrap: wrap;
  margin-left: -1.25em;
}

.related-label,
.related-item {
  position: relative;
  padding-left: 1.25em;
}

/* Narrows the gap after the label; on a wrap the next line is unaffected */
.related-label {
  margin-right: -0.6em;
}

.related-item + .related-item::before {
  content: '·';
  position: absolute;
  left: 0;
  width: 1.25em;
  text-align: center;
  color: var(--vp-c-text-3);
}
</style>
