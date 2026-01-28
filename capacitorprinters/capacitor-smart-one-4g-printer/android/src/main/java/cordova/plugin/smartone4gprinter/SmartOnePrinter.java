package cordova.plugin.smartoneprinter;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.AsyncTask;
import android.os.BatteryManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Base64;
import android.util.Log;
import android.util.TimeFormatException;
import android.view.KeyEvent;
import android.widget.Toast;
import com.common.sdk.printer.escpos.EscPos;
import cordova.plugin.smartoneprinter.PrinterStatusReceiver;
// import cordova.plugin.smartoneprinter.PrinterData;
import java.io.UnsupportedEncodingException;
import java.lang.System;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * This class echoes a string called from JavaScript.
 */
public class SmartOnePrinter extends CordovaPlugin {

  public boolean isFirstIn = true;
  public boolean isInit = false;
  public boolean LowBattery = false;
  public boolean hasLogo = false;
  public boolean hasBarcode = false;
  public boolean hasQRCode = false;
  public String langue;
  public String ReceiptContent;
  public String BarcodeData;
  public String QRCodeData;
  public String printQRCodeContent;

  private EscPos mEscPos = null;
  private Context context = null;
  private Context tContext = null;
  public Intent intent = null;
  public ProgressDialog dialog = null;
  private PrinterStatusReceiver printerStatusReceiver = new PrinterStatusReceiver();

  public static final String TAG = "SmartOne";

  @Override
  public boolean execute(
    String action,
    JSONArray data,
    CallbackContext callbackContext
  )
    throws JSONException {
    if (action.equals("printerInit")) {
      new PrinterAllDemoTask().execute();
      return true;
    } else if (action.equals("printString")) {
      ReceiptContent = data.getString(0);
      QRCodeData = data.getString(1);
      new PrintReceipt().execute();
      return true;
    } else if (action.equals("printBarCode")) {
      BarcodeData = data.getString(0);
      new PrintBarcode().execute();
      return true;
    } else if (action.equals("printQRCode")) {
      QRCodeData = data.getString(0);
      new PrintQRCode().execute();
      return true;
    }
    return false;
  }

  @Override
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    tContext = webView.getContext();
    context = this.cordova.getActivity().getApplicationContext();

    // bitMapUtils = new BitmapUtils(applicationContext);
    // dialog = new ProgressDialog(context);
    intent = new Intent();
    mEscPos = new EscPos(context);

