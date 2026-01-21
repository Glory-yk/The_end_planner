# AI Agent Guide: Android Wear OS Data Layer Sync System

**Context**: This document describes a proven architecture for syncing data between an Android Mobile App and a Wear OS App using the `Wearable Data Layer API`.
**Purpose**: Use this guide to replicate the communication engine in other projects.

---

## 1. Architecture Overview (3-Tier)

The system uses a **Shared Module** pattern to ensure data consistency.

- **`:shared`**: Contains Data Models (DTOs) and Constants.
- **`:wear` (Sender)**: Collects data and sends it to the Mobile device via `MessageClient`.
- **`:mobile` (Receiver)**: Listens for messages via `WearableListenerService` and processes them.

---

## 2. Core Implementation Code

### A. Shared Module
*Define the data structure and communication paths.*

**File**: `shared/src/.../model/WearableCommand.kt`
```kotlin
object WearableCommand {
    // Unique path identifier for the command
    const val SYNC_SESSION = "/flowtimer/sync" 
    // Add more commands here (e.g., "/health/data", "/todo/update")
}
```

**File**: `shared/src/.../model/TimerSession.kt` (Example DTO)
```kotlin
import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class TimerSession(
    val id: Long = 0,
    val startTime: Long,
    val duration: Long,
    // Add your own fields here (must be serializable)
) : Parcelable
```

**File**: `shared/src/.../util/SessionSerializer.kt`
```kotlin
import com.google.gson.Gson

object SessionSerializer {
    private val gson = Gson()
    
    // Simple JSON serialization for byte transfer
    fun toJson(session: TimerSession): String = gson.toJson(session)
    fun fromJson(json: String): TimerSession? = gson.fromJson(json, TimerSession::class.java)
}
```

---

### B. Wear OS Module (Sender)
*Responsible for finding the phone and sending data bytes.*

**File**: `wear/src/.../data/WearableDataClient.kt`
```kotlin
import com.google.android.gms.wearable.Wearable
import com.google.android.gms.wearable.CapabilityClient
import kotlinx.coroutines.tasks.await

class WearableDataClient(private val context: Context) {

    // Defined in mobile/src/main/res/values/wear.xml
    private val CAPABILITY_PHONE_APP = "flowtimer_mobile_app" 

    suspend fun sendDataToPhone(data: TimerSession): Boolean {
        try {
            // 1. Find the connected phone using CapabilityClient
            val capabilityInfo = Wearable.getCapabilityClient(context)
                .getCapability(CAPABILITY_PHONE_APP, CapabilityClient.FILTER_REACHABLE)
                .await()

            // 2. Fallback to all connected nodes if capability check fails (common in emulators)
            val nodes = capabilityInfo.nodes.toMutableSet()
            if (nodes.isEmpty()) {
                val connectedNodes = Wearable.getNodeClient(context).connectedNodes.await()
                nodes.addAll(connectedNodes)
            }

            // 3. Serialize data
            val json = SessionSerializer.toJson(data)
            val bytes = json.toByteArray()

            // 4. Send message to all found nodes
            val messageClient = Wearable.getMessageClient(context)
            nodes.forEach { node ->
                messageClient.sendMessage(
                    node.id,
                    WearableCommand.SYNC_SESSION, // Path
                    bytes
                ).await()
            }
            return true
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        }
    }
}
```

**Resource**: `wear/src/main/res/values/wear.xml`
```xml
<resources>
    <!-- Identifies this app as the Wear component -->
    <string-array name="android_wear_capabilities">
        <item>flowtimer_wear_app</item>
    </string-array>
</resources>
```

---

### C. Mobile Module (Receiver)
*A background service that wakes up when a message arrives.*

**File**: `mobile/src/.../data/wearable/WearableDataService.kt`
```kotlin
import com.google.android.gms.wearable.WearableListenerService
import com.google.android.gms.wearable.MessageEvent

// NOTE: Do not use Constructor Injection here. System instantiates this service.
// Use @AndroidEntryPoint if using Hilt, but rely on 'this' context.
class WearableDataService : WearableListenerService() {

    override fun onMessageReceived(messageEvent: MessageEvent) {
        when (messageEvent.path) {
            WearableCommand.SYNC_SESSION -> {
                // 1. Deserialize data
                val json = String(messageEvent.data)
                val data = SessionSerializer.fromJson(json)
                
                // 2. Handle data (e.g., Save to DB, Broadcast to UI)
                // Example: Repository.save(data) or sending broadcast
                data?.let { handleData(it) }
            }
        }
    }

    private fun handleData(data: TimerSession) {
        // Implement your logic here
        // Tip: Use a global listener or CoroutineScope to reach your Repository
    }
}
```

**Manifest**: `mobile/src/main/AndroidManifest.xml`
```xml
<service
    android:name=".data.wearable.WearableDataService"
    android:exported="true">
    <intent-filter>
        <!-- Crucial: Listens for MESSAGE_RECEIVED -->
        <action android:name="com.google.android.gms.wearable.MESSAGE_RECEIVED" />
        <!-- Must match the path pattern -->
        <data android:scheme="wear" android:host="*" android:pathPrefix="/flowtimer" />
    </intent-filter>
</service>
```

**Resource**: `mobile/src/main/res/values/wear.xml`
```xml
<resources>
    <!-- Target name used by Wear app to find this phone app -->
    <string-array name="android_wear_capabilities">
        <item>flowtimer_mobile_app</item>
    </string-array>
</resources>
```

---

## 3. Setup Essentials

**Gradle Dependencies** (`build.gradle.kts` in both `:mobile` and `:wear`):
```kotlin
dependencies {
    implementation(project(":shared"))
    implementation("com.google.android.gms:play-services-wearable:18.1.0")
    // For coroutines support
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.7.3")
}
```

## 4. Key Takeaways for AI Agents

1.  **Capability Matching**: The `wear.xml` files are critical. The Wear app looks for a node with the capability string defined in the Mobile app's `wear.xml`.
2.  **Path Matching**: The `pathPrefix` in `AndroidManifest.xml` must match the start of the string constant in `WearableCommand`.
3.  **Service Lifecycle**: `WearableListenerService` is started by the system. Avoid complex Dependency Injection in its constructor.
4.  **Serialization**: For simple objects, JSON conversion (String <-> Byte) is easiest and robust enough.

---
**End of Guide**
