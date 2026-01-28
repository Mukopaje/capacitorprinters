import { registerPlugin } from '@capacitor/core';
import type { L156PrinterPlugin } from './definitions';

/**
 * Capacitor wrapper for the L156 printer Cordova plugin.
 */
export const L156Printer = registerPlugin<L156PrinterPlugin>('L156Printer');

export * from './definitions';
