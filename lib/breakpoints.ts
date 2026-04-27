/** Canonical min-width breakpoints (px). Keep numeric parity with the breakpoint comment block in app/globals.css. */
export const BP_TABLET_MIN = 768;
export const BP_DESKTOP_MIN = 1280;
/** Layout-only breakpoint (two-column grids); not part of device tier. */
export const BP_TWO_COL_MIN = 1024;

/** Last pixel width counted as mobile tier (matches CSS max-width for phone layouts). */
export const MOBILE_MAX = BP_TABLET_MIN - 1;
/** Last pixel width counted as tablet tier (desktop tier starts at BP_DESKTOP_MIN). */
export const TABLET_MAX = BP_DESKTOP_MIN - 1;
