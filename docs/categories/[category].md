---
document: category
---

<script setup>
// Dynamic category page template: renders every category in categories.yaml.
// A hand-crafted docs/categories/<slug>.md, if one is added, takes precedence over
// this generated route (see [category].paths.ts).
//
// Keep "# " comments out of the frontmatter: vitepress-plugin-llmstxt does not strip
// CRLF frontmatter and takes the first "# " line as the page title in llms.txt.
//
// This import ensures VitePress watches categories.yaml for changes
import { data as _categoriesData } from '../.vitepress/core/data-loaders/categories.data'
</script>

# {{ $params.categoryName }}

<p v-if="$params.description">{{ $params.description }}</p>

<RelatedCategories />

## Available Tools

<ToolsFilter />
