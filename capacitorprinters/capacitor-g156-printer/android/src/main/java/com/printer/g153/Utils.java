package com.printer.g153;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import java.util.List;

public class Utils {

  public static final String KEY_ALIGN = "key_attributes_align";
  public static final String KEY_TEXTSIZE = "key_attributes_textsize";
  public static final String KEY_TYPEFACE = "key_attributes_typeface";
  public static final String KEY_MARGINLEFT = "key_attributes_marginleft";
  public static final String KEY_MARGINRIGHT = "key_attributes_marginright";
  public static final String KEY_MARGINTOP = "key_attributes_margintop";
  public static final String KEY_MARGINBOTTOM = "key_attributes_marginbottom";
  public static final String KEY_LINESPACE = "key_attributes_linespace";
  public static final String KEY_WEIGHT = "key_attributes_weight";

  public static byte[] byteMergeAll(byte[]... value) {
    int lengthByte = 0;
    for (int i = 0; i < value.length; i++) {
      lengthByte += value[i].length;
    }
    byte[] allByte = new byte[lengthByte];
    int countLength = 0;
    for (int i = 0; i < value.length; i++) {
      byte[] b = value[i];
      System.arraycopy(b, 0, allByte, countLength, b.length);
      countLength += b.length;
    }
    return allByte;
  }

  public static byte[] byteStringTobyte(String bstr) {
    String[] sa = bstr.substring(1, bstr.length() - 1).split(", ");
    byte[] barr = new byte[sa.length];
    try {
      for (int i = 0; i < barr.length; i++) {
        barr[i] = Byte.parseByte(sa[i]);
      }
    } catch (Exception e) {
      return null;
    }
    return barr;
  }

  public static int getModelType(
    Context context,
    String package1,
    String package2
  ) {
    PackageManager packageManager = context.getPackageManager();
    List<PackageInfo> packageInfos = packageManager.getInstalledPackages(0);
    if (packageInfos != null) {
      for (int i = 0; i < packageInfos.size(); i++) {
        String packName = packageInfos.get(i).packageName;
        if (package1.equals(packName)) {
          return 1;
        } else if (package2.equals(packName)) {
          return 2;
        }
      }
    }
    return 0;
  }
}
