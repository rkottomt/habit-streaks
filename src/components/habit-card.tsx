import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/colors';
import { cardShadow, Radius, Space } from '@/constants/layout';
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
    <View style={[styles.card, doneToday && styles.cardDone]}>
      <Pressable
        onPress={() => router.push({ pathname: '/habit/[id]', params: { id: habit.id } })}
        style={({ pressed }) => [styles.info, pressed && styles.infoPressed]}
        accessibilityRole="button"
        accessibilityLabel={`${habit.name}, streak ${streak}. Open details`}>
        <View style={styles.text}>
          <Text style={styles.name} numberOfLines={2}>
            {habit.name}
          </Text>
          <View style={[styles.streakPill, streak > 0 && styles.streakPillActive]}>
            <Text style={styles.streakText}>🔥 {streak}</Text>
          </View>
        </View>
        <Text style={styles.chevron} importantForAccessibility="no" accessibilityElementsHidden>
          ›
        </Text>
      </Pressable>
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: doneToday }}
        accessibilityLabel={`Mark ${habit.name} done today`}
        style={({ pressed }) => [
          styles.circle,
          doneToday && styles.circleDone,
          pressed && (doneToday ? styles.circleDonePressed : styles.circlePressed),
        ]}>
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
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: AppColors.card,
    paddingRight: Space.lg,
    boxShadow: cardShadow,
  },
  cardDone: {
    borderColor: AppColors.accentSoft,
  },
  // The tappable area that opens details. Rounded on the left so its pressed tint fits the card.
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    paddingVertical: Space.lg,
    paddingLeft: Space.lg + 2,
    paddingRight: Space.md,
    borderTopLeftRadius: Radius.card,
    borderBottomLeftRadius: Radius.card,
  },
  infoPressed: {
    backgroundColor: AppColors.cardPressed,
  },
  text: {
    flex: 1,
    gap: Space.sm,
  },
  name: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '600',
    color: AppColors.text,
  },
  streakPill: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.accentSoft,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  streakPillActive: {
    backgroundColor: AppColors.accent,
  },
  streakText: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.onAccent,
    fontVariant: ['tabular-nums'],
  },
  chevron: {
    fontSize: 26,
    lineHeight: 28,
    color: AppColors.textMuted,
    opacity: 0.6,
    fontWeight: '300',
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: AppColors.accent,
    backgroundColor: AppColors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePressed: {
    backgroundColor: AppColors.accentSoft,
    transform: [{ scale: 0.92 }],
  },
  circleDone: {
    backgroundColor: AppColors.accent,
  },
  circleDonePressed: {
    backgroundColor: AppColors.accentPressed,
    borderColor: AppColors.accentPressed,
    transform: [{ scale: 0.92 }],
  },
  check: {
    color: AppColors.onAccent,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
});
