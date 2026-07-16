import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useGameLoop } from '@/hooks/use-game-loop';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const { state, canTap, tap } = useGameLoop();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.value}>
          {Math.floor(state.value)}
        </ThemedText>

        <Pressable
          onPress={tap}
          disabled={!canTap}
          style={({ pressed }) => [
            styles.tapButton,
            { backgroundColor: theme.backgroundElement },
            !canTap && styles.tapButtonDisabled,
            pressed && canTap && styles.tapButtonPressed,
          ]}>
          <ThemedText type="smallBold">Tap</ThemedText>
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
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  value: {
    fontVariant: ['tabular-nums'],
  },
  tapButton: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
  },
  tapButtonDisabled: {
    opacity: 0.3,
  },
  tapButtonPressed: {
    opacity: 0.7,
  },
});
