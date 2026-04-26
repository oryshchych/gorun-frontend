import { useSyncExternalStore } from "react";
import { EventImageUrl } from "@/types/event";

type ViewportMode = "desktop" | "mobile-portrait" | "mobile-landscape";

function getViewportMode(): ViewportMode {
  if (window.innerWidth >= 768) {
    return "desktop";
  }

  const isPortraitOrientation =
    window.innerHeight > window.innerWidth ||
    window.matchMedia("(orientation: portrait)").matches;

  return isPortraitOrientation ? "mobile-portrait" : "mobile-landscape";
}

function getServerSnapshot(): ViewportMode {
  return "mobile-portrait";
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  window.addEventListener("orientationchange", onStoreChange);

  const orientationMediaQuery = window.matchMedia("(orientation: portrait)");
  orientationMediaQuery.addEventListener("change", onStoreChange);

  return () => {
    window.removeEventListener("resize", onStoreChange);
    window.removeEventListener("orientationchange", onStoreChange);
    orientationMediaQuery.removeEventListener("change", onStoreChange);
  };
}

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
  const viewportMode = useSyncExternalStore(
    subscribe,
    getViewportMode,
    getServerSnapshot
  );

  if (!imageUrl) {
    return undefined;
  }

  if (viewportMode === "mobile-portrait") {
    return imageUrl.portrait || imageUrl.landscape || undefined;
  }

  return imageUrl.landscape || imageUrl.portrait || undefined;
}
