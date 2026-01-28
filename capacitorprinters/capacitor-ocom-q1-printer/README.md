# @zpos/capacitor-ocom-q1-printer

Capacitor plugin for the OCOM Q1 built-in printer, migrated from the legacy Cordova plugin `cordova-plugin-ocom-q1-printer`.

## Status

- TypeScript API and Capacitor registration are scaffolded.
- Native Android implementation should be ported from the Cordova plugin (service `ZPOSQ1Printer`).

## API

```ts
import { Q1Printer } from '@zpos/capacitor-ocom-q1-printer';

await Q1Printer.printerInit();
await Q1Printer.sendRAWData({ data: '\u001b@Hello World' });
```

Once the native migration is complete, this package can be published as a standalone plugin and consumed by the POS app.
