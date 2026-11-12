// Data loader for stats - all calculations are now fully dynamic from tools data
import toolsDataLoader from './tools.data';
import categoriesDataLoader from './categories.data';
import standardsDataLoader from './standards.data';

export default {
  // Watch tool files for dynamic calculations
  watch: ['../tools/*.md', '../data/standards.yaml'],
  /**
   * Calculates dynamic statistics for tools, categories, and standards.
   * Loads all tools and computes counts, status breakdowns, and category distribution.
   *
   * @returns Object containing tools, categories, and standards statistics
   */
  load() {
    // Load tools data dynamically
    const tools = toolsDataLoader.load();

    // Calculate tool statistics dynamically
    const toolStats = {
      total: tools.length,
      active: tools.filter((t) => t.status === 'active').length,
      maintenance: tools.filter((t) => t.status === 'maintenance').length,
      deprecated: tools.filter((t) => t.status === 'deprecated').length,
    };

    // Get category slugs from the data loader. A .data.ts loader is bundled by
    // esbuild without VitePress's virtual `data` resolution, so it reads the
    // categories loader directly rather than metadata/categories' CATEGORIES.
    const categorySlugs = Object.keys(categoriesDataLoader.load());

    // Calculate category statistics dynamically
    const categoryStats: Record<string, number> = {
      total: categorySlugs.length,
      withTools: 0,
    };

    // Initialize all category counts to 0
    categorySlugs.forEach((slug) => {
      categoryStats[slug] = 0;
    });

    // Count tools per category
    tools.forEach((tool) => {
      tool.categories.forEach((catSlug: string) => {
        if (Object.hasOwn(categoryStats, catSlug)) {
          categoryStats[catSlug]++;
        }
      });
    });

    // Count how many categories have at least one tool
    categoryStats.withTools = categorySlugs.filter((slug) => categoryStats[slug] > 0).length;

    // Count the standards in standards.yaml, the same set the standards grid,
    // the sidebar and the OKF bundle list (a standard may have no tool yet)
    const standardsStats = {
      total: Object.keys(standardsDataLoader.load()).length,
    };

    // Return combined statistics (all calculated dynamically)
    return {
      tools: toolStats,
      categories: categoryStats,
      standards: standardsStats,
    };
  },
};
