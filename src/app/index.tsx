import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { format } from '@/engine/big-number';
import { useGame } from '@/hooks/game-loop-context';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const {
    state,
    canTap,
    tap,
    generatorCost,
    canBuyGenerator,
    buyGenerator,
    effectiveGenerationRate,
    prestigeMultiplier,
    prestigeProgress,
    canPrestige,
    prestige,
    isBoostActive,
    boostRemainingSeconds,
  } = useGame();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.value}>
          {format(state.value)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {format(effectiveGenerationRate)}/s · x{prestigeMultiplier.toFixed(2)}
        </ThemedText>
        {isBoostActive && (
          <ThemedText type="smallBold">Boost x3 — {boostRemainingSeconds}s</ThemedText>
        )}

        <Pressable
          onPress={tap}
          disabled={!canTap}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.backgroundElement },
            !canTap && styles.buttonDisabled,
            pressed && canTap && styles.buttonPressed,
          ]}>
          <ThemedText type="smallBold">Tap</ThemedText>
        </Pressable>

        <Pressable
          onPress={buyGenerator}
          disabled={!canBuyGenerator}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.backgroundElement },
            !canBuyGenerator && styles.buttonDisabled,
            pressed && canBuyGenerator && styles.buttonPressed,
          ]}>
          <ThemedText type="smallBold">Générateur (+1/s) — {format(generatorCost)}</ThemedText>
        </Pressable>

        <Pressable
          onPress={prestige}
          disabled={!canPrestige}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.backgroundElement },
            !canPrestige && styles.buttonDisabled,
            pressed && canPrestige && styles.buttonPressed,
          ]}>
          <ThemedText type="smallBold">
            {canPrestige ? 'Cycle' : `Cycle — ${Math.floor(prestigeProgress * 100)}%`}
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  value: {
    fontVariant: ['tabular-nums'],
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
