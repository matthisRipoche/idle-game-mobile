import * as Haptics from 'expo-haptics';

export function triggerTapHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function triggerPurchaseHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}
