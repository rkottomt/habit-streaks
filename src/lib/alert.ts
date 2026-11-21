import { Alert, Platform } from 'react-native';

/** Simple informational alert that also works on web (where Alert.alert is a no-op). */
export function showAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    globalThis.alert?.(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

/** Asks the user to confirm a destructive action. Resolves true if confirmed. */
export function confirmDestructive(
  title: string,
  message: string,
  confirmLabel: string,
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(globalThis.confirm?.(`${title}\n\n${message}`) ?? false);
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
