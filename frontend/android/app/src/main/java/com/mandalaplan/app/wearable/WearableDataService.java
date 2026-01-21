package com.mandalaplan.app.wearable;

import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.google.android.gms.wearable.MessageEvent;
import com.google.android.gms.wearable.WearableListenerService;
import com.google.gson.Gson;

/**
 * Service that listens for messages from Wear OS devices.
 * When a timer session is received from the watch, it broadcasts the data
 * to the Capacitor plugin which forwards it to the web app.
 */
public class WearableDataService extends WearableListenerService {
    private static final String TAG = "WearableDataService";

    // Path must match what Wear OS app sends
    public static final String PATH_TIMER_SYNC = "/mandalaplan/timer-sync";

    // Broadcast action for timer session received
    public static final String ACTION_TIMER_SESSION = "com.mandalaplan.app.TIMER_SESSION";
    public static final String EXTRA_SESSION_JSON = "session_json";

    private final Gson gson = new Gson();

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "WearableDataService created");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "WearableDataService destroyed");
    }

    @Override
    public void onMessageReceived(@NonNull MessageEvent messageEvent) {
        Log.d(TAG, "=== MESSAGE RECEIVED ===");
        Log.d(TAG, "Path: " + messageEvent.getPath());
        Log.d(TAG, "Source Node: " + messageEvent.getSourceNodeId());

        // Accept any path starting with /mandalaplan
        if (messageEvent.getPath().startsWith("/mandalaplan")) {
            try {
                String json = new String(messageEvent.getData());
                Log.d(TAG, "Timer session received: " + json);

                // Validate JSON by parsing
                TimerSession session = gson.fromJson(json, TimerSession.class);
                if (session != null) {
                    Log.d(TAG, "Session parsed successfully - duration: " + session.getDurationMinutes() + " minutes");
                    // Broadcast to app
                    broadcastTimerSession(json);
                } else {
                    Log.e(TAG, "Session parsed as null");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error parsing timer session", e);
            }
        } else {
            Log.d(TAG, "Ignoring message with path: " + messageEvent.getPath());
        }
    }

    private void broadcastTimerSession(String sessionJson) {
        Intent intent = new Intent(ACTION_TIMER_SESSION);
        intent.putExtra(EXTRA_SESSION_JSON, sessionJson);
        LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
        Log.d(TAG, "Timer session broadcasted to app");
    }
}
