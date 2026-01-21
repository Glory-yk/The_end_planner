package com.mandalaplan.wear.presentation

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.mandalaplan.wear.data.TimerSession
import com.mandalaplan.wear.data.WearableDataClient
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

enum class TimerState {
    IDLE, RUNNING, PAUSED
}

data class TimerUiState(
    val timerState: TimerState = TimerState.IDLE,
    val elapsedMillis: Long = 0L,
    val isPhoneConnected: Boolean = false,
    val syncStatus: String? = null
)

class TimerViewModel(application: Application) : AndroidViewModel(application) {

    private val wearableClient = WearableDataClient(application)

    private val _uiState = MutableStateFlow(TimerUiState())
    val uiState: StateFlow<TimerUiState> = _uiState.asStateFlow()

    private var timerJob: Job? = null
    private var startTimeMillis: Long = 0L
    private var pausedElapsedMillis: Long = 0L

    init {
        checkPhoneConnection()
    }

    fun checkPhoneConnection() {
        viewModelScope.launch {
            val connected = wearableClient.isPhoneConnected()
            _uiState.value = _uiState.value.copy(isPhoneConnected = connected)
        }
    }

    fun startTimer() {
        if (_uiState.value.timerState == TimerState.RUNNING) return

        startTimeMillis = System.currentTimeMillis()
        _uiState.value = _uiState.value.copy(
            timerState = TimerState.RUNNING,
            syncStatus = null
        )

        timerJob = viewModelScope.launch {
            while (true) {
                val elapsed = System.currentTimeMillis() - startTimeMillis + pausedElapsedMillis
                _uiState.value = _uiState.value.copy(elapsedMillis = elapsed)
                delay(100)
            }
        }
    }

    fun pauseTimer() {
        if (_uiState.value.timerState != TimerState.RUNNING) return

        timerJob?.cancel()
        pausedElapsedMillis = _uiState.value.elapsedMillis
        _uiState.value = _uiState.value.copy(timerState = TimerState.PAUSED)
    }

    fun toggleTimer() {
        when (_uiState.value.timerState) {
            TimerState.IDLE, TimerState.PAUSED -> startTimer()
            TimerState.RUNNING -> pauseTimer()
        }
    }

    fun stopAndSave() {
        timerJob?.cancel()

        val elapsed = _uiState.value.elapsedMillis
        val durationMinutes = (elapsed / 60000).toInt()

        if (durationMinutes < 1) {
            _uiState.value = _uiState.value.copy(
                timerState = TimerState.IDLE,
                elapsedMillis = 0L,
                syncStatus = "Too short"
            )
            pausedElapsedMillis = 0L
            return
        }

        val endTime = System.currentTimeMillis()
        val actualStartTime = endTime - elapsed

        val session = TimerSession(
            title = "Watch Timer",
            startTimeMillis = actualStartTime,
            endTimeMillis = endTime,
            durationMinutes = durationMinutes
        )

        _uiState.value = _uiState.value.copy(syncStatus = "Syncing...")

        viewModelScope.launch {
            val success = wearableClient.sendTimerSession(session)
            _uiState.value = _uiState.value.copy(
                timerState = TimerState.IDLE,
                elapsedMillis = 0L,
                syncStatus = if (success) "${durationMinutes}min saved!" else "Sync failed"
            )
            pausedElapsedMillis = 0L

            // Clear status after delay
            delay(2000)
            _uiState.value = _uiState.value.copy(syncStatus = null)
        }
    }

    fun resetTimer() {
        timerJob?.cancel()
        pausedElapsedMillis = 0L
        _uiState.value = _uiState.value.copy(
            timerState = TimerState.IDLE,
            elapsedMillis = 0L,
            syncStatus = null
        )
    }
}
