package cordova.plugin.smartoneprinter;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;

import android.content.BroadcastReceiver;
import android.content.Intent;
import android.content.Context;
import android.widget.Toast;
import android.util.Log;
import android.os.BatteryManager;
import org.json.JSONObject;

import cordova.plugin.smartoneprinter.utils.HandlerUtils;

public class PrinterStatusReceiver extends BroadcastReceiver {
    private static final String TAG = "ZPOSSmartOnePrinterReceiver";

    private CallbackContext callbackReceive;

    private boolean isReceiving = true;
    private HandlerUtils.MyHandler handler;
    public boolean LowBattery = false;

   
    @Override
    public void onReceive(Context context, Intent data) {
        if (this.isReceiving && this.callbackReceive != null) {
            String action = data.getAction();
            String type = "PrinterStatus";

            if (action.equals(Intent.ACTION_BATTERY_CHANGED)) {
				int status = data.getIntExtra(BatteryManager.EXTRA_STATUS,
						BatteryManager.BATTERY_STATUS_NOT_CHARGING);
				int level = data.getIntExtra(BatteryManager.EXTRA_LEVEL, 0);
				int scale = data.getIntExtra(BatteryManager.EXTRA_SCALE, 0);
					if (status != BatteryManager.BATTERY_STATUS_CHARGING) {
						if (level * 5 <= scale) {
							LowBattery = true;
						} else {
							LowBattery = false;
						}
					} else {
						LowBattery = false;
					}
				
        try {

            JSONObject jsonObj = new JSONObject();
         

                jsonObj.put("type", type);
                jsonObj.put("action", LowBattery);

                Log.i(TAG, "RECEIVED STATUS " + action);

                PluginResult result = new PluginResult(PluginResult.Status.OK, jsonObj);
                result.setKeepCallback(true);
    
                callbackReceive.sendPluginResult(result);
            } catch (Exception e) {
                Log.i(TAG, "ERROR: " + e.getMessage());
            }
        }
    }
}

    public void startReceiving(CallbackContext ctx) {

        this.callbackReceive = ctx;
        this.isReceiving = true;

        Log.i(TAG, "Start receiving status");
    }

    public void stopReceiving() {
        this.callbackReceive = null;
        this.isReceiving = false;

        Log.i(TAG, "Stop receiving status");
    }
}