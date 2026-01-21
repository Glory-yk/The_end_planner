package com.mandalaplan.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.mandalaplan.app.wearable.WearSyncPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WearSyncPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
