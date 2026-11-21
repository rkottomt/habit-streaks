import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { HabitCard } from '@/components/habit-card';
import { AppColors } from '@/constants/colors';
import { Radius, Space } from '@/constants/layout';
import { useHabits } from '@/context/habits-context';
import { useToday } from '@/hooks/use-today';
import { fromDateKey, MAX_NAME_LENGTH } from '@/lib/habits';

export default function HomeScreen() {
  const { habits, status, reload, addHabit, toggleDay } = useHabits();
  const today = useToday();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const dateLabel = fromDateKey(today).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const handleAdd = () => {
    const err = addHabit(name);
    if (err) {
      setError(err);
    } else {
      setName('');
      setError(null);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Habit Streaks
        </Text>
        <Text style={styles.subtitle}>{dateLabel}</Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, focused && styles.inputFocused, !!error && styles.inputError]}
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (error) setError(null);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={handleAdd}
          placeholder="New habit, e.g. Drink water"
          placeholderTextColor={AppColors.textMuted}
          selectionColor={AppColors.accent}
          cursorColor={AppColors.accent}
          maxLength={MAX_NAME_LENGTH}
          returnKeyType="done"
          submitBehavior="submit"
          autoCorrect={false}
          accessibilityLabel="New habit name"
        />
        <Button label="Add" onPress={handleAdd} disabled={status !== 'ready'} />
      </View>
      {error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}

      {status === 'loading' ? (
        <ActivityIndicator style={styles.loading} size="large" color={AppColors.accent} />
      ) : status === 'error' ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateEmoji} importantForAccessibility="no" accessibilityElementsHidden>
            ⚠️
          </Text>
          <Text style={styles.stateTitle}>Couldn&apos;t load your habits.</Text>
          <Button label="Retry" onPress={reload} style={styles.retry} />
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(h) => h.id}
          renderItem={({ item }) => (
            <HabitCard habit={item} today={today} onToggle={() => toggleDay(item.id, today)} />
          )}
          extraData={today}
          style={styles.listView}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={EmptyState}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function EmptyState() {
  return (
    <View style={styles.stateCard}>
      <Text style={styles.stateEmoji} importantForAccessibility="no" accessibilityElementsHidden>
        🌱
      </Text>
      <Text style={styles.stateTitle}>No habits yet. Add one above.</Text>
      <Text style={styles.stateHint}>
        Start small, like &ldquo;Drink water&rdquo; or &ldquo;Read 10 pages&rdquo;, then tap the
        circle each day to build your streak.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingHorizontal: Space.xl,
  },
  header: {
    marginTop: Space.md,
    marginBottom: Space.xl,
    gap: 2,
  },
  title: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: AppColors.text,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.textMuted,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Space.sm + 2,
  },
  input: {
    flex: 1,
    minHeight: 50,
    backgroundColor: AppColors.card,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    borderRadius: Radius.button,
    borderCurve: 'continuous',
    paddingHorizontal: Space.lg,
    fontSize: 17,
    color: AppColors.text,
  },
  inputFocused: {
    borderColor: AppColors.accent,
  },
  inputError: {
    borderColor: AppColors.danger,
  },
  error: {
    color: AppColors.danger,
    fontSize: 15,
    fontWeight: '500',
    marginTop: Space.sm,
    marginLeft: Space.xs,
  },
  loading: {
    marginTop: Space.xxl + Space.sm,
  },
  listView: {
    marginHorizontal: -Space.xl,
  },
  // Horizontal padding lives here (not on the screen) so card shadows aren't clipped at the edges.
  list: {
    paddingHorizontal: Space.xl,
    paddingTop: Space.xl + Space.xs,
    paddingBottom: Space.xxl + Space.sm,
    flexGrow: 1,
  },
  separator: {
    height: Space.md,
  },
  stateCard: {
    marginTop: Space.xl + Space.xs,
    alignItems: 'center',
    paddingVertical: Space.xxl,
    paddingHorizontal: Space.xl + Space.xs,
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: AppColors.border,
    gap: Space.sm,
  },
  stateEmoji: {
    fontSize: 40,
    marginBottom: Space.xs,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text,
    textAlign: 'center',
  },
  stateHint: {
    fontSize: 15,
    lineHeight: 21,
    color: AppColors.textMuted,
    textAlign: 'center',
  },
  retry: {
    marginTop: Space.sm,
    alignSelf: 'center',
  },
});
