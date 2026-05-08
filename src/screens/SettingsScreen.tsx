import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity,
  StatusBar, Modal, Alert,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useNotifications } from '../hooks/useNotifications';
import { CURRENCIES } from '../constants/currencies';
import { APP_NAME, APP_VERSION } from '../constants';
import Card from '../components/common/Card';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const { settings, updateSettings, rescheduleAllNotifications } = useSubscriptionStore();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledList, setScheduledList]           = useState<any[]>([]);
  useNotifications(); // Request permissions if enabled

  const toggleTheme = () =>
    updateSettings({ themeMode: isDark ? 'light' : 'dark' });

  const toggleNotifications = async (val: boolean) => {
    await updateSettings({ notificationsEnabled: val });
    if (val) await rescheduleAllNotifications();
  };

  const sendTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🚀 Test Notification",
          body: "SubTrack notifications are working perfectly!",
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
        },
      });
      Alert.alert("Success", "Test notification scheduled! It will appear in 5 seconds.");
    } catch (error) {
      Alert.alert("Error", "Failed to send test notification. Check permissions.");
    }
  };

  const checkScheduledNotifications = async () => {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log('[Settings] Scheduled notifications:', scheduled.length);
      setScheduledList(scheduled);
      setShowScheduleModal(true);
    } catch (error) {
      console.error('[Settings] Error checking notifications:', error);
      Alert.alert("Error", "Failed to fetch scheduled notifications.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Customize your experience
        </Text>

        {/* Appearance */}
        <SectionHeader label="Appearance" colors={colors} />
        <Card padding={0}>
          <SettingRow
            icon="theme-light-dark"
            iconColor="#8B5CF6"
            label="Dark Mode"
            colors={colors}
            right={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </Card>

        {/* Currency */}
        <SectionHeader label="Regional" colors={colors} />
        <Card padding={0}>
          <TouchableOpacity onPress={() => setShowCurrencyModal(true)}>
            <SettingRow
              icon="currency-usd"
              iconColor="#22C55E"
              label="Default Currency"
              colors={colors}
              right={
                <View style={styles.currencyRight}>
                  <Text style={[styles.currencyCode, { color: colors.primary }]}>
                    {settings.defaultCurrency}
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textTertiary} />
                </View>
              }
            />
          </TouchableOpacity>
        </Card>

        {/* Notifications */}
        <SectionHeader label="Notifications" colors={colors} />
        <Card padding={0}>
          <SettingRow
            icon="bell"
            iconColor="#F59E0B"
            label="Enable Notifications"
            description="Get reminded before subscriptions renew"
            colors={colors}
            right={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </Card>

        {/* About */}
        <SectionHeader label="About" colors={colors} />
        <Card padding={0}>
          <TouchableOpacity onPress={sendTestNotification}>
            <SettingRow
              icon="bell-ring"
              iconColor={colors.primary}
              label="Send Test Notification"
              description="Confirm reminders are working"
              colors={colors}
              right={<MaterialCommunityIcons name="chevron-right" size={18} color={colors.textTertiary} />}
            />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <TouchableOpacity onPress={checkScheduledNotifications}>
            <SettingRow
              icon="calendar-clock"
              iconColor={colors.warning}
              label="View Scheduled Reminders"
              description="Check your upcoming alerts"
              colors={colors}
              right={<MaterialCommunityIcons name="chevron-right" size={18} color={colors.textTertiary} />}
            />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow
            icon="information"
            iconColor="#3B82F6"
            label="App Name"
            colors={colors}
            right={<Text style={{ color: colors.textSecondary, fontSize: 14 }}>{APP_NAME}</Text>}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <SettingRow
            icon="tag"
            iconColor="#64748B"
            label="Version"
            colors={colors}
            right={<Text style={{ color: colors.textSecondary, fontSize: 14 }}>{APP_VERSION}</Text>}
          />
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Currency Picker Modal */}
      <Modal visible={showCurrencyModal} transparent animationType="slide" onRequestClose={() => setShowCurrencyModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowCurrencyModal(false)} />
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.sheetTitle, { color: colors.text }]}>Select Currency</Text>
          <ScrollView>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[
                  styles.currencyOption,
                  { backgroundColor: settings.defaultCurrency === c.code ? `${colors.primary}18` : 'transparent' },
                ]}
                onPress={() => {
                  updateSettings({ defaultCurrency: c.code });
                  setShowCurrencyModal(false);
                }}
              >
                <Text style={[styles.currencySymbol, { color: colors.primary }]}>{c.symbol}</Text>
                <Text style={[styles.currencyName, { color: colors.text }]}>
                  {c.code} — {c.name}
                </Text>
                {settings.defaultCurrency === c.code && (
                  <MaterialCommunityIcons name="check" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Scheduled Reminders Modal */}
      <Modal visible={showScheduleModal} transparent animationType="slide" onRequestClose={() => setShowScheduleModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowScheduleModal(false)} />
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.sheetTitle, { color: colors.text, textAlign: 'center' }]}>Scheduled Reminders</Text>
          <ScrollView style={{ maxHeight: 400, paddingHorizontal: 20 }}>
            {scheduledList.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <MaterialCommunityIcons name="bell-off-outline" size={48} color={colors.textTertiary} />
                <Text style={{ color: colors.textSecondary, marginTop: 12 }}>No upcoming reminders found.</Text>
              </View>
            ) : (
              scheduledList.map((item, idx) => {
                const trigger = item.trigger;
                let triggerTime = 'Unknown';
                if (trigger.type === 'calendar') {
                  triggerTime = new Date(trigger.value || trigger.date || Date.now()).toLocaleString();
                } else if (trigger.type === 'timeInterval') {
                  triggerTime = `In ${trigger.seconds}s`;
                } else if (trigger.value) {
                  triggerTime = new Date(trigger.value).toLocaleString();
                }
                return (
                  <View key={idx} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{item.content.title}</Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginVertical: 2 }}>{item.content.body}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>Trigger: {triggerTime}</Text>
                  </View>
                );
              })
            )}
          </ScrollView>
          <TouchableOpacity 
            style={{ margin: 20, height: 50, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }} 
            onPress={() => setShowScheduleModal(false)}
          >
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ label, colors }: { label: string; colors: any }) {
  return (
    <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{label}</Text>
  );
}

