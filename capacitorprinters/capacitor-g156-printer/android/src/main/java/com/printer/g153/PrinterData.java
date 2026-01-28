package com.printer.g153;

import android.graphics.Bitmap;
import android.text.TextUtils;
import android.util.Log;
import java.io.CharArrayWriter;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

public class PrinterData {

  private static final String TAG = "PrinterData";
  public static final String HORIZONTAL_TAB = "HORIZONTAL_TAB";
  public static final String UNDERLINE = "UNDERLINE";
  public static final String BOLD = "BOLD";
  public static final String DOUBLE_PRINT = "DOUBLE_PRINT";
  public static final String ALIGN_POSITION = "ALIGN_POSITION";
  public static final String REVERSE_MODE = "REVERSE_MODE";
  public static final String HRI_POSITION = "HRI_POSITION";
  public static final String ERROR_CORRECTION_LEVEL = "ERROR_CORRECTION_LEVEL";

  public static byte[] horizontal_tab = new byte[] { 9 };
  public static byte[] line_feed = new byte[] { 27, 74, 100 };
  public static byte[] full_cut_paper = new byte[] { 0x1d, 0x56, 0x41, 0x00 };
  public static byte[] half_cut_paper = new byte[] { 0x1d, 0x56, 0x42, 0x00 };

  public static byte[] setRightSpacing(int n) {
    return new byte[] { 27, 32, (byte) n };
  }

  public static byte[] setPrintMode(int n) {
    return new byte[] { 27, 33, (byte) n };
  }

  public static byte[] setAbsolutePosition(int nL, int nH) {
    return new byte[] { 27, 36, (byte) nL, (byte) nH };
  }

  public static byte[] switchUnderline(boolean onOff) {
    if (onOff) {
      return new byte[] { 27, 45, 1 };
    } else {
      return new byte[] { 27, 45, 0 };
    }
  }

  public static byte[] default_line_spacing = new byte[] { 27, 50 };

  public static byte[] setLineSpacing(int n) {
    return new byte[] { 27, 51, (byte) n };
  }

  public static byte[] initial_printer = new byte[] { 27, 64 };

  public static byte[] setHorizontalPositionTab(int... position) {
    byte[] result = new byte[3 + position.length];
    result[0] = 27;
    result[1] = 68;
    for (int i = 0; i < position.length; i++) {
      result[2 + i] = (byte) position[i];
    }
    result[result.length - 1] = 0;
    return result;
  }

  public static byte[] isTextBold(boolean bold) {
    if (bold) {
      return new byte[] { 27, 69, 1 };
    } else {
      return new byte[] { 27, 69, 0 };
    }
  }

  public static byte[] doublePrint(boolean twicePrint) {
    if (twicePrint) {
      return new byte[] { 27, 71, 1 };
    } else {
      return new byte[] { 27, 71, 0 };
    }
  }

  public static byte[] printAndLineFeed = new byte[] { 10 };

  public static byte[] selectCharacterFont = new byte[] { 28, 38 };

  public static byte[] selectInternationalCharacter(int n) {
    return new byte[] { 31, 27, 31, (byte) 253, (byte) n };
  }

  public static byte[] setRelativePosition(int nL, int nH) {
    return new byte[] { 27, 92, (byte) nL, (byte) nH };
  }

  public static byte[] LEFT_ALIGN = new byte[] { 27, 97, 0 };
  public static byte[] CENTER_ALIGN = new byte[] { 0x1B, 0x61, 0x01 };
  public static byte[] RIGHT_ALIGN = new byte[] { 27, 97, 2 };

  public static byte[] printAndFeedN(int n) {
    return new byte[] { 27, 100, (byte) n };
  }

  public static byte[] setTextSize(int size) {
    return new byte[] { 29, 33, (byte) size };
  }

  public static byte[] reversePrint(boolean reverse) {
    if (reverse) {
      return new byte[] { 29, 66, 1 };
    } else {
      return new byte[] { 29, 66, 0 };
    }
  }

  public static byte[] selectHriPrintPosition(int n) {
    return new byte[] { 29, 72, (byte) n };
  }

  public static byte[] setLeftMargin(int nL, int nH) {
    return new byte[] { 29, 76, (byte) nL, (byte) nH };
  }

  public static byte[] setRegionWidth(int nL, int nH) {
    return new byte[] { 29, 87, (byte) nL, (byte) nH };
  }

