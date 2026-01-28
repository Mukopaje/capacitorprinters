export interface D3PrintOptions {
  data: string;
}

export interface D3PrinterPlugin {
  printRaw(options: D3PrintOptions): Promise<{ success: boolean }>;
}
