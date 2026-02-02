import { useTheme } from '@/constants/Theme'
import { LinearGradient } from 'expo-linear-gradient'
import React, { ReactNode } from 'react'
import { StyleSheet } from 'react-native'

interface GradientBackgroundProps {
  children: ReactNode
  variant?: 'primary' | 'danger' | 'success' | 'info'
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  children, 
  variant = 'primary' 
}) => {
  const theme = useTheme()
  
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return [theme.primary + '15', theme.background, theme.background]
      case 'danger':
        return [theme.danger + '15', theme.background, theme.background]
      case 'success':
        return [theme.success + '15', theme.background, theme.background]
      case 'info':
        return [theme.info + '15', theme.background, theme.background]
      default:
        return [theme.primary + '15', theme.background, theme.background]
    }
  }

  return (
    <LinearGradient
      colors={getColors()}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.3 }}
    >
      {children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
})
