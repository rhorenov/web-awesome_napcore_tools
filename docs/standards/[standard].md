<script setup>
// Keep "# " comments out of the frontmatter: vitepress-plugin-llmstxt does not strip
// CRLF frontmatter and takes the first "# " line as the page title in llms.txt.
//
// This import ensures VitePress watches standards.yaml for changes
import { data as _standardsData } from '../.vitepress/core/data-loaders/standards.data'
import { withBase } from 'vitepress'
</script>

# {{ $params.standardName }}

<div v-if="$params.details">

::: details {{ $params.details.longTitle }}

<StandardInfo />

<div v-if="$params.details.related_standards_with_titles && $params.details.related_standards_with_titles.length > 0">

### Related Standards

<ul>
  <li v-for="related in $params.details.related_standards_with_titles" :key="related.slug">
    <a :href="withBase(`/standards/${related.slug}`)">{{ related.title }}</a>
  </li>
</ul>

</div>
:::

</div>

## Tools

<ToolsFilter :standard="$params.standard" />
