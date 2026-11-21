import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { AppColors } from '@/constants/colors';
import { cardShadow, Radius, Space } from '@/constants/layout';
import { useHabits } from '@/context/habits-context';
import { useToday } from '@/hooks/use-today';
import { confirmDestructive } from '@/lib/alert';
import { currentStreak, fromDateKey, type Habit, lastNDays, longestStreak } from '@/lib/habits';

const WEEKDAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, status, deleteHabit } = useHabits();
  const today = useToday();
  const insets = useSafeAreaInsets();
  // Snapshot of a habit being deleted. This screen stays mounted during the back animation,
  // so it keeps rendering the snapshot instead of flashing "Habit not found."
  const [deletedHabit, setDeletedHabit] = useState<Habit | null>(null);
  const habit = habits.find((h) => h.id === id) ?? deletedHabit;

  if (!habit) {
    return (
      <View style={styles.missing}>
        {status === 'loading' ? (
          <ActivityIndicator size="large" color={AppColors.accent} />
        ) : (
          <Text style={styles.missingText}>Habit not found.</Text>
        )}
      </View>
    );
  }

  const current = currentStreak(habit.completedDates, today);
  const longest = Math.max(longestStreak(habit.completedDates), current);
  const done = new Set(habit.completedDates);
  const week = lastNDays(today, 7);

  const handleDelete = async () => {
    if (deletedHabit) return;
    const confirmed = await confirmDestructive(
      'Delete habit?',
      `Are you sure? "${habit.name}" and its history will be removed.`,
      'Delete',
    );
    if (!confirmed) return;
    setDeletedHabit(habit);
    if (router.canGoBack()) router.back();
    else router.replace('/');
    deleteHabit(habit.id);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Space.xl + Space.xs }]}>
      <Text style={styles.name} accessibilityRole="header">
        {habit.name}
      </Text>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardAccent]}>
          <Text style={styles.statValue}>🔥 {current}</Text>
          <Text style={styles.statLabelOnAccent}>Current streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>🏆 {longest}</Text>
          <Text style={styles.statLabel}>Longest streak</Text>
        </View>
      </View>

      <View style={styles.weekCard}>
        <Text style={styles.sectionTitle}>Last 7 days</Text>
        <View style={styles.weekRow}>
          {week.map((day) => {
            const filled = done.has(day);
            const isToday = day === today;
            const weekday = WEEKDAY[fromDateKey(day).getDay()];
            return (
              <View
                key={day}
                style={styles.dayCol}
                accessible
                accessibilityLabel={`${isToday ? 'Today' : day}: ${filled ? 'done' : 'not done'}`}>
                <View style={[styles.dot, filled && styles.dotFilled, isToday && styles.dotToday]}>
                  {filled && <Text style={styles.dotCheck}>✓</Text>}
                </View>
                <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
                  {isToday ? 'Today' : weekday}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.spacer} />

      <Button label="Delete" variant="danger" onPress={handleDelete} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Space.xl,
    paddingTop: Space.sm,
    gap: Space.lg,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.background,
  },
  missingText: {
    fontSize: 17,
    color: AppColors.textMuted,
  },
  name: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: AppColors.text,
    marginBottom: Space.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Space.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: AppColors.card,
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    padding: Space.lg + 2,
    gap: Space.xs,
    boxShadow: cardShadow,
  },
  statCardAccent: {
    backgroundColor: AppColors.accent,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '800',
    color: AppColors.text,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: AppColors.textMuted,
  },
  statLabelOnAccent: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.onAccent,
  },
  weekCard: {
    backgroundColor: AppColors.card,
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    padding: Space.lg + 2,
    gap: Space.lg,
    boxShadow: cardShadow,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AppColors.text,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    gap: Space.sm,
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: AppColors.border,
    backgroundColor: AppColors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotToday: {
    borderColor: AppColors.accent,
    borderWidth: 2.5,
  },
  dotFilled: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
  dotCheck: {
    color: AppColors.onAccent,
    fontSize: 16,
    fontWeight: '800',
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: AppColors.textMuted,
  },
  todayLabel: {
    color: AppColors.text,
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
    minHeight: Space.xl + Space.xs,
  },
});
