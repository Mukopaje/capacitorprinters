export interface L156PrintOptions {
  data: string;
}

export interface L156PrinterPlugin {
  printRaw(options: L156PrintOptions): Promise<{ success: boolean }>;
}
