import { Capacitor, registerPlugin } from '@capacitor/core';

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

const noopStub: WearSyncPlugin = {
  isAvailable: async () => ({ available: false }),
  addListener: async () => ({ remove: () => {} }),
  removeAllListeners: async () => {},
};

const WearSync: WearSyncPlugin = Capacitor.isNativePlatform()
  ? registerPlugin<WearSyncPlugin>('WearSync')
  : noopStub;

export default WearSync;
