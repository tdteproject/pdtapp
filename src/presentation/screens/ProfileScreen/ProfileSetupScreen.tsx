import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUserStore } from '@/presentation/state/useUserStore';
import SafeAreaWrapper from '@/presentation/common/layout/SafeAreaWrapper';
import PrimaryButton from '@/presentation/common/ui/PrimaryButton';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize, letterSpacing } from '@/presentation/themes/typography';

type Gender = 'male' | 'female' | 'other';

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  icon: string;
  keyboardType?: 'default' | 'number-pad';
  suffix?: string;
}

function InputField({ label, value, onChangeText, placeholder, icon, keyboardType = 'default', suffix }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.row, focused && fieldStyles.rowFocused]}>
        <MaterialIcons name={icon as any} size={18} color={focused ? colors.primary.main : colors.text.muted} />
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {suffix && <Text style={fieldStyles.suffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { fontFamily: fontFamily.bold, fontSize: fontSize.xs, color: colors.text.secondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: letterSpacing.wide },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 10, borderWidth: 1,
    borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 12, gap: 10,
  },
  rowFocused: { borderColor: colors.primary.main, backgroundColor: colors.cardAlt },
  input: { flex: 1, fontFamily: fontFamily.medium, fontSize: fontSize.base, color: colors.text.primary, padding: 0 },
  suffix: { fontFamily: fontFamily.medium, fontSize: fontSize.sm, color: colors.text.muted },
});

const GENDER_OPTIONS: { value: Gender; label: string; icon: string }[] = [
  { value: 'male', label: 'Male', icon: '♂' },
  { value: 'female', label: 'Female', icon: '♀' },
  { value: 'other', label: 'Other', icon: '⚥' },
];

const ProfileSetupScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const isEditMode = route.params?.isEditMode ?? false;

  const { user, updateProfile, saveProfile } = useUserStore();

  const [name, setName] = useState(isEditMode && user?.name ? user.name : '');
  const [age, setAge] = useState(isEditMode && user?.age ? String(user.age) : '');
  const [gender, setGender] = useState<Gender>(isEditMode && user?.gender ? user.gender as Gender : 'male');
  const [weight, setWeight] = useState(isEditMode && user?.weight ? String(user.weight) : '');
  const [height, setHeight] = useState(isEditMode && user?.height ? String(user.height) : '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    const profile = {
      name,
      age: Number(age),
      gender,
      weight: Number(weight),
      height: Number(height),
    };
    const validation = updateProfile(profile);
    if (validation !== true) {
      Alert.alert('Incomplete Profile', validation as string);
      return;
    }
    setIsLoading(true);
    await saveProfile();
    setIsLoading(false);

    if (isEditMode) {
      navigation.goBack();
    }
  };

  const bmi =
    weight && height
      ? (Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1)
      : null;

  const bmiCategory =
    bmi
      ? Number(bmi) < 18.5
        ? 'Underweight'
        : Number(bmi) < 25
          ? 'Normal'
          : Number(bmi) < 30
            ? 'Overweight'
            : 'Obese'
      : null;

  return (
    <SafeAreaWrapper>
      {isEditMode && (
        <View style={styles.topNav}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={20} color={colors.text.primary} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          {!isEditMode && (
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>Final Step</Text>
            </View>
          )}
          <Text style={styles.title}>{isEditMode ? 'Edit Profile' : 'Your Profile'}</Text>
          <Text style={styles.subtitle}>
            {isEditMode ? 'Update your basic health details' : 'Help us personalise your fitness journey'}
          </Text>
        </View>

        {!isEditMode && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <InputField label="Full Name" value={name} onChangeText={setName} placeholder="e.g. Jhon " icon="person" />
          <InputField label="Age" value={age} onChangeText={setAge} placeholder="e.g. 28" icon="cake" keyboardType="number-pad" />

          {/* Gender Selector */}
          <View style={styles.formGroup}>
            <Text style={styles.genderLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {GENDER_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[styles.genderChip, gender === opt.value && styles.genderChipSelected]}
                  onPress={() => setGender(opt.value)}
                >
                  <Text style={styles.genderIcon}>{opt.icon}</Text>
                  <Text style={[styles.genderText, gender === opt.value && { color: colors.primary.main }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Weight + Height */}
          <View style={styles.halfRow}>
            <View style={styles.half}>
              <InputField label="Weight" value={weight} onChangeText={setWeight} placeholder="70" icon="fitness-center" keyboardType="number-pad" suffix="kg" />
            </View>
            <View style={styles.half}>
              <InputField label="Height" value={height} onChangeText={setHeight} placeholder="175" icon="straighten" keyboardType="number-pad" suffix="cm" />
            </View>
          </View>

          {/* BMI Preview */}
          {bmi && (
            <View style={styles.bmiCard}>
              <MaterialIcons name="info-outline" size={16} color={colors.info} />
              <View style={styles.bmiContent}>
                <Text style={styles.bmiLabel}>Estimated BMI</Text>
                <Text style={styles.bmiValue}>
                  {bmi} <Text style={styles.bmiCategory}>— {bmiCategory}</Text>
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* CTA */}
        <PrimaryButton
          title={isEditMode ? "Save Changes" : "Continue to Dashboard"}
          onPress={handleSave}
          loading={isLoading}
          icon={isEditMode ? "save" : "arrow-forward"}
          disabled={!name || !age || !weight || !height}
        />
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default ProfileSetupScreen;

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  backText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.subtle,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  stepText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.primary.main,
    letterSpacing: letterSpacing.wide,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  progressBar: {
    height: 2,
    backgroundColor: colors.border,
    borderRadius: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 1,
  },
  form: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 14,
  },
  genderLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.wide,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderChip: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genderChipSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.subtle,
  },
  genderIcon: {
    fontSize: 16,
    color: colors.text.primary,
  },
  genderText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  halfRow: {
    flexDirection: 'row',
    gap: 8,
  },
  half: {
    flex: 1,
  },
  bmiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(64, 200, 224, 0.08)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(64, 200, 224, 0.2)',
    marginBottom: 4,
  },
  bmiContent: {
    flex: 1,
  },
  bmiLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  bmiValue: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  bmiCategory: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
});
