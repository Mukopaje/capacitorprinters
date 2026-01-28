package cordova.plugin.l156printer;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.caysn.autoreplyprint.AutoReplyPrint;
import com.sun.jna.Pointer;

@CapacitorPlugin(name = "L156Printer")
public class L156PrinterPlugin extends Plugin {

    private static final String TAG = "L156PrinterPlugin";
    private static final String ACTION_USB_PERMISSION = "cordova.plugin.l156printer.USB_PERMISSION";
    
    private UsbManager usbManager;
    private PendingIntent permissionIntent;
    private PluginCall savedCall;

    @Override
    public void load() {
        super.load();
        usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
        
        // Create intent for USB permission
        int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ? 
            PendingIntent.FLAG_MUTABLE : PendingIntent.FLAG_UPDATE_CURRENT;
        permissionIntent = PendingIntent.getBroadcast(
            getContext(), 
            0, 
            new Intent(ACTION_USB_PERMISSION), 
            flags
        );
        
        // Register USB permission broadcast receiver
        IntentFilter filter = new IntentFilter(ACTION_USB_PERMISSION);
        getContext().registerReceiver(usbReceiver, filter);
        Log.i(TAG, "L156Printer plugin loaded and USB receiver registered");
    }

    @Override
    protected void handleOnDestroy() {
        try {
            getContext().unregisterReceiver(usbReceiver);
        } catch (Exception e) {
            Log.e(TAG, "Error unregistering USB receiver", e);
        }
        super.handleOnDestroy();
    }

    private final BroadcastReceiver usbReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (ACTION_USB_PERMISSION.equals(action)) {
                synchronized (this) {
                    UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                    
                    if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                        if (device != null) {
                            Log.i(TAG, "USB permission granted for device: " + device.getDeviceName());
                            // Permission granted, now try printing
                            if (savedCall != null) {
                                executePrint(savedCall);
                            }
                        }
                    } else {
                        Log.e(TAG, "USB permission denied for device: " + (device != null ? device.getDeviceName() : "null"));
                        if (savedCall != null) {
                            savedCall.reject("USB permission denied");
                            savedCall = null;
                        }
                    }
                }
            }
        }
    };

    @PluginMethod
    public void printRaw(PluginCall call) {
        String data = call.getString("data");
        Log.i(TAG, "printRaw called, data null? " + (data == null));
        if (data != null) {
            Log.i(TAG, "Data length: " + data.length() + " chars");
            Log.i(TAG, "First 100 chars: " + (data.length() > 100 ? data.substring(0, 100) : data));
        }
        
        if (data == null) {
            call.reject("Missing 'data' parameter");
            return;
        }

        // Check if we need to request USB permission
        UsbDevice printerDevice = findPrinterDevice();
        if (printerDevice != null && !usbManager.hasPermission(printerDevice)) {
            Log.i(TAG, "Requesting USB permission for device: " + printerDevice.getDeviceName());
            savedCall = call;
            usbManager.requestPermission(printerDevice, permissionIntent);
            return;
        }

        executePrint(call);
    }

    private void executePrint(PluginCall call) {
        String data = call.getString("data");
        try {
            printText(data);
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
            savedCall = null;
        } catch (Exception e) {
            Log.e(TAG, "Print failed", e);
            call.reject("Print failed: " + e.getMessage(), e);
            savedCall = null;
        }
    }

    private UsbDevice findPrinterDevice() {
        if (usbManager == null) return null;
        
        for (UsbDevice device : usbManager.getDeviceList().values()) {
            int vendorId = device.getVendorId();
            // L156 printer VIDs: 0x4B43 (19267) or 0x0FE6 (4070)
            if (vendorId == 19267 || vendorId == 4070) {
                Log.i(TAG, "Found printer device: VID=" + vendorId + ", PID=" + device.getProductId());
                return device;
            }
        }
        return null;
    }

    private void printText(String text) throws Exception {
        Log.i(TAG, "printText called with text length: " + (text != null ? text.length() : 0));
        Log.i(TAG, "Text preview (first 200 chars): " + (text != null && text.length() > 200 ? text.substring(0, 200) : text));
        
        Pointer h = openUsbPort();
        if (h == null || h.equals(Pointer.NULL)) {
            throw new Exception("Unable to open printer USB port");
        }

        try {
            // Check if text already contains cut command (ESC/POS: GS V)
            boolean hasCutCommand = text.contains("\u001dV");
            
            // Send text in chunks to avoid buffer overflow
            // Use smaller chunks (200 chars) for reliable printing
            int chunkSize = 200;
            int textLength = text.length();
            int chunks = (int) Math.ceil((double) textLength / chunkSize);
            
            Log.i(TAG, "Printing " + chunks + " chunks (" + chunkSize + " chars each)");
            
            for (int i = 0; i < textLength; i += chunkSize) {
                int end = Math.min(i + chunkSize, textLength);
                String chunk = text.substring(i, end);
                
                boolean result = AutoReplyPrint.INSTANCE.CP_Pos_PrintText(h, chunk);
                if (!result) {
                    Log.w(TAG, "Chunk " + (i/chunkSize + 1) + " print warning");
                }
                
                // Small delay between chunks to prevent buffer overflow
                if (i + chunkSize < textLength) {
                    try {
                        Thread.sleep(30);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
            
            Log.i(TAG, "All chunks printed");
            
            // Only add cut command if text doesn't already have it
            if (!hasCutCommand) {
                Log.i(TAG, "Adding feed and cut command");
                boolean result = AutoReplyPrint.INSTANCE.CP_Pos_FeedAndHalfCutPaper(h);
                if (!result) {
                    Log.w(TAG, "Feed and cut warning: operation returned false");
                }
            } else {
                Log.i(TAG, "Cut command already in receipt data");
            }
            
            Log.i(TAG, "Print completed successfully");
        } finally {
            // Always close the port
            AutoReplyPrint.INSTANCE.CP_Port_Close(h);
        }
    }

    private Pointer openUsbPort() {
        Pointer h = Pointer.NULL;
        String[] listUsbPort = AutoReplyPrint.CP_Port_EnumUsb_Helper.EnumUsb();
        if (listUsbPort != null) {
            for (String usbPort : listUsbPort) {
                // These VID/PID checks come from the vendor sample (L156 family)
                if (usbPort.contains("0x4B43") || usbPort.contains("0x0FE6")) {
                    h = AutoReplyPrint.INSTANCE.CP_Port_OpenUsb(usbPort, 1);
                    break;
                }
            }
        }
        Log.i(TAG, h == Pointer.NULL ? "OpenPort Failed" : "OpenPort Success");
        return h;
    }
}
