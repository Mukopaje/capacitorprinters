package cordova.plugin.d3printer;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import com.cloudpos.DeviceException;
import com.cloudpos.POSTerminal;
import com.cloudpos.cashdrawer.CashDrawerDevice;
import com.cloudpos.printer.Format;
import com.cloudpos.printer.PrinterDevice;
import com.cloudpos.sdk.printer.html.PrinterHtmlListener;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.Random;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class d3Printer extends CordovaPlugin {

  PrinterDevice device = null;
  public String ReceiptContent;
  public String BarcodeData;
  public String QRCodeData;
  public String ExtraOrderData;
  public byte[] printContent1;
  public byte[] extraPrintContent1 = null;
  public String printQRCodeContent;
  private Context context = null;
  private Context tContext = null;
  public Context mContext;
  private TextView txt;
  private String str;
  private String s1;

  @Override
  public boolean execute(
    String action,
    JSONArray data,
    CallbackContext callbackContext
  )
    throws JSONException {
    if (action.equals("printString")) {
      ReceiptContent = data.getString(0);
      QRCodeData = data.getString(1);
      ExtraOrderData = data.getString(2);
      printerPrint();
      return true;
    }

    return false;
  }

  @Override
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    tContext = webView.getContext();
    context = this.cordova.getActivity().getApplicationContext();
    System.out.println("Plugin Init  = 1");
    initPrinter();
  }

  Handler handler = new Handler() {
    @Override
    public void handleMessage(@NonNull Message msg) {
      super.handleMessage(msg);
      Toast.makeText(tContext, (String) msg.obj, Toast.LENGTH_SHORT).show();
    }
  };

  public void initPrinter() {
    new Thread(
      new Runnable() {
        @Override
        public void run() {
          device =
            (PrinterDevice) POSTerminal
              .getInstance(context)
              .getDevice("cloudpos.device.printer");
          System.out.println("Init Details " + device.toString());

          try {
            device.open();
            System.out.println("Plugin Init  = 2" + device.toString());
          } catch (Exception e) {
            handler
              .obtainMessage(1, "printer open exception  ...")
              .sendToTarget();
            e.printStackTrace();
            System.out.println("Plugin Init  = 3" + e.getMessage());
          }
        }
      }
    )
      .start();
  }

  public void printerPrint() {
    try {
      printContent1 = strToByteArray(ReceiptContent, "UTF-8");

      if (ExtraOrderData != "" || ExtraOrderData != null) {
        extraPrintContent1 = strToByteArray(ExtraOrderData, "UTF-8");
      }
    } catch (UnsupportedEncodingException e2) {
      e2.printStackTrace();
    }

    try {
      if (device == null) {
        Toast
          .makeText(tContext, "Printer not initialized!", Toast.LENGTH_SHORT)
          .show();
        return;
      }

      if (device == null) {
        initPrinter();
      }
      device.sendESCCommand(printContent1);
      if (QRCodeData != null && QRCodeData != "") {
        System.out.println("QRCODE STRING ..... " + QRCodeData);
        byte[] qrcode = PrinterData.appendQRcode(8, 3, QRCodeData);
        device.sendESCCommand(PrinterData.CENTER_ALIGN);
        device.sendESCCommand(qrcode);
      }
      device.printText("\n");
      device.printText("\n");
      device.printText("\n");
      device.cutPaper();

      if (ExtraOrderData != "" || ExtraOrderData != null) {
        device.sendESCCommand(extraPrintContent1);
        device.cutPaper();
      }
    } catch (DeviceException e) {
      Toast.makeText(tContext, e.getMessage(), Toast.LENGTH_SHORT).show();
      System.out.println("Plugin Init  = 4" + e.getMessage());
      e.printStackTrace();
    }
  }

  public static byte[] strToByteArray(String str, String encodeStr)
    throws UnsupportedEncodingException {
    if (str == null) {
      return null;
    }
    byte[] byteArray = null;
    if (encodeStr.equals("IBM852")) {
      byteArray = str.getBytes("IBM852");
    } else if (encodeStr.equals("GB2312")) {
      byteArray = str.getBytes("GB2312");
    } else if (encodeStr.equals("ISO-8859-1")) {
      byteArray = str.getBytes("ISO-8859-1");
    } else if (encodeStr.equals("UTF-8")) {
      byteArray = str.getBytes("UTF-8");
    } else {
      byteArray = str.getBytes();
    }
    return byteArray;
  }
}
