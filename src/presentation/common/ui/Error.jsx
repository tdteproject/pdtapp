import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize } from '@/presentation/themes/typography';

export default function Error({ message }) {
  if (!message) return null;
  return (
    <View style={styles.errorBox}>
      <MaterialIcons name="error-outline" size={14} color={colors.error} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 55, 95, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 55, 95, 0.2)',
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.error,
    flex: 1,
  },
});
