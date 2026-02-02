import { IconSymbol } from '@/components/ui/IconSymbol'
import { useTheme } from '@/constants/Theme'
import * as Haptics from 'expo-haptics'
import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
} from 'react-native-reanimated'

interface FloatingActionButtonProps {
  icon: string
  onPress: () => void
  color?: string
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  color,
}) => {
  const theme = useTheme()
  const scale = useSharedValue(1)
  const rotate = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 })
    rotate.value = withSequence(
      withSpring(10, { damping: 10, stiffness: 300 }),
      withSpring(0, { damping: 10, stiffness: 300 })
    )
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.button, { backgroundColor: color || theme.primary }]}
      >
        <IconSymbol name={icon} size={28} color="white" />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})
