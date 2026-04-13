import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/presentation/themes/colors';

interface ProfileInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  iconName: string;
  keyboardType?: 'default' | 'number-pad' | 'email-address';
  error?: string;
}

export default function ProfileInputField({ label, value, onChangeText, placeholder, iconName, keyboardType = 'default', error }: ProfileInputFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text>
      <View style={[styles.inputContainer, { borderColor: error ? colors.error : colors.border, backgroundColor: colors.card }]}>
        <MaterialIcons name={iconName as any} size={24} color={colors.primary.main} />
        <TextInput
          style={[styles.input, { color: colors.text.primary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          placeholderTextColor={colors.text.muted}
        />
      </View>
      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    elevation: 2,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
  }
});

