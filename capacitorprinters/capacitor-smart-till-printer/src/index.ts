import { registerPlugin } from '@capacitor/core';
import type { SmartTillPrinterPlugin } from './definitions';

/**
 * Capacitor wrapper for the Smart Till printer Cordova plugin.
 */
export const SmartTillPrinter = registerPlugin<SmartTillPrinterPlugin>('smart-till');

export * from './definitions';
