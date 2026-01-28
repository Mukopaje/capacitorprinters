export interface SmartTillPrintOptions {
  data: string;
}

export interface SmartTillPrinterPlugin {
  printRaw(options: SmartTillPrintOptions): Promise<{ success: boolean }>;
}
