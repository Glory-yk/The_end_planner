package com.mandalaplan.app.wearable;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Capacitor plugin that bridges Wear OS timer session data to the web app.
 * Listens for broadcasts from WearableDataService and emits events to JavaScript.
 */
@CapacitorPlugin(name = "WearSync")
public class WearSyncPlugin extends Plugin {
    private static final String TAG = "WearSyncPlugin";
    private static final String EVENT_TIMER_SESSION = "timerSessionReceived";

    private BroadcastReceiver timerReceiver;

    @Override
    public void load() {
        super.load();
        registerTimerReceiver();
        Log.d(TAG, "WearSync plugin loaded");
    }

    private void registerTimerReceiver() {
        timerReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String sessionJson = intent.getStringExtra(WearableDataService.EXTRA_SESSION_JSON);
                if (sessionJson != null) {
                    try {
                        JSONObject jsonObject = new JSONObject(sessionJson);
                        JSObject data = new JSObject();

                        if (jsonObject.has("title")) {
                            data.put("title", jsonObject.optString("title", null));
                        }
                        data.put("startTimeMillis", jsonObject.getLong("startTimeMillis"));
                        data.put("endTimeMillis", jsonObject.getLong("endTimeMillis"));
                        data.put("durationMinutes", jsonObject.getInt("durationMinutes"));
                        if (jsonObject.has("taskId")) {
                            data.put("taskId", jsonObject.optString("taskId", null));
                        }

                        notifyListeners(EVENT_TIMER_SESSION, data);
                        Log.d(TAG, "Timer session event emitted to JS");
                    } catch (JSONException e) {
                        Log.e(TAG, "Error parsing session JSON", e);
                    }
                }
            }
        };

        IntentFilter filter = new IntentFilter(WearableDataService.ACTION_TIMER_SESSION);
        LocalBroadcastManager.getInstance(getContext()).registerReceiver(timerReceiver, filter);
    }

    @Override
    protected void handleOnDestroy() {
        if (timerReceiver != null) {
            LocalBroadcastManager.getInstance(getContext()).unregisterReceiver(timerReceiver);
        }
        super.handleOnDestroy();
    }

    /**
     * Check if Wear OS connectivity is available
     */
    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("available", true);
        call.resolve(ret);
    }
}
