<script setup>
// Keep "# " comments out of the frontmatter: vitepress-plugin-llmstxt does not strip
// CRLF frontmatter and takes the first "# " line as the page title in llms.txt.
//
// This import ensures VitePress watches standards.yaml for changes
import { data as _standardsData } from '../.vitepress/core/data-loaders/standards.data'
</script>

# {{ $params.standardName }}

<div v-if="$params.details">

::: details {{ $params.details.longTitle }}

<StandardInfo />

:::

</div>

<RelatedStandards />

## Tools

<ToolsFilter :standard="$params.standard" />
