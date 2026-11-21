import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/colors';
import { currentStreak, type Habit } from '@/lib/habits';

type Props = {
  habit: Habit;
  today: string;
  onToggle: () => void;
};

export function HabitCard({ habit, today, onToggle }: Props) {
  const doneToday = habit.completedDates.includes(today);
  const streak = currentStreak(habit.completedDates, today);

  return (
    <View style={styles.card}>
      <Link href={{ pathname: '/habit/[id]', params: { id: habit.id } }} asChild>
        <Pressable
          style={({ pressed }) => [styles.info, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`${habit.name}, streak ${streak}. Open details`}>
          <Text style={styles.name} numberOfLines={2}>
            {habit.name}
          </Text>
          <Text style={styles.streak}>🔥 {streak}</Text>
        </Pressable>
      </Link>
      <Pressable
        onPress={onToggle}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: doneToday }}
        accessibilityLabel={`Mark ${habit.name} done today`}
        style={({ pressed }) => [styles.circle, doneToday && styles.circleDone, pressed && styles.pressed]}>
        {doneToday && <Text style={styles.check}>✓</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 14,
    gap: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
  },
  streak: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.accent,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {
    backgroundColor: AppColors.accent,
  },
  check: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
});
