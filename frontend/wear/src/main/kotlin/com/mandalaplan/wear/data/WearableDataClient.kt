package com.mandalaplan.wear.data

import android.content.Context
import android.util.Log
import com.google.android.gms.wearable.CapabilityClient
import com.google.android.gms.wearable.Wearable
import com.google.gson.Gson
import kotlinx.coroutines.tasks.await

class WearableDataClient(private val context: Context) {

    companion object {
        private const val TAG = "WearableDataClient"
        private const val CAPABILITY_PHONE_APP = "mandalaplan_mobile_app"
        private const val PATH_TIMER_SYNC = "/mandalaplan/timer-sync"
    }

    private val gson = Gson()

    suspend fun sendTimerSession(session: TimerSession): Boolean {
        return try {
            val nodes = findReachableNodes()

            if (nodes.isEmpty()) {
                Log.w(TAG, "No connected phone found")
                return false
            }

            val json = gson.toJson(session)
            val data = json.toByteArray()

            Log.d(TAG, "Sending timer session: $json")

            val messageClient = Wearable.getMessageClient(context)
            nodes.forEach { nodeId ->
                try {
                    messageClient.sendMessage(nodeId, PATH_TIMER_SYNC, data).await()
                    Log.d(TAG, "Message sent to node: $nodeId")
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to send to node: $nodeId", e)
                }
            }

            true
        } catch (e: Exception) {
            Log.e(TAG, "Error sending timer session", e)
            false
        }
    }

    private suspend fun findReachableNodes(): Set<String> {
        val nodes = mutableSetOf<String>()

        try {
            val capabilityInfo = Wearable.getCapabilityClient(context)
                .getCapability(CAPABILITY_PHONE_APP, CapabilityClient.FILTER_REACHABLE)
                .await()

            capabilityInfo.nodes.forEach { nodes.add(it.id) }
        } catch (e: Exception) {
            Log.w(TAG, "Capability check failed", e)
        }

        if (nodes.isEmpty()) {
            try {
                val connectedNodes = Wearable.getNodeClient(context).connectedNodes.await()
                connectedNodes.forEach { nodes.add(it.id) }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to get connected nodes", e)
            }
        }

        Log.d(TAG, "Found ${nodes.size} reachable nodes")
        return nodes
    }

    suspend fun isPhoneConnected(): Boolean {
        return try {
            findReachableNodes().isNotEmpty()
        } catch (e: Exception) {
            false
        }
    }
}
