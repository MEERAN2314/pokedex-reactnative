import { PokemonCard } from '@/components/PokemonCard'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { BorderRadius, FontSizes, Spacing, useTheme } from '@/constants/Theme'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

const FAVORITES_KEY = 'pokemon_favorites'

export default function FavoritesScreen() {
  const theme = useTheme()
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
    
    // Refresh favorites when screen comes into focus
    const interval = setInterval(loadFavorites, 1000)
    return () => clearInterval(interval)
  }, [])

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY)
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearAllFavorites = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      await AsyncStorage.removeItem(FAVORITES_KEY)
      setFavorites([])
    } catch (error) {
      console.error('Error clearing favorites:', error)
    }
  }

  const renderPokemonCard = useCallback(({ item, index }: { item: string; index: number }) => (
    <PokemonCard
      key={item}
      name={item}
      url={`https://pokeapi.co/api/v2/pokemon/${item}/`}
      index={index}
    />
  ), [])

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={[theme.danger + '15', theme.background, theme.background]}
          style={styles.gradientBackground}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View>
                  <Text style={[styles.title, { color: theme.text }]}>
                    Favorites
                  </Text>
                  <Text style={[styles.subtitle, { color: theme.gray }]}>
                    Your favorite Pokemon collection
                  </Text>
                </View>
                <View style={[styles.heartIcon, { backgroundColor: theme.danger + '20' }]}>
                  <IconSymbol name="heart.fill" size={28} color={theme.danger} />
                </View>
              </View>
            </View>
          </SafeAreaView>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.gray }]}>Loading favorites...</Text>
          </View>
        </LinearGradient>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.danger + '15', theme.background, theme.background]}
        style={styles.gradientBackground}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>
                  Favorites
                </Text>
                <Text style={[styles.subtitle, { color: theme.gray }]}>
                  Your favorite Pokemon collection
                </Text>
              </View>
              <View style={[styles.heartIcon, { backgroundColor: theme.danger + '20' }]}>
                <IconSymbol name="heart.fill" size={28} color={theme.danger} />
              </View>
            </View>
          </View>
        </SafeAreaView>

      {favorites.length === 0 ? (
        <Animated.View 
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(200)}
          style={styles.emptyState}
        >
          <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
            <IconSymbol name="heart" size={48} color={theme.gray} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No favorites yet
          </Text>
          <Text style={[styles.emptyDescription, { color: theme.gray }]}>
            Add Pokemon to your favorites by tapping the heart icon on their detail page
          </Text>
        </Animated.View>
      ) : (
        <Animated.View 
          entering={FadeInDown.duration(400)}
          style={styles.content}
        >
          <View style={styles.statsContainer}>
            <View style={[styles.statsBadge, { backgroundColor: theme.primary + '15' }]}>
              <IconSymbol name="heart.fill" size={16} color={theme.primary} />
              <Text style={[styles.statsText, { color: theme.primary }]}>
                {favorites.length} Pokemon
              </Text>
            </View>
            <Pressable
              onPress={clearAllFavorites}
              style={[styles.clearButton, { backgroundColor: theme.danger }]}
            >
              <IconSymbol name="trash" size={16} color="white" />
              <Text style={styles.clearButtonText}>Clear All</Text>
            </Pressable>
          </View>
          
          <FlatList
            data={favorites}
            renderItem={renderPokemonCard}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
          />
        </Animated.View>
      )}
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
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
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  heartIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSizes.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  statsText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  clearButtonText: {
    color: 'white',
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
})