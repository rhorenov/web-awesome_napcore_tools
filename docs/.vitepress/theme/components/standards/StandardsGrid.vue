<template>
  <div class="category-grid">
    <a
      v-for="standard in standards"
      :key="standard.slug"
      :href="withBase(`/standards/${standard.slug}`)"
      class="category-card"
    >
      <span class="category-badge">{{ standard.count }}</span>
      <img v-if="standard.logo" :src="withBase(standard.logo)" :alt="standard.name" class="standard-logo" />
      <span v-else class="category-icon">{{ standard.icon }}</span>
      <h3 class="category-title">{{ standard.name }}</h3>
      <p v-if="standard.description" class="category-description">{{ standard.description }}</p>
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { data as tools } from '@/core/data-loaders/tools.data';
import { STANDARDS } from '@/core/metadata/standards';
import { withBase } from 'vitepress';

interface Props {
  sortByCount?: boolean;
  textFilter?: string;
}

const props = withDefaults(defineProps<Props>(), {
  sortByCount: false,
});

// Every standard in standards.yaml with its tool count (0 when no tool lists it yet)
const standards = computed(() => {
  const standardsList = Object.entries(STANDARDS).map(([slug, standard]) => ({
    name: standard.title,
    slug,
    count: tools.filter((tool) => tool.standards?.includes(slug)).length,
    icon: standard.icon,
    logo: standard.logo,
    description: standard.description,
  }));

  // Sort by count if requested (descending order), otherwise alphabetically by title
  let result: typeof standardsList;
  if (props.sortByCount) {
    result = standardsList.sort((a, b) => b.count - a.count);
  } else {
    result = standardsList.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (props.textFilter) {
    const term = props.textFilter.trim().toLowerCase();
    return result.filter(
      (s) => s.name.toLowerCase().includes(term) || (s.description ?? '').toLowerCase().includes(term)
    );
  }
  return result;
});
</script>

<style scoped>
/* StandardsGrid uses the same card styling as CategoryGrid */

/* Logo image stands in for the emoji icon; sized to match .category-icon (3rem) */
.standard-logo {
  display: block;
  height: 3rem;
  width: auto;
  max-width: 80%;
  margin: 0 auto 1rem;
  object-fit: contain;
}
</style>
