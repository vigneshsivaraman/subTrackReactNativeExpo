// Light palette
export const LightColors = {
  background:    '#F8FAFC',
  surface:       '#FFFFFF',
  surfaceAlt:    '#F1F5F9',
  primary:       '#6366F1',     // indigo-500
  primaryDark:   '#4F46E5',     // indigo-600
  primaryLight:  '#A5B4FC',     // indigo-300
  accent:        '#EC4899',     // pink-500
  text:          '#0F172A',
  textSecondary: '#64748B',
  textTertiary:  '#94A3B8',
  border:        '#E2E8F0',
  divider:       '#F1F5F9',
  error:         '#EF4444',
  success:       '#22C55E',
  warning:       '#F59E0B',
  overdue:       '#EF4444',
  upcoming:      '#F59E0B',
  card:          '#FFFFFF',
  shadow:        '#00000014',
  tabBar:        '#FFFFFF',
  statusBar:     'dark-content' as const,
};

// Dark palette
export const DarkColors = {
  background:    '#0F172A',
  surface:       '#1E293B',
  surfaceAlt:    '#293548',
  primary:       '#818CF8',     // indigo-400
  primaryDark:   '#6366F1',     // indigo-500
  primaryLight:  '#4F46E5',     // indigo-600
  accent:        '#F472B6',     // pink-400
  text:          '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary:  '#64748B',
  border:        '#334155',
  divider:       '#1E293B',
  error:         '#F87171',
  success:       '#4ADE80',
  warning:       '#FCD34D',
  overdue:       '#F87171',
  upcoming:      '#FCD34D',
  card:          '#1E293B',
  shadow:        '#00000040',
  tabBar:        '#1E293B',
  statusBar:     'light-content' as const,
};

export type AppColors = Omit<typeof LightColors, 'statusBar'> & {
  statusBar: 'light-content' | 'dark-content';
};