    IntentFilter pIntentFilter = new IntentFilter();
    pIntentFilter.addAction(Intent.ACTION_BATTERY_CHANGED);
    context.registerReceiver(printerStatusReceiver, pIntentFilter);
  }

  public class PrintReceipt extends AsyncTask<Void, Void, String> {

    @Override
    protected void onPreExecute() {
      if (LowBattery == false) {
        Toast
          .makeText(
            webView.getContext(),
            "Printing Please Wait... ",
            Toast.LENGTH_LONG
          )
          .show();
      }
    }

    @Override
    protected String doInBackground(Void... params) {
      byte[] printContent1 = null;

      String s1 = null;
      try {
        printContent1 = strToByteArray(ReceiptContent, "UTF-8");
      } catch (UnsupportedEncodingException e2) {
        // TODO Auto-generated catch block
        e2.printStackTrace();
      }
      if (LowBattery == false) {
        try {
          // mEscPos.EscPosCommandExe(ByteOrder.initUTF8);
          if (hasLogo) {
            System.out.println("QRCODE HAS LOGO Fired!! ..... ");
            mEscPos.EscPosCommandExe(ByteOrder.logo_bit_map2);
          }
          System.out.println("content print started");
          if (QRCodeData != "" || QRCodeData != null) {
            System.out.println("QRCODE printing starting ..... ");
            mEscPos.EscPosCommandExe(ByteOrder.initUTF8);
            mEscPos.EscPosCommandExe(printContent1);
            System.out.println("QRCODE STRING ..... "+QRCodeData);
            mEscPos.EscPosCommandExe(
              PrinterData.appendQRcode(8, 3, QRCodeData)
            );
            mEscPos.EscPosCommandExe(ByteOrder.walkpaper);
            //mEscPos.EscPosCommandExe(ByteOrder.printing_qrcode);
            System.out.println("QRCODE printing ended ..... ");
          } else {
            mEscPos.EscPosCommandExe(printContent1);
          }

          System.out.println("content print finished");

          if (hasBarcode) {
            mEscPos.EscPosCommandExe(ByteOrder.printing_testbarcode);
          }

          System.out.println("Before QRCODE printing start ..... ");

          mEscPos.EscPosCommandExe(ByteOrder.walkpaper);
        } catch (Exception e) {
          e.printStackTrace();
          Log.d(TAG, "Exception error =" + e);
          s1 = e.toString();
          System.out.println("Print exception error  = " + s1);
        }
      }
      return s1;
    }
  }

  public class PrintBarcode extends AsyncTask<Void, Void, String> {

    @Override
    protected void onPreExecute() {
      if (LowBattery == false) {
        Toast
          .makeText(
            webView.getContext(),
            "Printing Barcode... ",
            Toast.LENGTH_LONG
          )
          .show();
      }
    }

    @Override
    protected String doInBackground(Void... params) {
      byte[] printBarcodeContent = null;
      String s1 = null;
      try {
        printBarcodeContent = strToByteArray(BarcodeData, "UTF-8");
      } catch (UnsupportedEncodingException e2) {
        // TODO Auto-generated catch block
        e2.printStackTrace();
      }
      if (LowBattery == false) {
        try {
          mEscPos.EscPosCommandExe(printBarcodeContent);
        } catch (Exception e) {
          e.printStackTrace();
          Log.d(TAG, "Exception error =" + e);
          s1 = e.toString();
        }
      }
      return s1;
    }
  }

  public class PrintQRCode extends AsyncTask<Void, Void, String> {

    @Override
    protected void onPreExecute() {
      if (LowBattery == false) {
        Toast
          .makeText(
            webView.getContext(),
            "Printing QRCode... ",
            Toast.LENGTH_LONG
          )
          .show();
      }
    }

    @Override
    protected String doInBackground(Void... params) {
      byte[] printQRCodeContent = null;
      String s1 = null;
      try {
        printQRCodeContent = strToByteArray(QRCodeData, "UTF-8");
      } catch (UnsupportedEncodingException e2) {
        // TODO Auto-generated catch block
        e2.printStackTrace();
      }
      if (LowBattery == false) {
        try {
          mEscPos.EscPosCommandExe(printQRCodeContent);
        } catch (Exception e) {
          e.printStackTrace();
          Log.d(TAG, "Exception error =" + e);
          s1 = e.toString();
        }
      }
      return s1;
    }
  }

  public class PrinterAllDemoTask extends AsyncTask<Void, Void, String> {

    @Override
    protected void onPreExecute() {
      if (LowBattery == false) {
        Toast
          .makeText(
            webView.getContext(),
            "Printing Please Wait... ",
            Toast.LENGTH_LONG
          )
          .show();
      }
    }

    @Override
    protected String doInBackground(Void... params) {
      byte[] printContent1 = null;
      String s1 = null;
      try {
        printContent1 = strToByteArray(Order.printContent1, "UTF-8");
      } catch (UnsupportedEncodingException e2) {
        // TODO Auto-generated catch block
        e2.printStackTrace();
      }
      if (LowBattery == false) {
        try {
          System.out.println("Print instance  = " + mEscPos);
          mEscPos.EscPosCommandExe(ByteOrder.initUTF8);
          mEscPos.EscPosCommandExe(printContent1);
          mEscPos.EscPosCommandExe(ByteOrder.walkpaper);
          mEscPos.EscPosCommandExe(ByteOrder.printing_testbarcode);
          mEscPos.EscPosCommandExe(ByteOrder.printing_qrcode);
          mEscPos.EscPosCommandExe(ByteOrder.logo_bit_map2);
        } catch (Exception e) {
          e.printStackTrace();
          Log.d(TAG, "Exception error =" + e);
          s1 = e.toString();
        }
      }
      return s1;
    }
  }

  public static byte[] strToByteArray(String str) {
    if (str == null) {
      return null;
    }
    byte[] byteArray = str.getBytes();
    return byteArray;
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

  public static String checkEncoding(String str) {
    if (str == null) {
      return null;
    }
    String encodestr = null;
    if (str.equals("1B7430")) {
      encodestr = "UTF-8";
    } else if (str.equals("1B7431")) {
      encodestr = "GB2312";
    } else if (str.equals("1B7412")) {
      encodestr = "IBM852";
    } else if (str.equals("1B7417")) {
      encodestr = "ISO-8859-1";
    } else {
      encodestr = "UTF-8";
    }
    return encodestr;
  }

  public void printerStatusStopListener() {
    final PrinterStatusReceiver receiver = printerStatusReceiver;
    receiver.stopReceiving();
    // context.unregisterReceiver(printReceive);
  }
}
