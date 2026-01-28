import { registerPlugin } from '@capacitor/core';
import type { SmartOnePrinterPlugin } from './definitions';

/**
 * Capacitor wrapper for the Smart One printer Cordova plugin.
 */
export const SmartOnePrinter = registerPlugin<SmartOnePrinterPlugin>('smart-one-printer');

export * from './definitions';
