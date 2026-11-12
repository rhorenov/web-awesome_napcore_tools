<template>
  <div v-if="standard" class="standard-info">
    <img v-if="standard.logo" :src="withBase(standard.logo)" :alt="standard.title" class="standard-info-logo" />
    <p>{{ standard.purpose }}</p>
    <table>
      <tbody>
        <tr v-for="fact in facts" :key="fact.label">
          <th scope="row">{{ fact.label }}</th>
          <td>{{ fact.value }}</td>
        </tr>
        <tr v-if="standard.link">
          <th scope="row">More info</th>
          <td>
            <a :href="standard.link" target="_blank" rel="noopener">{{ standard.link }}</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useData, withBase } from 'vitepress';
import type { Standard } from '@/core/data-loaders/standards.data';

// Body of the collapsible block on a standard page; the long title is the block's
// summary. The standard comes from the route params that [standard].paths.ts builds
// from standards.yaml, so the page and the data cannot drift apart.
const { params } = useData();

const standard = computed(() => (params.value?.details ?? undefined) as Standard | undefined);

const facts = computed(() => {
  const s = standard.value;
  if (!s) return [];
  return [
    { label: 'Domain', value: s.domain },
    { label: 'Status', value: s.status },
    { label: 'Format', value: s.format_technology },
    { label: 'Maintainer', value: s.maintainer_origin },
  ].filter((fact) => fact.value);
});
</script>

<style scoped>
.standard-info-logo {
  display: block;
  height: 4rem;
  width: auto;
  margin: 1.25rem 0 0;
}

.standard-info th {
  text-align: left;
  white-space: nowrap;
}
</style>
