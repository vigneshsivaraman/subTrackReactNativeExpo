import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, StatusBar, Platform, Alert, Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useTheme } from '../hooks/useTheme';
import { RootStackParamList } from '../navigation/types';
import { SubscriptionFormData, BillingCycle, SubscriptionCategory } from '../types';
import { CATEGORIES } from '../constants/categories';
import { CURRENCIES } from '../constants/currencies';
import { BILLING_CYCLES } from '../constants';
import { todayString, formatDisplayDate } from '../utils/dateUtils';
import { isValidAmount, isValidDate, isValidReminderDays, isValidName } from '../utils/validationUtils';
import ConfirmModal from '../components/common/ConfirmModal';
import Button from '../components/common/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditSubscription'>;

// ─── Picker Modal ─────────────────────────────────────────────────────────────

interface PickerModalProps<T extends string> {
  visible: boolean;
  title: string;
  options: { key: T; label: string; icon?: string; color?: string }[];
  selected: T;
  onSelect: (val: T) => void;
  onClose: () => void;
  colors: any;
}

function PickerModal<T extends string>({ visible, title, options, selected, onSelect, onClose, colors }: PickerModalProps<T>) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={pickerStyles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={[pickerStyles.sheet, { backgroundColor: colors.surface }]}>
        <View style={[pickerStyles.handle, { backgroundColor: colors.border }]} />
        <Text style={[pickerStyles.title, { color: colors.text }]}>{title}</Text>
        <ScrollView>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                pickerStyles.option,
                { backgroundColor: selected === opt.key ? `${colors.primary}18` : 'transparent' },
              ]}
              onPress={() => { onSelect(opt.key); onClose(); }}
            >
              {opt.color && (
                <View style={[pickerStyles.dot, { backgroundColor: opt.color }]} />
              )}
              <Text style={[
                pickerStyles.optionLabel,
                { color: selected === opt.key ? colors.primary : colors.text, fontWeight: selected === opt.key ? '700' : '400' },
              ]}>
                {opt.label}
              </Text>
              {selected === opt.key && (
                <MaterialCommunityIcons name="check" size={18} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AddEditSubscriptionScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, settings } =
    useSubscriptionStore();

  const subscriptionId = route.params?.subscriptionId;
  const isEditing      = Boolean(subscriptionId);
  const existing       = subscriptions.find((s) => s.id === subscriptionId);

  const [showDeleteModal, setShowDeleteModal]     = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showCyclePicker, setShowCyclePicker]     = useState(false);
  const [showDatePicker, setShowDatePicker]       = useState(false);
  const [saving, setSaving]                        = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } =
    useForm<SubscriptionFormData>({
      defaultValues: {
        name:        existing?.name       ?? '',
        amount:      existing ? String(existing.amount) : '',
        currency:    existing?.currency   ?? settings.defaultCurrency,
        billingCycle: existing?.billingCycle ?? 'monthly',
        renewalDate: existing?.renewalDate ?? todayString(),
        category:    existing?.category   ?? 'other',
        reminderDays: existing ? String(existing.reminderDays) : String(settings.defaultReminderDays),
      },
    });

  const onSubmit = async (data: SubscriptionFormData) => {
    setSaving(true);
    try {
      const payload = {
        name:        data.name.trim(),
        amount:      parseFloat(data.amount),
        currency:    data.currency,
        billingCycle: data.billingCycle as BillingCycle,
        renewalDate: data.renewalDate,
        category:    data.category as SubscriptionCategory,
        reminderDays: parseInt(data.reminderDays, 10),
        isActive:    true,
      };

      if (isEditing && subscriptionId) {
        await updateSubscription(subscriptionId, payload);
      } else {
        await addSubscription(payload);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save subscription. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!subscriptionId) return;
    await deleteSubscription(subscriptionId);
    navigation.goBack();
  };

  // ─── Field component helper ───────────────────────────────────────────────

  const FieldLabel = ({ label, required }: { label: string; required?: boolean }) => (
    <Text style={[styles.label, { color: colors.textSecondary }]}>
      {label}{required ? <Text style={{ color: colors.error }}> *</Text> : null}
    </Text>
  );

  const ErrorText = ({ message }: { message?: string }) =>
    message ? <Text style={[styles.errorText, { color: colors.error }]}>{message}</Text> : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? 'Edit Subscription' : 'Add Subscription'}
        </Text>
        {isEditing ? (
          <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
            <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

        {/* Name */}
        <FieldLabel label="Subscription Name" required />
        <Controller
          control={control}
          name="name"
          rules={{
            validate: (v) => isValidName(v) || 'Name must be 1–50 characters',
            required: 'Name is required',
          }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: errors.name ? colors.error : colors.border }]}
              placeholder="e.g. Netflix, Spotify"
              placeholderTextColor={colors.textTertiary}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              maxLength={50}
            />
          )}
        />
        <ErrorText message={errors.name?.message} />

        {/* Amount + Currency */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <FieldLabel label="Amount" required />
            <Controller
              control={control}
              name="amount"
              rules={{ validate: (v) => isValidAmount(v) || 'Enter a valid amount > 0' }}
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: errors.amount ? colors.error : colors.border }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <ErrorText message={errors.amount?.message} />
          </View>

          <View style={{ width: 12 }} />

          <View style={{ width: 110 }}>
            <FieldLabel label="Currency" />
            <Controller
              control={control}
              name="currency"
              render={({ field: { value, onChange } }) => (
                <>
                  <TouchableOpacity
                    style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setShowCurrencyPicker(true)}
                  >
                    <Text style={[styles.pickerText, { color: colors.text }]}>{value}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <PickerModal
                    visible={showCurrencyPicker}
                    title="Select Currency"
                    options={CURRENCIES.map((c) => ({ key: c.code, label: `${c.symbol} ${c.code} — ${c.name}` }))}
                    selected={value}
                    onSelect={onChange}
                    onClose={() => setShowCurrencyPicker(false)}
                    colors={colors}
                  />
                </>
              )}
            />
          </View>
        </View>

        {/* Billing Cycle */}
        <FieldLabel label="Billing Cycle" />
        <Controller
          control={control}
          name="billingCycle"
          render={({ field: { value, onChange } }) => (
            <>
              <TouchableOpacity
                style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowCyclePicker(true)}
              >
                <Text style={[styles.pickerText, { color: colors.text }]}>
                  {BILLING_CYCLES.find((c) => c.key === value)?.label ?? value}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              <PickerModal
                visible={showCyclePicker}
                title="Billing Cycle"
                options={BILLING_CYCLES.map((c) => ({ key: c.key, label: c.label }))}
                selected={value}
                onSelect={onChange}
                onClose={() => setShowCyclePicker(false)}
                colors={colors}
              />
            </>
          )}
        />

        {/* Renewal Date */}
        <FieldLabel label="Renewal Date" required />
        <Controller
          control={control}
          name="renewalDate"
          rules={{ validate: (v) => isValidDate(v) || 'Select a valid date' }}
          render={({ field: { value, onChange } }) => (
            <>
              <TouchableOpacity
                style={[styles.picker, { backgroundColor: colors.surface, borderColor: errors.renewalDate ? colors.error : colors.border }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.pickerText, { color: colors.text }]}>
                  {value ? formatDisplayDate(value) : 'Select Date'}
                </Text>
                <MaterialCommunityIcons name="calendar-month" size={18} color={colors.textSecondary} />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={value ? new Date(value) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const dateStr = selectedDate.toISOString().split('T')[0];
                      onChange(dateStr);
                    }
                  }}
                  minimumDate={new Date()} // Prevent past dates for new renewals
                />
              )}
            </>
          )}
        />
        <ErrorText message={errors.renewalDate?.message} />

        {/* Category */}
        <FieldLabel label="Category" />
        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange } }) => (
            <>
              <TouchableOpacity
                style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowCategoryPicker(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.catDot, { backgroundColor: CATEGORIES.find((c) => c.key === value)?.color }]} />
                  <Text style={[styles.pickerText, { color: colors.text }]}>
                    {CATEGORIES.find((c) => c.key === value)?.label ?? value}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-down" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              <PickerModal
                visible={showCategoryPicker}
                title="Select Category"
                options={CATEGORIES.map((c) => ({ key: c.key, label: c.label, color: c.color }))}
                selected={value}
                onSelect={onChange}
                onClose={() => setShowCategoryPicker(false)}
                colors={colors}
              />
            </>
          )}
        />

        {/* Reminder Days */}
        <FieldLabel label="Remind me (days before renewal)" />
        <Controller
          control={control}
          name="reminderDays"
          rules={{ validate: (v) => isValidReminderDays(v) || 'Enter 1–30 days' }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: errors.reminderDays ? colors.error : colors.border }]}
              placeholder="3"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              maxLength={2}
            />
          )}
        />
        <ErrorText message={errors.reminderDays?.message} />

        <View style={{ height: 24 }} />

        {/* Save Button */}
        <Button
          label={isEditing ? 'Save Changes' : 'Add Subscription'}
          onPress={handleSubmit(onSubmit)}
          loading={saving}
          style={{ marginBottom: 40 }}
        />
      </ScrollView>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Subscription"
        message={`Are you sure you want to delete "${existing?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        destructive
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  form: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  picker: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: { fontSize: 15 },
  catDot: { width: 12, height: 12, borderRadius: 6 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  errorText: { fontSize: 12, marginTop: 4, marginLeft: 2 },
});

const pickerStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: '75%',
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  optionLabel: { flex: 1, fontSize: 15 },
});
