import { BorderRadius, Spacing } from '@/constants/Theme'
import { TYPE_COLORS } from '@/types/pokemon'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface PokemonTypeProps {
  type: string
  size?: 'small' | 'medium' | 'large'
}

export const PokemonType: React.FC<PokemonTypeProps> = ({ type, size = 'small' }) => {
  const backgroundColor = TYPE_COLORS[type] || '#A8A878'
  
  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  }

  return (
    <View style={[styles.container, sizeStyles[size], { backgroundColor }]}>
      <Text style={[styles.text, sizeStyles[size]]}>
        {type}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  text: {
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  small: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: 12,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
  },
  large: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
})