import { PokemonCard } from '@/components/PokemonCard'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { BorderRadius, FontSizes, Spacing, useTheme } from '@/constants/Theme'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const FAVORITES_KEY = 'pokemon_favorites'

export default function FavoritesScreen() {
  const theme = useTheme()
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
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
      await AsyncStorage.removeItem(FAVORITES_KEY)
      setFavorites([])
    } catch (error) {
      console.error('Error clearing favorites:', error)
    }
  }

  const renderPokemonCard = ({ item, index }: { item: string; index: number }) => (
    <PokemonCard
      key={item}
      name={item}
      url={`https://pokeapi.co/api/v2/pokemon/${item}/`}
      index={index}
    />
  )

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.gray }]}>Loading favorites...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Favorites
        </Text>
        <Text style={[styles.subtitle, { color: theme.gray }]}>
          Your favorite Pokemon collection
        </Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
            <IconSymbol name="heart" size={40} color={theme.gray} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No favorites yet
          </Text>
          <Text style={[styles.emptyDescription, { color: theme.gray }]}>
            Add Pokemon to your favorites by tapping the heart icon on their detail page
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <Text style={[styles.statsText, { color: theme.gray }]}>
              {favorites.length} Pokemon in your collection
            </Text>
            <Pressable
              onPress={clearAllFavorites}
              style={[styles.clearButton, { backgroundColor: theme.danger }]}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </Pressable>
          </View>
          
          <FlatList
            data={favorites}
            renderItem={renderPokemonCard}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
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
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsText: {
    fontSize: FontSizes.md,
  },
  clearButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
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