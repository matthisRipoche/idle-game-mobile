import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { format } from '@/engine/big-number';
import { useGame } from '@/hooks/game-loop-context';
import { useTheme } from '@/hooks/use-theme';

export default function ShopScreen() {
  const { state, shakeBoostUnlockCost, canUnlockShakeBoost, unlockShakeBoost } = useGame();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">Boutique</ThemedText>

        <Pressable
          onPress={unlockShakeBoost}
          disabled={!canUnlockShakeBoost || state.isShakeBoostUnlocked}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.backgroundElement },
            (!canUnlockShakeBoost || state.isShakeBoostUnlocked) && styles.buttonDisabled,
            pressed && canUnlockShakeBoost && styles.buttonPressed,
          ]}>
          <ThemedText type="smallBold">
            {state.isShakeBoostUnlocked
              ? 'Boost secousse débloqué'
              : `Débloquer le boost secousse — ${format(shakeBoostUnlockCost)}`}
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  button: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
    marginTop: Spacing.three,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
