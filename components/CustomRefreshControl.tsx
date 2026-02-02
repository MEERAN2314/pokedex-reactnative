import { useTheme } from '@/constants/Theme'
import React from 'react'
import { RefreshControl, RefreshControlProps } from 'react-native'

interface CustomRefreshControlProps extends Omit<RefreshControlProps, 'tintColor' | 'colors'> {
  refreshing: boolean
  onRefresh: () => void
}

export const CustomRefreshControl: React.FC<CustomRefreshControlProps> = ({
  refreshing,
  onRefresh,
  ...props
}) => {
  const theme = useTheme()

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={theme.primary}
      colors={[theme.primary, theme.success, theme.info]}
      progressBackgroundColor={theme.card}
      {...props}
    />
  )
}
