import { registerPlugin } from '@capacitor/core';
import type { G156PrinterPlugin } from './definitions';

/**
 * Capacitor wrapper for the G156 printer Cordova plugin.
 */
export const G156Printer = registerPlugin<G156PrinterPlugin>('g156printer');

export * from './definitions';
