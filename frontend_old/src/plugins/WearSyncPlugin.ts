import { registerPlugin } from '@capacitor/core';

export interface WearTimerSession {
  title?: string;
  startTimeMillis: number;
  endTimeMillis: number;
  durationMinutes: number;
  taskId?: string;
}

export interface WearSyncPlugin {
  isAvailable(): Promise<{ available: boolean }>;
  addListener(
    eventName: 'timerSessionReceived',
    listenerFunc: (session: WearTimerSession) => void
  ): Promise<{ remove: () => void }>;
  removeAllListeners(): Promise<void>;
}

const WearSync = registerPlugin<WearSyncPlugin>('WearSync');

export default WearSync;
