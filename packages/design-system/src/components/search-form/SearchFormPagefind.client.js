import { define } from "@kickstartds/core/lib/component";
import SearchForm from "./SearchForm.client";

const staticPageFindPath = "/pagefind/pagefind.js";

// A section hit's url is the crawled file plus its heading fragment
// (`/produkte/a1110-05-e.html#eigenschaften`), while the page's public url
// comes from its `url` meta (`/produkte/a1110-05-e`). Keep the fragment, drop
// the crawled file, so the hit links to its section on the page itself.
const pagefindSectionUrl = (pageUrl, sectionUrl) => {
  const fragment = sectionUrl.indexOf("#");
  return fragment === -1 ? pageUrl : `${pageUrl}${sectionUrl.slice(fragment)}`;
};

const pagefindResult2searchResult = ({ sub_results, ...result }) => {
  const pageUrl = result.meta.url || result.url;
  const hasRootSubResult = sub_results?.[0]?.url === pageUrl;
  // Pagefind's sub-results also include the page's own top section: the anchor
  // of its first heading, whose text repeats the page title. Rendering it puts
  // a second copy of the primary hit into the list, so drop every entry that
  // repeats the page title - what remains are the page's other headings, each
  // linking to its own section.
  const subResults = (
    hasRootSubResult ? sub_results.slice(1) : sub_results || []
  ).filter(
    (subResult) => subResult.title?.trim() !== result.meta.title?.trim()
  );

  return {
    title: result.meta.title,
    url: pageUrl,
    excerpt: result.excerpt,
    image: result.meta.image,
    subResults: subResults.map((subResult) => ({
      title: subResult.title,
      url: pagefindSectionUrl(pageUrl, subResult.url),
      excerpt: subResult.excerpt,
      locations: subResult.locations,
    })),
  };
};

export default class SearchFormPagefind extends SearchForm {
  static identifier = "dsa.search-form.pagefind";

  async loadEngine() {
    const pagefind = await import(/* @vite-ignore */ staticPageFindPath);
    await pagefind.init();
    return async function search(term) {
      const search = await pagefind.search(term);
      if (search) {
        return search.results.map(
          (result) => () => result.data().then(pagefindResult2searchResult)
        );
      }
    };
  }
}

define(SearchFormPagefind.identifier, SearchFormPagefind);
