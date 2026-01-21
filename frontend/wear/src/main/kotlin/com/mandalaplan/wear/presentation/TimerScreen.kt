package com.mandalaplan.wear.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.wear.compose.material.*

@Composable
fun TimerScreen(
    viewModel: TimerViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxSize()
        ) {
            // Timer Display
            Text(
                text = formatTime(uiState.elapsedMillis),
                fontSize = 40.sp,
                color = Color.White,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Status Text
            Text(
                text = when {
                    uiState.syncStatus != null -> uiState.syncStatus!!
                    uiState.timerState == TimerState.RUNNING -> "Running..."
                    uiState.timerState == TimerState.PAUSED -> "Paused"
                    else -> "Tap to start"
                },
                fontSize = 12.sp,
                color = Color.Gray,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Buttons
            Row(
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Start/Pause Button
                Button(
                    onClick = { viewModel.toggleTimer() },
                    colors = ButtonDefaults.buttonColors(
                        backgroundColor = if (uiState.timerState == TimerState.RUNNING)
                            Color(0xFFFF9800) else Color(0xFF4CAF50)
                    ),
                    modifier = Modifier.size(52.dp)
                ) {
                    Text(
                        text = if (uiState.timerState == TimerState.RUNNING) "❚❚" else "▶",
                        fontSize = 18.sp
                    )
                }

                // Stop Button (visible when timer is active)
                if (uiState.timerState != TimerState.IDLE) {
                    Spacer(modifier = Modifier.width(12.dp))

                    Button(
                        onClick = { viewModel.stopAndSave() },
                        colors = ButtonDefaults.buttonColors(
                            backgroundColor = Color(0xFFF44336)
                        ),
                        modifier = Modifier.size(52.dp)
                    ) {
                        Text(
                            text = "■",
                            fontSize = 18.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Connection Status
            Text(
                text = if (uiState.isPhoneConnected) "📱 Connected" else "📱 Not found",
                fontSize = 10.sp,
                color = if (uiState.isPhoneConnected) Color(0xFF4CAF50) else Color(0xFFF44336),
                textAlign = TextAlign.Center
            )
        }
    }
}

private fun formatTime(millis: Long): String {
    val totalSeconds = millis / 1000
    val hours = totalSeconds / 3600
    val minutes = (totalSeconds % 3600) / 60
    val seconds = totalSeconds % 60

    return if (hours > 0) {
        String.format("%d:%02d:%02d", hours, minutes, seconds)
    } else {
        String.format("%02d:%02d", minutes, seconds)
    }
}
