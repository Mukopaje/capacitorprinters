package android.com.plugin.zpos.utils;

import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import java.lang.ref.SoftReference;

public class HandlerUtils {

    public interface IHandlerIntent {
        void handlerIntent(Message message);
    }

    public static final class MyHandler extends Handler {
        private SoftReference<IHandlerIntent> owner;

        public MyHandler(IHandlerIntent t) {
            owner = new SoftReference<IHandlerIntent>(t);
        }

        public MyHandler(Looper looper, IHandlerIntent t) {
            super(looper);
            owner = new SoftReference<IHandlerIntent>(t);
        }

        @Override
        public void handleMessage(Message msg) {
            IHandlerIntent t = owner.get();
            if (null != t) {
                t.handlerIntent(msg);
            }
        }
    }
}
