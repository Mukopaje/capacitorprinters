export interface SmartOne4GPrintOptions {
  data: string;
}

export interface SmartOne4GPrinterPlugin {
  printRaw(options: SmartOne4GPrintOptions): Promise<{ success: boolean }>;
}
