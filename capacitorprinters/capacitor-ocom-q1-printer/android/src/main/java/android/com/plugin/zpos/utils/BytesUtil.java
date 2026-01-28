package android.com.plugin.zpos.utils;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.Matrix;
import android.graphics.Paint;
import java.util.Random;
import java.io.ByteArrayOutputStream;

public class BytesUtil {
    private static final String TAG             = "BytesUtil";
    private static final int    MATRIX_DATA_ROW = 384;
    private static final int    BYTE_BIT        = 8;
    private static final int    BYTE_PER_LINE   = 48;

    private static Random random = new Random();

    // NOTE: full implementation copied from Cordova plugin; truncated here for brevity.
}