function SettingRow({
  icon, iconColor, label, description, right, colors,
}: {
  icon: string; iconColor: string; label: string;
  description?: string; right: React.ReactNode; colors: any;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: `${iconColor}22` }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>{description}</Text>
        )}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  scroll:       { padding: 16, paddingTop: 56 },
  title:        { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle:     { fontSize: 14, marginTop: 4, marginBottom: 20 },
  sectionHeader:{ fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 20, marginBottom: 8, marginLeft: 4 },
  settingRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  settingIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  settingDesc:  { fontSize: 12, marginTop: 2 },
  divider:      { height: 1, marginLeft: 66 },
  currencyRight:{ flexDirection: 'row', alignItems: 'center', gap: 4 },
  currencyCode: { fontSize: 14, fontWeight: '700' },
  // Modal
  overlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:        { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 32, maxHeight: '65%' },
  handle:       { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  sheetTitle:   { fontSize: 17, fontWeight: '700', paddingHorizontal: 20, paddingVertical: 12 },
  currencyOption:{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  currencySymbol:{ fontSize: 18, fontWeight: '700', width: 28 },
  currencyName: { flex: 1, fontSize: 15 },
  // Scheduled list specific
  scheduleItem: { paddingVertical: 12, borderBottomWidth: 1 },
  scheduleTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  scheduleBody: { fontSize: 13, marginBottom: 4 },
  scheduleTime: { fontSize: 12, fontWeight: '600' },
});
