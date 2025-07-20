import React, { useRef, useEffect, useState } from "react";

interface ImageFitProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

export function ImageFit({ src, alt, className = "", ...props }: ImageFitProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [fitClass, setFitClass] = useState("w-full h-auto");

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.naturalWidth && img.naturalHeight) {
      setFitClass(img.naturalWidth >= img.naturalHeight ? "w-full h-auto" : "h-full w-auto");
    }
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={`max-w-full max-h-full ${fitClass} ${className}`}
      style={{ aspectRatio: "1/1", objectFit: "contain", objectPosition: "center" }}
      {...props}
    />
  );
} 