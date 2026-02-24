package com.mandalaplan.wear.data

data class TimerSession(
    val title: String? = null,
    val startTimeMillis: Long,
    val endTimeMillis: Long,
    val durationMinutes: Int,
    val taskId: String? = null
)
