# Changelog

## [37] - 2026-02-21

### Added
- GNOME 49 compatibility
- Separate data refresh interval setting (minimum 5 minutes) distinct from the ticker rotation interval, with a floor to prevent hammering data providers
- Schema changes now trigger automatic recompile in the build process

### Fixed
- Yahoo Finance authentication: reworked cookie/crumb handling to reliably obtain a valid session and cache credentials for 30 days; invalid cached crumbs (e.g. stale "too many requests" responses) are now detected and refreshed
- Ticker panel item no longer renders with an unintended background; stray invisible delimiters between ticker entries removed
- Settings window no longer shows a blank page before content appears on first open
- Work to prevent stale references across disable/re-enable cycles
- A single shared `Soup.Session` is now reused across all HTTP requests instead of constructing a new session per request
- `console.warn` / `console.error` / `console.debug` used throughout in place of the removed `log()` / `global.log()` APIs

### Removed
- Donate and source-link icon assets removed from the About preferences page
- GPL v2 link in About page corrected to GPL v3

## [36] - 2025-01-01

- Added GNOME 48 support

## [35] - 2024-01-01

- See repository history
