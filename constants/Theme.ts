import { useColorScheme } from 'react-native'

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F8F9FA',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
    card: '#FFFFFF',
    border: '#E9ECEF',
    gray: '#6C757D',
    primary: '#3B82F6',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#06B6D4',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F1419',
    tint: '#60A5FA',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#60A5FA',
    card: '#1A1F26',
    border: '#2D3748',
    gray: '#9CA3AF',
    primary: '#60A5FA',
    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',
    info: '#22D3EE',
  },
}

export const useTheme = () => {
  const colorScheme = useColorScheme()
  return Colors[colorScheme ?? 'light']
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
}

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}