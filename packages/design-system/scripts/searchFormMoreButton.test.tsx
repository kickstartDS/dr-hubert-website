// @vitest-environment happy-dom

import { afterEach, describe, expect, test } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Providers from "../src/components/Providers";
import { SearchForm } from "../src/components/search-form/SearchFormComponent";
import SearchFormClient from "../src/components/search-form/SearchForm.client";

// More hits than fit on one page, so the form - rendered with an `action`, the
// way the header's search modal renders it - shows the "view all results"
// button with the total hit count instead of the inline pagination.
const totalResults = 12;
const noResultsTerm = "nothing";

// Pagefind only exists inside a built site, so the client is driven with a
// deterministic engine here.
class SearchFormTest extends SearchFormClient {
  static identifier = "dsa.search-form.test";

  async loadEngine() {
    return async (term) =>
      term === noResultsTerm
        ? []
        : Array.from({ length: totalResults }, (_, index) => () => ({
            title: `Result ${index + 1}`,
            url: `/result-${index + 1}`,
          }));
  }
}

// Pubsub delivers asynchronously, and both the engine and the search behind
// `dsa.search.search` resolve in microtasks, so hand control back to the event
// loop before asserting.
const settle = () => {
  const { promise, resolve } = Promise.withResolvers();
  setTimeout(resolve, 0);
  return promise;
};

const search = async (term) => {
  const loaded = Promise.withResolvers();
  window._ks.radio.once("dsa.search.loaded", loaded.resolve);
  window._ks.radio.emit("dsa.search.search", { term });
  await loaded.promise;
};

let unmount = () => {};

afterEach(() => unmount());

const mount = async () => {
  // `canBeCloned` in the design system's defaults merge asks `postMessage`
  // whether a value survives structured cloning. Browsers reject functions
  // with a DataCloneError, happy-dom does not, and the merge would then try to
  // clone the button's `renderLabel` callback.
  window.postMessage = (value) => structuredClone(value);

  const host = document.createElement("div");
  document.body.append(host);
  host.innerHTML = renderToStaticMarkup(
    createElement(
      Providers,
      null,
      createElement(SearchForm, {
        component: "dsa.search-form.test",
        action: "#",
      })
    )
  );

  const element = host.querySelector("form");
  // `Component.onDisconnect` pushes onto the element's own cleanup list, which
  // the custom element upgrade would normally have created.
  element._ks = { d: [] };
  new SearchFormTest(element);
  // Every form listens to the global radio, so an instance has to be torn down
  // before the next test mounts its own.
  unmount = () => {
    element._ks.d.forEach((cleanUp) => cleanUp());
    host.remove();
  };

  await settle();

  return {
    moreButton: element.querySelector(".dsa-search-form__nav .c-button"),
    input: element.querySelector(".dsa-search-bar__input input"),
  };
};

describe("SearchForm more button", () => {
  test("hides the button when the term is cleared", async () => {
    const { moreButton, input } = await mount();

    await search("hubert");
    expect(moreButton.hasAttribute("hidden")).toBe(false);
    expect(moreButton.textContent).toContain(String(totalResults));

    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await settle();
    expect(moreButton.hasAttribute("hidden")).toBe(true);
  });

  test("hides the button when a term has no results", async () => {
    const { moreButton } = await mount();

    await search("hubert");
    expect(moreButton.hasAttribute("hidden")).toBe(false);

    await search(noResultsTerm);
    expect(moreButton.hasAttribute("hidden")).toBe(true);
  });
});
