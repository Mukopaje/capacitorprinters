# Capacitor Printer Plugins

This folder hosts standalone Capacitor printer plugins migrated from the legacy Cordova plugins in `../printers`.

Each subfolder is intended to be a separate publishable package (GitHub repo / npm package) that can be developed and versioned independently.

Planned plugins:

- `capacitor-ocom-q1-printer`  (from `cordova-plugin-ocom-q1-printer`)
- `capacitor-d3-printer`       (from `D3Printer`)
- `capacitor-l156-printer`     (from `L156Printer`)
- `capacitor-g156-printer`     (from `g156printer`)
- `capacitor-smart-one-printer`   (from `smart-one-printer`)
- `capacitor-smart-one-4g-printer`(from `smart-one-4g-printer`)
- `capacitor-smart-till-printer`  (from `smart-till`)

At the moment, each plugin is scaffolded with a minimal Capacitor v6 plugin structure and a TypeScript API. Native implementations can be incrementally migrated from the corresponding Cordova plugins as needed.
