import { CategoryMeta } from '../types';

export const CATEGORIES: CategoryMeta[] = [
  { key: 'entertainment', label: 'Entertainment', icon: 'television-play',  color: '#E91E8C' },
  { key: 'productivity',  label: 'Productivity',  icon: 'briefcase',         color: '#3B82F6' },
  { key: 'cloud',         label: 'Cloud Storage', icon: 'cloud',             color: '#06B6D4' },
  { key: 'music',         label: 'Music',         icon: 'music',             color: '#8B5CF6' },
  { key: 'gaming',        label: 'Gaming',        icon: 'gamepad-variant',   color: '#F59E0B' },
  { key: 'fitness',       label: 'Fitness',       icon: 'dumbbell',          color: '#10B981' },
  { key: 'news',          label: 'News & Media',  icon: 'newspaper',         color: '#F97316' },
  { key: 'education',     label: 'Education',     icon: 'school',            color: '#6366F1' },
  { key: 'finance',       label: 'Finance',       icon: 'bank',              color: '#22C55E' },
  { key: 'other',         label: 'Other',         icon: 'dots-horizontal',   color: '#64748B' },
];

export const getCategoryMeta = (key: string): CategoryMeta =>
  CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
