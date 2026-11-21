import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/colors';
import { useHabits } from '@/context/habits-context';
import { useToday } from '@/hooks/use-today';
import { confirmDestructive } from '@/lib/alert';
import { currentStreak, lastNDays, longestStreak } from '@/lib/habits';

const WEEKDAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, status, deleteHabit } = useHabits();
  const today = useToday();
  const insets = useSafeAreaInsets();
  const habit = habits.find((h) => h.id === id);

  if (!habit) {
    return (
      <View style={styles.missing}>
        <Text style={styles.label}>{status === 'loading' ? 'Loading…' : 'Habit not found.'}</Text>
      </View>
    );
  }

  const current = currentStreak(habit.completedDates, today);
  const longest = Math.max(longestStreak(habit.completedDates), current);
  const done = new Set(habit.completedDates);
  const week = lastNDays(today, 7);

  const handleDelete = async () => {
    const confirmed = await confirmDestructive(
      'Delete habit?',
      `Are you sure? "${habit.name}" and its history will be removed.`,
      'Delete',
    );
    if (!confirmed) return;
    const habitId = habit.id;
    if (router.canGoBack()) router.back();
    else router.replace('/');
    deleteHabit(habitId);
  };

  return (
    <>
      <Stack.Screen options={{ title: habit.name }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.name} accessibilityRole="header">
          {habit.name}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>🔥 {current}</Text>
            <Text style={styles.label}>Current streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>🏆 {longest}</Text>
            <Text style={styles.label}>Longest streak</Text>
          </View>
        </View>

        <View style={styles.weekCard}>
          <Text style={styles.sectionTitle}>Last 7 days</Text>
          <View style={styles.weekRow}>
            {week.map((day) => {
              const filled = done.has(day);
              const [y, m, d] = day.split('-').map(Number);
              const weekday = WEEKDAY[new Date(y, m - 1, d).getDay()];
              return (
                <View
                  key={day}
                  style={styles.dayCol}
                  accessible
                  accessibilityLabel={`${day === today ? 'Today' : day}: ${filled ? 'done' : 'not done'}`}>
                  <View style={[styles.dot, filled && styles.dotFilled]} />
                  <Text style={[styles.dayLabel, day === today && styles.todayLabel]}>
                    {day === today ? 'Today' : weekday}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.spacer} />

        <Pressable
          onPress={handleDelete}
          accessibilityRole="button"
          style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.background,
  },
  name: {
    fontSize: 30,
    fontWeight: '800',
    color: AppColors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: AppColors.card,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.accent,
  },
  label: {
    fontSize: 15,
    color: AppColors.textMuted,
  },
  weekCard: {
    backgroundColor: AppColors.card,
    borderRadius: 16,
    padding: 16,
    gap: 14,
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
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: AppColors.accent,
  },
  dotFilled: {
    backgroundColor: AppColors.accent,
  },
  dayLabel: {
    fontSize: 12,
    color: AppColors.textMuted,
  },
  todayLabel: {
    color: AppColors.text,
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  deleteButton: {
    backgroundColor: AppColors.danger,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
});
