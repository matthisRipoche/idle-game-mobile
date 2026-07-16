import * as Haptics from 'expo-haptics';

export function triggerTapHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
