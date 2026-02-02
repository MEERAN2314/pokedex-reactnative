import { HapticTab } from '@/components/HapticTab'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import { BlurView } from 'expo-blur'
import { Tabs } from 'expo-router'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'

const AnimatedTabIcon = ({ name, color, focused }: { name: any; color: string; focused: boolean }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(focused ? 1.15 : 1, { damping: 15, stiffness: 200 }) },
        { translateY: withSpring(focused ? -2 : 0, { damping: 15, stiffness: 200 }) },
      ],
    }
  })

  return (
    <Animated.View style={animatedStyle}>
      <IconSymbol size={26} name={name} color={color} />
    </Animated.View>
  )
}

export default function TabLayout() {
  const colorScheme = useColorScheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={100}
              tint={colorScheme === 'dark' ? 'dark' : 'light'}
              style={[StyleSheet.absoluteFill, styles.tabBarBackground]}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.tabBarBackgroundAndroid, {
              backgroundColor: colorScheme === 'dark' ? 'rgba(26, 31, 38, 0.95)' : 'rgba(255, 255, 255, 0.95)'
            }]} />
          )
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pokedex',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="list.bullet" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="heart.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="magnifyingglass" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBarBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  tabBarBackgroundAndroid: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
})