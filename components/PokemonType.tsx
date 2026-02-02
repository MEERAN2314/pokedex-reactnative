import { BorderRadius, Spacing } from '@/constants/Theme'
import { TYPE_COLORS } from '@/types/pokemon'
import React from 'react'
import { StyleSheet, Text } from 'react-native'
import Animated, { ZoomIn } from 'react-native-reanimated'

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
    <Animated.View 
      entering={ZoomIn.duration(300).delay(100)}
      style={[styles.container, sizeStyles[size], { backgroundColor }]}
    >
      <Text style={[styles.text, sizeStyles[size]]}>
        {type}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  text: {
    color: 'white',
    fontWeight: '700',
    textTransform: 'capitalize',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  small: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
  },
  medium: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontSize: 13,
  },
  large: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
})