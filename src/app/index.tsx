import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HabitCard } from '@/components/habit-card';
import { AppColors } from '@/constants/colors';
import { useHabits } from '@/context/habits-context';
import { useToday } from '@/hooks/use-today';
import { MAX_NAME_LENGTH } from '@/lib/habits';

export default function HomeScreen() {
  const { habits, status, reload, addHabit, toggleDay } = useHabits();
  const today = useToday();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      <Text style={styles.title} accessibilityRole="header">
        Habit Streaks
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (error) setError(null);
          }}
          onSubmitEditing={handleAdd}
          placeholder="New habit, e.g. Drink water"
          placeholderTextColor={AppColors.textMuted}
          maxLength={MAX_NAME_LENGTH}
          returnKeyType="done"
          submitBehavior="submit"
          autoCorrect={false}
          accessibilityLabel="New habit name"
        />
        <Pressable
          onPress={handleAdd}
          disabled={status !== 'ready'}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.addButton,
            (pressed || status !== 'ready') && styles.pressed,
          ]}>
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      </View>
      {error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}

      {status === 'loading' ? (
        <ActivityIndicator style={styles.centered} color={AppColors.accent} />
      ) : status === 'error' ? (
        <View style={styles.centered}>
          <Text style={styles.empty}>Couldn&apos;t load your habits.</Text>
          <Pressable onPress={reload} style={styles.addButton} accessibilityRole="button">
            <Text style={styles.addText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(h) => h.id}
          renderItem={({ item }) => (
            <HabitCard habit={item} today={today} onToggle={() => toggleDay(item.id, today)} />
          )}
          extraData={today}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<Text style={styles.empty}>No habits yet. Add one above.</Text>}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: AppColors.text,
    marginTop: 12,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    color: AppColors.text,
  },
  addButton: {
    backgroundColor: AppColors.accent,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
  error: {
    color: AppColors.danger,
    fontSize: 15,
    marginTop: 8,
  },
  list: {
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  separator: {
    height: 12,
  },
  empty: {
    textAlign: 'center',
    color: AppColors.textMuted,
    fontSize: 17,
    marginTop: 40,
  },
  centered: {
    marginTop: 40,
    alignItems: 'center',
    gap: 16,
  },
});
