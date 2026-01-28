import { registerPlugin } from '@capacitor/core';
import type { Q1PrinterPlugin } from './definitions';

/**
 * Capacitor wrapper for the OCOM Q1 built-in printer.
 *
 * Native implementation should be migrated from the Cordova plugin
 * `cordova-plugin-ocom-q1-printer` (service name: `ZPOSQ1Printer`).
 */
export const Q1Printer = registerPlugin<Q1PrinterPlugin>('ZPOSQ1Printer');

export * from './definitions';