  public static byte[] setBarCodeHeight(int n) {
    return new byte[] { 29, 104, (byte) n };
  }

  public static byte[] printBarCode(String str, int n) {
    byte[] strBytes = str.getBytes();
    byte[] result = new byte[4 + strBytes.length];
    result[0] = 29;
    result[1] = 107;
    result[2] = 73;
    result[3] = (byte) strBytes.length;
    for (int i = 0; i < strBytes.length; i++) {
      result[i + 4] = strBytes[i];
    }
    return Utils.byteMergeAll(
      initial_printer,
      selectHriPrintPosition(n),
      result,
      line_feed
    );
  }

  public static byte[] setBarCodeWidth(int n) {
    return new byte[] { 29, 119, (byte) n };
  }

  public static byte[] setQrcodeSize(int n) {
    return new byte[] { 29, 40, 107, 3, 0, 49, 67, (byte) n };
  }

  public static byte[] setErrorLevelForQrcode(int n) {
    return new byte[] { 29, 40, 107, 3, 0, 49, 69, (byte) n };
  }

  public static byte[] appendQRcode(
    int module_size,
    int ec_level,
    String text
  ) {
    byte[] content;
    int text_length;
    System.out.println("QR 1 ");
    try {
      content = text.getBytes("UTF-8");
    } catch (UnsupportedEncodingException e) {
      System.out.println("QR 2 " + e.toString());
      return null;
    }

    text_length = content.length;

    if (text_length == 0) return null;
    if (text_length > 65535) text_length = 65535;
    if (module_size < 1) module_size = 1; else if (
      module_size > 8
    ) module_size = 8;
    if (ec_level < 0) ec_level = 0; else if (ec_level > 3) ec_level = 3;
    System.out.println("QR 3 ");
    CharArrayWriter orderContent = new CharArrayWriter();
    System.out.println("QR 4 ");
    orderContent.append("1d286b040031410000");
    orderContent.append("1d286b03003143" + String.format("%02x", module_size));
    orderContent.append(
      "1d286b03003145" + String.format("%02x", ec_level + 48)
    );
    orderContent.append(
      "1d286b" +
      String.format(
        "%02x%02x315030",
        ((text_length + 3) & 0xff),
        (((text_length + 3) >> 8) & 0xff)
      )
    );
    System.out.println("QR 5 ");
    for (int i = 0; i < text_length; i++) orderContent.append(
      String.format("%02x", content[i])
    );
    orderContent.append("1d286b0300315130");
    System.out.println("QR 5 ");
    return hexStringToBytes(orderContent.toString());
  }

  public static byte[] printQrCode(String str, byte[] extraOrder) {
    int storeLen = str.length() + 3;
    byte storePl = (byte) (storeLen % 256);
    byte storePh = (byte) (storeLen / 256);
    byte[] storeqr = { 29, 40, 107, storePl, storePh, 49, 80, 48 };
    byte[] printqr = { 29, 40, 107, 3, 0, 49, 81, 48 };
    if (extraOrder == null) {
      return Utils.byteMergeAll(
        initial_printer,
        storeqr,
        str.getBytes(),
        printqr,
        line_feed
      );
    } else {
      return Utils.byteMergeAll(
        initial_printer,
        extraOrder,
        storeqr,
        str.getBytes(),
        printqr,
        line_feed
      );
    }
  }

  public static byte[] setPrintDensity(int n) {
    return new byte[] { 29, 40, 75, 2, 0, 49, (byte) n };
  }

  public static byte[] printTest1Text(byte[] newOrder) {
    byte[] initialOrder;
    if (newOrder == null) {
      initialOrder = initial_printer;
    } else {
      initialOrder = Utils.byteMergeAll(initial_printer, newOrder);
    }
    return initialOrder;
  }

  public static byte[] paperFeed() {
    return Utils.byteMergeAll(initial_printer, line_feed, line_feed);
  }

  public static byte[] printBitmap(Bitmap bitmap) {
    byte[] data = decodeBitmap(bitmap);
    if (data == null) {
      return null;
    } else {
      return Utils.byteMergeAll(initial_printer, data);
    }
  }

