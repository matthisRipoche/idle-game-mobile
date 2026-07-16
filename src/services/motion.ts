import { Accelerometer } from 'expo-sensors';

const SHAKE_THRESHOLD = 1.8;
const UPDATE_INTERVAL_MS = 100;

export function subscribeToShake(onShake: () => void): () => void {
  Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);

  const subscription = Accelerometer.addListener(({ x, y, z }) => {
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    if (magnitude > SHAKE_THRESHOLD) {
      onShake();
    }
  });

  return () => subscription.remove();
}
