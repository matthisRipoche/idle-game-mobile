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
    maxAffordableGeneratorLevels,
    buyMaxGenerator,
    multiplierCost,
    canBuyMultiplier,
    buyMultiplier,
    maxAffordableMultiplierLevels,
    buyMaxMultiplier,
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

        <ThemedView style={styles.purchaseRow}>
          <Pressable
            onPress={buyGenerator}
            disabled={!canBuyGenerator}
            style={({ pressed }) => [
              styles.button,
              styles.mainPurchaseButton,
              { backgroundColor: theme.backgroundElement },
              !canBuyGenerator && styles.buttonDisabled,
              pressed && canBuyGenerator && styles.buttonPressed,
            ]}>
            <ThemedText type="smallBold">Générateur (+1/s) — {format(generatorCost)}</ThemedText>
          </Pressable>

          <Pressable
            onPress={buyMaxGenerator}
            disabled={maxAffordableGeneratorLevels <= 0}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.backgroundElement },
              maxAffordableGeneratorLevels <= 0 && styles.buttonDisabled,
              pressed && maxAffordableGeneratorLevels > 0 && styles.buttonPressed,
            ]}>
            <ThemedText type="smallBold">Max x{maxAffordableGeneratorLevels}</ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.purchaseRow}>
          <Pressable
            onPress={buyMultiplier}
            disabled={!canBuyMultiplier}
            style={({ pressed }) => [
              styles.button,
              styles.mainPurchaseButton,
              { backgroundColor: theme.backgroundElement },
              !canBuyMultiplier && styles.buttonDisabled,
              pressed && canBuyMultiplier && styles.buttonPressed,
            ]}>
            <ThemedText type="smallBold">Multiplicateur (x1.5) — {format(multiplierCost)}</ThemedText>
          </Pressable>

          <Pressable
            onPress={buyMaxMultiplier}
            disabled={maxAffordableMultiplierLevels <= 0}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.backgroundElement },
              maxAffordableMultiplierLevels <= 0 && styles.buttonDisabled,
              pressed && maxAffordableMultiplierLevels > 0 && styles.buttonPressed,
            ]}>
            <ThemedText type="smallBold">Max x{maxAffordableMultiplierLevels}</ThemedText>
          </Pressable>
        </ThemedView>

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
  purchaseRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  button: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
    marginTop: Spacing.three,
  },
  mainPurchaseButton: {
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
