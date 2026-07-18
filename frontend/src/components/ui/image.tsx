import { forwardRef, type ImgHTMLAttributes, useEffect, useState } from "react";
import "./image.css";

const FALLBACK_IMAGE_URL =
  "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png";

export type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fittingType?: string;
  originWidth?: number;
  originHeight?: number;
  focalPointX?: number;
  focalPointY?: number;
};

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, ...props }, ref) => {
    const [imgSrc, setImgSrc] = useState<string | undefined>(src);

    useEffect(() => {
      // If src prop changes, update the imgSrc state
      setImgSrc((prev) => {
        if (prev !== src) {
          return src;
        }
        return prev;
      });
    }, [src]);

    if (!src) {
      return <div data-empty-image ref={ref as any} {...(props as any)} />;
    }

    // Strip non-standard HTML props before rendering to standard img element
    const {
      fittingType,
      originWidth,
      originHeight,
      focalPointX,
      focalPointY,
      ...htmlProps
    } = props;

    return (
      <img
        ref={ref}
        src={imgSrc || FALLBACK_IMAGE_URL}
        onError={() => setImgSrc(FALLBACK_IMAGE_URL)}
        {...htmlProps}
      />
    );
  },
);

Image.displayName = "Image";
