import { IconSymbol } from '@/components/ui/IconSymbol'
import { Spacing, useTheme } from '@/constants/Theme'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface ScreenHeaderProps {
  title: string
  subtitle: string
  icon?: string
  iconColor?: string
  iconBackground?: string
  emoji?: string
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  iconBackground,
  emoji,
}) => {
  const theme = useTheme()

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: theme.gray }]}>
            {subtitle}
          </Text>
        </View>
        <View style={[styles.iconContainer, { backgroundColor: iconBackground || theme.primary + '20' }]}>
          {emoji ? (
            <Text style={styles.emoji}>{emoji}</Text>
          ) : (
            <IconSymbol 
              name={icon || 'star.fill'} 
              size={28} 
              color={iconColor || theme.primary} 
            />
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    fontSize: 32,
  },
})
