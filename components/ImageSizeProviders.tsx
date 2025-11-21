import {
  Children,
  ComponentProps,
  FC,
  forwardRef,
  HTMLAttributes,
  PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import { ImageSizeProvider, useImageSize } from "./ImageSizeContext";
import {
  SectionContext,
  SectionContextDefault,
} from "@kickstartds/ds-agency-premium/section";
import {
  LogosContext,
  LogosContextDefault,
} from "@kickstartds/ds-agency-premium/logos";
import {
  ImageStoryContext,
  ImageStoryContextDefault,
} from "@kickstartds/ds-agency-premium/components/image-story/index.js";
import calculated from "@/token/calculated";

const SectionProvider: FC<PropsWithChildren> = (props) => {
  const UpstreamSection = useContext(SectionContext);

  const Section = useMemo(
    () =>
      forwardRef<
        HTMLDivElement,
        ComponentProps<typeof SectionContextDefault> &
          Omit<HTMLAttributes<HTMLElement>, "style" | "content">
      >(function SectionImageSize(props, ref) {
        // TODO should also take into account section gap width
        const childCount = Children.count(props.children) || 1;

        const sectionWidthName =
          props.content?.width === "unset" || !props.content?.width
            ? props.width || "default"
            : calculated.sectionWidths[props.content?.width || "default"] >
              calculated.sectionWidths[props.width || "default"]
            ? props.width || "default"
            : props.content?.width || "default";

        const sectionWidth =
          calculated.sectionWidths[sectionWidthName] *
          calculated.baseFontSizePx;

        const componentWidth =
          props.content?.mode === "list"
            ? sectionWidth
            : props.content?.mode === "slider"
            ? sectionWidth
            : sectionWidth / childCount;

        return (
          <ImageSizeProvider size={componentWidth}>
            <UpstreamSection {...props} ref={ref} />
          </ImageSizeProvider>
        );
      }),
    [UpstreamSection]
  );

  return <SectionContext.Provider {...props} value={Section} />;
};

const LogosProvider: FC<PropsWithChildren> = (props) => {
  const UpstreamLogos = useContext(LogosContext);

  const Logos = useMemo(
    () =>
      forwardRef<
        HTMLDivElement,
        ComponentProps<typeof LogosContextDefault> &
          HTMLAttributes<HTMLDivElement>
      >(function LogosImageSize(props, ref) {
        const size = useImageSize();
        const gapSize = calculated.desktop["--dsa-logos__grid--gap-horizontal"];
        const logoSize = Math.ceil(
          (size - gapSize * (props.logosPerRow || 3)) / (props.logosPerRow || 3)
        );

        return (
          <ImageSizeProvider size={logoSize}>
            <UpstreamLogos {...props} ref={ref} />
          </ImageSizeProvider>
        );
      }),
    [UpstreamLogos]
  );

  return <LogosContext.Provider {...props} value={Logos} />;
};

const ImageStoryProvider: FC<PropsWithChildren> = (props) => {
  const UpstreamImageStory = useContext(ImageStoryContext);

  const ImageStory = useMemo(
    () =>
      forwardRef<
        HTMLDivElement,
        ComponentProps<typeof ImageStoryContextDefault> &
          HTMLAttributes<HTMLDivElement>
      >(function ImageStoryImageSize(props, ref) {
        const size = useImageSize();
        const gapSize =
          calculated.phone["--dsa-image-story--horizontal-padding"];
        const imageSize = Math.ceil(size / 2 - gapSize);

        return (
          <ImageSizeProvider size={imageSize}>
            <UpstreamImageStory {...props} ref={ref} />
          </ImageSizeProvider>
        );
      }),
    [UpstreamImageStory]
  );

  return <ImageStoryContext.Provider {...props} value={ImageStory} />;
};

const ImageSizeProviders = (props: PropsWithChildren) => (
  <SectionProvider>
    <LogosProvider>
      <ImageStoryProvider>{props.children}</ImageStoryProvider>
    </LogosProvider>
  </SectionProvider>
);

export default ImageSizeProviders;
