import { registerPlugin } from '@capacitor/core';
import type { D3PrinterPlugin } from './definitions';

/**
 * Capacitor wrapper for the D3 printer Cordova plugin.
 * Native implementation should be migrated from the `D3Printer` project.
 */
export const D3Printer = registerPlugin<D3PrinterPlugin>('D3Printer');

export * from './definitions';
