<template>
  <RelatedLinks label="Related standards:" :items="relatedStandards" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vitepress';
import { STANDARDS } from '@/core/metadata/standards';
import RelatedLinks, { type RelatedLink } from '../RelatedLinks.vue';

const route = useRoute();

// Detect the current standard from the route (e.g. /standards/netex -> netex), so the
// component also works on a hand-crafted standard page, which has no route params
const currentStandardSlug = computed(() => {
  const match = route.path.match(/\/standards\/([^/.]+)/);
  return match ? match[1] : null;
});

// Related standards from standards.yaml, skipping unknown slugs
const relatedStandards = computed<RelatedLink[]>(() => {
  const slug = currentStandardSlug.value;
  const related = slug ? STANDARDS[slug]?.related_standards : undefined;
  return (related ?? [])
    .filter((relatedSlug) => STANDARDS[relatedSlug])
    .map((relatedSlug) => ({ title: STANDARDS[relatedSlug].title, href: `/standards/${relatedSlug}` }));
});
</script>
