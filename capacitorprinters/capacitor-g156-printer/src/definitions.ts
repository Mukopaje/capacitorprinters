export interface G156PrintOptions {
  data: string;
}

export interface G156PrinterPlugin {
  printRaw(options: G156PrintOptions): Promise<{ success: boolean }>;
}
