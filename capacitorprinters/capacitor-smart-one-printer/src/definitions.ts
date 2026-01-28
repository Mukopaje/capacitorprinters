export interface SmartOnePrintOptions {
  data: string;
}

export interface SmartOnePrinterPlugin {
  printRaw(options: SmartOnePrintOptions): Promise<{ success: boolean }>;
}
