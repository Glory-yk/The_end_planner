package com.mandalaplan.app.wearable;

/**
 * Data class representing a timer session from Wear OS
 */
public class TimerSession {
    private String title;
    private long startTimeMillis;
    private long endTimeMillis;
    private int durationMinutes;
    private String taskId;

    public TimerSession() {}

    public TimerSession(String title, long startTimeMillis, long endTimeMillis, int durationMinutes, String taskId) {
        this.title = title;
        this.startTimeMillis = startTimeMillis;
        this.endTimeMillis = endTimeMillis;
        this.durationMinutes = durationMinutes;
        this.taskId = taskId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public long getStartTimeMillis() {
        return startTimeMillis;
    }

    public void setStartTimeMillis(long startTimeMillis) {
        this.startTimeMillis = startTimeMillis;
    }

    public long getEndTimeMillis() {
        return endTimeMillis;
    }

    public void setEndTimeMillis(long endTimeMillis) {
        this.endTimeMillis = endTimeMillis;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }
}
