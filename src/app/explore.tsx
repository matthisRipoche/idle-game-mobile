import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { format } from '@/engine/big-number';
import { useGame } from '@/hooks/game-loop-context';
import { useTheme } from '@/hooks/use-theme';

export default function ShopScreen() {
  const {
    state,
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
    shakeBoostUnlockCost,
    canUnlockShakeBoost,
    unlockShakeBoost,
  } = useGame();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="subtitle">Boutique</ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.scoreReminder}>
            {format(state.value)}
          </ThemedText>

          <ThemedView style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Générateurs
            </ThemedText>
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
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Multiplicateur
            </ThemedText>
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
                <ThemedText type="smallBold">Multiplicateur (+100%) — {format(multiplierCost)}</ThemedText>
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
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Capteurs
            </ThemedText>
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
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.six,
  },
  scoreReminder: {
    fontVariant: ['tabular-nums'],
    marginTop: -Spacing.two,
  },
  section: {
    alignSelf: 'stretch',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  purchaseRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  button: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
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
