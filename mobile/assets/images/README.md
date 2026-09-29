# Chowly Expo app assets

Copy these files into `assets/images/`:

| Generated file | Expo destination |
| --- | --- |
| `icon.png` | `assets/images/icon.png` |
| `ios-icon.png` | `assets/images/ios-icon.png` |
| `android-icon-foreground.png` | `assets/images/android-icon-foreground.png` |
| `android-icon-background.png` | `assets/images/android-icon-background.png` |
| `android-icon-monochrome.png` | `assets/images/android-icon-monochrome.png` |
| `splash-icon.png` | `assets/images/splash-icon.png` |
| `favicon.png` | `assets/images/favicon.png` |

The Android adaptive icon combines the transparent foreground with `android-icon-background.png`, which carries the same Chowly teal gradient as the approved main icon. `logo-mark-teal.png` and `logo-mark-white.png` are reusable transparent brand marks.

Merge `app-config-chowly.json` into the existing `app.json`. Preserve all unrelated identifiers, plugins, permissions, and experiments from the existing configuration.

Icon and splash changes require a new native build. Test the splash in a preview or production build rather than Expo Go.
