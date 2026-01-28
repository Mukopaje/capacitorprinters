package com.printer.g153;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import com.szsicod.print.escpos.PrinterAPI;
import com.szsicod.print.io.InterfaceAPI;
import com.szsicod.print.io.USBAPI;
import java.io.UnsupportedEncodingException;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class g153printer extends CordovaPlugin {

  private static final int DISCONNECT = -5;
  private static final int NOCONNECT = -6;
  private static final int TOAST_CODE = 10001;
  private static final int REQUEST_CODE_INTENT = 10002;

  private PrinterAPI mPrinter;
  private Runnable runnable;

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
    Toast
      .makeText(tContext, "G156 Printer initialized...", Toast.LENGTH_SHORT)
      .show();
  }

  Handler handler = new Handler() {
    @Override
    public void handleMessage(Message msg) {
      super.handleMessage(msg);
      switch (msg.what) {
        case PrinterAPI.SUCCESS:
          onToast("Printer Connected");
          break;
        case PrinterAPI.FAIL:
        case PrinterAPI.ERR_PARAM:
          onToast("Printer Failed to Connect!");
          break;
        case DISCONNECT:
          onToast("Printer has been disconnected!");
          break;
        case NOCONNECT:
          onToast("Printer can not connect!");
          break;
        case TOAST_CODE:
          Toast.makeText(tContext, (String) msg.obj, Toast.LENGTH_SHORT).show();
          break;
      }
    }
  };

  public void onToast(String msg) {
    Toast.makeText(tContext, (String) msg, Toast.LENGTH_SHORT).show();
  }

  public void initPrinter() {
    new Thread(
      new Runnable() {
        @Override
        public void run() {
          mPrinter = PrinterAPI.getInstance();
          if (mPrinter.isConnect()) {
            mPrinter.disconnect();
            handler.obtainMessage(DISCONNECT).sendToTarget();
          }
          InterfaceAPI io = null;
          io = new USBAPI(context);

          System.out.println("Init Details " + io.toString());

          try {
            if (io != null) {
              handler.obtainMessage(mPrinter.connect(io)).sendToTarget();
              mPrinter.init();
            }

            handler.obtainMessage(1, "printer already opened").sendToTarget();
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

    if (mPrinter.isConnect()) {
      try {
        if (mPrinter == null) {
          Toast
            .makeText(tContext, "please open printer", Toast.LENGTH_SHORT)
            .show();
          return;
        }

        if (mPrinter == null) {
          initPrinter();
        }
        mPrinter.sendOrder(printContent1);
        if (QRCodeData != null && QRCodeData != "") {
          System.out.println("QRCODE STRING ..... " + QRCodeData);
          byte[] qrcode = PrinterData.appendQRcode(8, 3, QRCodeData);
          mPrinter.sendOrder(PrinterData.CENTER_ALIGN);
          mPrinter.sendOrder(qrcode);
        }
        mPrinter.printFeed();
        mPrinter.printFeed();
        mPrinter.printFeed();
        mPrinter.printFeed();
        mPrinter.printFeed();
        mPrinter.cutPaper(66, 0);

        if (ExtraOrderData != "" || ExtraOrderData != null) {
          mPrinter.sendOrder(extraPrintContent1);
          mPrinter.cutPaper(66, 0);
        }
      } catch (Exception e) {
        Toast.makeText(tContext, e.getMessage(), Toast.LENGTH_SHORT).show();
        System.out.println("Plugin Init  = 4" + e.getMessage());
        e.printStackTrace();
      }
    } else {
      handler.obtainMessage(NOCONNECT).sendToTarget();
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