  public static byte[] raster(Bitmap bitmap) {
    int xL = bitmap.getWidth() % 256;
    int xH = bitmap.getWidth() / 256;
    int yL = bitmap.getHeight() % 256;
    int yH = bitmap.getHeight() / 256;
    byte[] data = decodeBitmap(bitmap);
    byte[] result = {
      29,
      118,
      48,
      0,
      (byte) xL,
      (byte) xH,
      (byte) yL,
      (byte) yH,
    };
    return Utils.byteMergeAll(initial_printer, result, data);
  }

  public static byte[] decodeBitmap(Bitmap bmp) {
    int bmpWidth = bmp.getWidth();
    int bmpHeight = bmp.getHeight();

    List<String> list = new ArrayList<String>();
    StringBuffer sb;

    int bitLen = bmpWidth / 8;
    int zeroCount = bmpWidth % 8;

    StringBuffer zeroStr = new StringBuffer();
    if (zeroCount > 0) {
      bitLen = bmpWidth / 8 + 1;
      for (int i = 0; i < (8 - zeroCount); i++) {
        zeroStr.append("0");
      }
    }

    for (int i = 0; i < bmpHeight; i++) {
      sb = new StringBuffer();
      for (int j = 0; j < bmpWidth; j++) {
        int color = bmp.getPixel(j, i);
        int red = (color & 0x00ff0000) >> 16;
        int green = (color & 0x0000ff00) >> 8;
        int blue = color & 0x000000ff;
        if (red > 160 && green > 160 && blue > 160) {
          sb.append("0");
        } else {
          sb.append("1");
        }
      }
      if (zeroCount > 0) {
        sb.append(zeroStr);
      }
      list.add(sb.toString());
    }

    List<String> bmpHexList = binaryListToHexStringList(list);
    if (bmpHexList == null) {
      return null;
    }

    String commandHexString =
      "1D763000" + Integer.toHexString(bitLen % 256) +
      Integer.toHexString(bitLen / 256) +
      Integer.toHexString(bmpHeight % 256) +
      Integer.toHexString(bmpHeight / 256);

    List<String> commandList = new ArrayList<String>();
    commandList.add(commandHexString);
    commandList.addAll(bmpHexList);

    return hexList2Byte(commandList);
  }

  public static List<String> binaryListToHexStringList(List<String> list) {
    if (list == null || list.size() == 0) {
      return null;
    }
    List<String> hexList = new ArrayList<String>();
    for (String binaryStr : list) {
      StringBuffer sb = new StringBuffer();
      for (int i = 0; i < binaryStr.length(); i += 8) {
        String str = binaryStr.substring(i, i + 8);
        String hexString = myBinaryStrToHexString(str);
        if (hexString == null) {
          return null;
        }
        sb.append(hexString);
      }
      hexList.add(sb.toString());
    }
    return hexList;
  }

  public static String myBinaryStrToHexString(String binaryStr) {
    if (TextUtils.isEmpty(binaryStr)) {
      return null;
    }
    StringBuffer hex = new StringBuffer();
    try {
      int decimal = Integer.parseInt(binaryStr, 2);
      String hexStr = Integer.toHexString(decimal);
      if (hexStr.length() == 1) {
        hex.append("0");
      }
      hex.append(hexStr);
    } catch (NumberFormatException e) {
      e.printStackTrace();
      return null;
    }
    return hex.toString();
  }

  public static byte[] hexList2Byte(List<String> list) {
    if (list == null || list.size() == 0) {
      return null;
    }
    List<byte[]> commandList = new ArrayList<>();
    int len = 0;
    for (String hexStr : list) {
      byte[] command = hexStringToBytes(hexStr);
      if (command != null) {
        commandList.add(command);
        len += command.length;
      }
    }
    byte[] result = new byte[len];
    int index = 0;
    for (byte[] command : commandList) {
      for (byte b : command) {
        result[index++] = b;
      }
    }
    return result;
  }

  public static byte[] hexStringToBytes(String hexString) {
    if (TextUtils.isEmpty(hexString)) {
      return null;
    }
    hexString = hexString.toUpperCase();
    int length = hexString.length() / 2;
    char[] hexChars = hexString.toCharArray();
    byte[] d = new byte[length];
    for (int i = 0; i < length; i++) {
      int pos = i * 2;
      d[i] =
        (byte) (
          (charToByte(hexChars[pos]) << 4) |
          charToByte(hexChars[pos + 1])
        );
    }
    return d;
  }

  private static int charToByte(char c) {
    return "0123456789ABCDEF".indexOf(c);
  }
}
