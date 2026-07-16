import * as Haptics from 'expo-haptics';

export function triggerTapHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function triggerPurchaseHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function triggerPrestigeHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function triggerBoostHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}
