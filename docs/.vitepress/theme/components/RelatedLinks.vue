<template>
  <p v-if="items.length > 0" class="related-links">
    <span class="related-list">
      <span class="related-label">{{ label }}</span>
      <span v-for="item in items" :key="item.href" class="related-item">
        <a :href="withBase(item.href)">{{ item.title }}</a>
      </span>
    </span>
  </p>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress';

// One line of links under a page title, shared by RelatedCategories and RelatedStandards
export interface RelatedLink {
  title: string;
  href: string; // site path without the base, e.g. /standards/netex
}

defineProps<{
  label: string;
  items: RelatedLink[];
}>();
</script>

<style scoped>
/*
 * Links separated by a dot. Every item carries its dot in its left padding and the
 * list is shifted left by that padding, so the dot of the first item on a wrapped
 * line falls outside the clipped box instead of hanging at a line edge.
 */
.related-links {
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
