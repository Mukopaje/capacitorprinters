export interface Q1PrintOptions {
  /** Raw ESC/POS or device-native string to send */
  data: string;
}

export interface Q1PrinterPlugin {
  /** Initialize the built-in Q1 printer (if required). */
  printerInit(): Promise<{ success: boolean }>;

  /** Send raw data to the Q1 printer. */
  sendRAWData(options: Q1PrintOptions): Promise<{ success: boolean }>;
}

export interface Q1PrinterStatusEvent {
  status: string;
}
