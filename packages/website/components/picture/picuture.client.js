// Blurhash placeholders are painted as an inline `background` on <img> by the
// Picture override in ComponentProviders. Content pages ship no React runtime
// (`unstable_runtimeJS: false`), so clearing them is this bundle's job. Images
// can hold a placeholder in two situations: a `loading="lazy"` image that has
// not loaded yet, and an image that renders eagerly - which includes the clones
// glide inserts after this script has run, hence the observer below.
const PLACEHOLDER_SELECTOR =
  'img[loading=lazy], img[style*="radial-gradient"]';

const resetBackgroundBlurHash = (image) => {
  image.style.background = null;
  image.removeEventListener("load", onImageLoad);
};

const onImageLoad = (event) => {
  resetBackgroundBlurHash(event.currentTarget);
};

const sweep = (root) => {
  const images =
    root instanceof HTMLImageElement && root.matches(PLACEHOLDER_SELECTOR)
      ? [root]
      : [];
  for (const image of root.querySelectorAll(PLACEHOLDER_SELECTOR)) {
    images.push(image);
  }
  for (const image of images) {
    if (image.complete) {
      resetBackgroundBlurHash(image);
    } else {
      image.addEventListener("load", onImageLoad);
    }
  }
};

sweep(document);

// Sliders clone their slides, lazysizes unveils sections and the search modal
// builds markup on demand: all of them add images after the sweep above, and a
// cloned lazy image never fires for the listeners that sweep attached.
new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node instanceof Element) sweep(node);
    }
  }
}).observe(document.documentElement, { childList: true, subtree: true });
