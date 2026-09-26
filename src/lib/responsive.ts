export const MOBILE_QUERY = "(max-width: 767.98px)";

export const HEADER_HEIGHT = "56px";

export const VIEW_HEIGHT = `calc(100dvh - ${HEADER_HEIGHT})`;
export const SCREEN_HEIGHT = "100dvh";

export const Z_INDEX = {
  mapOverlay: 1000,
  sheet: 1001,
  header: 1050,
  sidebar: 1100,
} as const;

export const TOUCH_TARGET = "44px";
