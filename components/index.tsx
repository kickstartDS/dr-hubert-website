import dynamic from "next/dynamic";
import {
  SbBlokData,
  storyblokEditable,
  StoryblokComponent,
} from "@storyblok/react";
import { unflatten } from "@/helpers/unflatten";
import { Section } from "@kickstartds/ds-agency-premium/section";
import editablePage from "./Page";

export const editable =
  (Component: React.ComponentType<any>, nestedBloksKey?: string) =>
  // eslint-disable-next-line react/display-name
  ({ blok }: { blok: SbBlokData }) =>
    (
      <Component {...storyblokEditable(blok)} {...unflatten(blok)}>
        {nestedBloksKey &&
          (blok[nestedBloksKey] as SbBlokData[] | undefined)?.map(
            (nestedBlok) => (
              <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
            )
          )}
      </Component>
    );

const editableBlogTeaser = editable(
  dynamic(() =>
    import("@kickstartds/ds-agency-premium/blog-teaser").then(
      (mod) => mod.BlogTeaserContextDefault
    )
  )
);

export const components = {
  page: editablePage,
  "blog-overview": dynamic(() => import("./BlogOverview")),
  "blog-post": dynamic(() => import("./BlogPost")),
  "blog-teaser": editableBlogTeaser,
  "blog-aside": editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/blog-aside").then(
        (mod) => mod.BlogAsideContextDefault
      )
    )
  ),
  "blog-head": editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/blog-head").then(
        (mod) => mod.BlogHeadContextDefault
      )
    )
  ),
  section: editable(Section, "components"),
  cta: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/cta").then(
        (mod) => mod.CtaContextDefault
      )
    )
  ),
  faq: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/faq").then(
        (mod) => mod.FaqContextDefault
      )
    )
  ),
  features: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/features").then(
        (mod) => mod.FeaturesContextDefault
      )
    )
  ),
  feature: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/feature").then(
        (mod) => mod.FeatureContextDefault
      )
    )
  ),
  gallery: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/gallery").then(
        (mod) => mod.GalleryContextDefault
      )
    )
  ),
  headline: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/headline").then(
        (mod) => mod.Headline
      )
    )
  ),
  split: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/split").then((mod) => mod.Split)
    )
  ),
  stats: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/stats").then(
        (mod) => mod.StatsContextDefault
      )
    )
  ),
  stat: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/stat").then(
        (mod) => mod.StatContextDefault
      )
    )
  ),
  "teaser-card": editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/teaser-card").then(
        (mod) => mod.TeaserCardContextDefault
      )
    )
  ),
  testimonials: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/testimonials").then(
        (mod) => mod.Testimonials
      )
    )
  ),
  testimonial: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/testimonial").then(
        (mod) => mod.TestimonialContextDefault
      )
    )
  ),
  text: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/text").then(
        (mod) => mod.TextContextDefault
      )
    )
  ),
  "image-text": editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/image-text").then(
        (mod) => mod.ImageTextContextDefault
      )
    )
  ),
  logos: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/logos").then(
        (mod) => mod.LogosContextDefault
      )
    )
  ),
  hero: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/hero").then(
        (mod) => mod.HeroContextDefault
      )
    )
  ),
  mosaic: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/mosaic").then(
        (mod) => mod.MosaicContextDefault
      )
    )
  ),
  "video-curtain": editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/video-curtain").then(
        (mod) => mod.VideoCurtainContextDefault
      )
    )
  ),
  "image-story": editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/image-story").then(
        (mod) => mod.ImageStoryContextDefault
      )
    )
  ),
  slider: editable(
    dynamic(() =>
      import("@kickstartds/ds-agency-premium/slider").then((mod) => mod.Slider)
    )
  ),
};
