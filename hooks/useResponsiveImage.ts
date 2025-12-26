import { useState, useEffect } from "react";
import { EventImageUrl } from "@/types/event";

/**
 * Hook to get the appropriate image URL based on device type and orientation
 * - Desktop: landscape (fallback to portrait)
 * - Mobile portrait: portrait (fallback to landscape)
 * - Mobile landscape: landscape (fallback to portrait)
 * - Default: portrait
 */
export function useResponsiveImage(
  imageUrl: EventImageUrl | undefined
): string | undefined {
  // Default to portrait as per requirement
  const getDefaultImage = () => {
    if (!imageUrl) return undefined;
    return imageUrl.portrait || imageUrl.landscape || undefined;
  };

  const [imageSrc, setImageSrc] = useState<string | undefined>(getDefaultImage);

  useEffect(() => {
    if (!imageUrl) {
      setImageSrc(undefined);
      return;
    }

    const updateImage = () => {
      // Check if window is available (client-side only)
      if (typeof window === "undefined") {
        setImageSrc(imageUrl.portrait || imageUrl.landscape || undefined);
        return;
      }

      const isDesktop = window.innerWidth >= 768; // md breakpoint
      const isPortraitOrientation =
        window.innerHeight > window.innerWidth ||
        window.matchMedia("(orientation: portrait)").matches;

      if (isDesktop) {
        // Desktop: prefer landscape, fallback to portrait
        setImageSrc(imageUrl.landscape || imageUrl.portrait || undefined);
      } else {
        // Mobile: use orientation-based selection
        if (isPortraitOrientation) {
          // Mobile portrait: prefer portrait, fallback to landscape
          setImageSrc(imageUrl.portrait || imageUrl.landscape || undefined);
        } else {
          // Mobile landscape: prefer landscape, fallback to portrait
          setImageSrc(imageUrl.landscape || imageUrl.portrait || undefined);
        }
      }
    };

    // Initial update
    updateImage();

    // Listen for resize and orientation changes
    window.addEventListener("resize", updateImage);
    window.addEventListener("orientationchange", updateImage);

    // Use matchMedia for orientation changes (more reliable)
    const orientationMediaQuery = window.matchMedia("(orientation: portrait)");
    const handleOrientationChange = () => updateImage();
    orientationMediaQuery.addEventListener("change", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", updateImage);
      window.removeEventListener("orientationchange", updateImage);
      orientationMediaQuery.removeEventListener(
        "change",
        handleOrientationChange
      );
    };
  }, [imageUrl]);

  return imageSrc;
}
