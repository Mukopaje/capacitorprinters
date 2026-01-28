import { registerPlugin } from '@capacitor/core';
import type { SmartOne4GPrinterPlugin } from './definitions';

/**
 * Capacitor wrapper for the Smart One 4G printer Cordova plugin.
 */
export const SmartOne4GPrinter = registerPlugin<SmartOne4GPrinterPlugin>('smart-one-4g-printer');

export * from './definitions';
