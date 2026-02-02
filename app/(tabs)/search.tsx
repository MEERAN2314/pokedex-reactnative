import { PokemonCard } from '@/components/PokemonCard'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { BorderRadius, FontSizes, Spacing, useTheme } from '@/constants/Theme'
import { useSearchPokemon } from '@/hooks/usePokemon'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SearchScreen() {
  const theme = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  
  const { data: searchResults, isLoading, error } = useSearchPokemon(submittedQuery)

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery.trim().toLowerCase())
      Keyboard.dismiss()
    }
  }, [searchQuery])

  const handleClear = useCallback(() => {
    setSearchQuery('')
    setSubmittedQuery('')
  }, [])

  const renderPokemonCard = useCallback(({ item, index }: { item: any; index: number }) => (
    <PokemonCard
      key={item.name}
      name={item.name}
      url={`https://pokeapi.co/api/v2/pokemon/${item.id}/`}
      index={index}
    />
  ), [])

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.primary + '15', theme.background, theme.background]}
        style={styles.gradientBackground}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>
                  Search Pokemon
                </Text>
                <Text style={[styles.subtitle, { color: theme.gray }]}>
                  Find your favorite Pokemon by name
                </Text>
              </View>
              <View style={[styles.searchIcon, { backgroundColor: theme.primary + '20' }]}>
                <IconSymbol name="magnifyingglass" size={28} color={theme.primary} />
              </View>
            </View>
          </View>
        </SafeAreaView>

      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { 
          backgroundColor: theme.card, 
          borderColor: theme.primary + '30',
          shadowColor: theme.primary,
        }]}>
          <IconSymbol name="magnifyingglass" size={20} color={theme.gray} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Enter Pokemon name..."
            placeholderTextColor={theme.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <Pressable onPress={() => setSearchQuery('')}>
                <IconSymbol name="xmark.circle.fill" size={20} color={theme.gray} />
              </Pressable>
            </Animated.View>
          )}
        </View>
        
        <Pressable
          onPress={handleSearch}
          style={[styles.searchButton, { 
            backgroundColor: theme.primary,
            opacity: !searchQuery.trim() || isLoading ? 0.5 : 1,
            shadowColor: theme.primary,
          }]}
          disabled={!searchQuery.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.content}>
        {!submittedQuery && (
          <Animated.View 
            entering={FadeIn.duration(400)} 
            exiting={FadeOut.duration(200)}
            style={styles.emptyState}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
              <IconSymbol name="magnifyingglass" size={48} color={theme.gray} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Search for Pokemon
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.gray }]}>
              Try searching for "pikachu", "charizard", or any Pokemon name
            </Text>
          </Animated.View>
        )}

        {submittedQuery && isLoading && (
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={styles.loadingContainer}
          >
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.gray }]}>
              Searching for "{submittedQuery}"...
            </Text>
          </Animated.View>
        )}

        {submittedQuery && !isLoading && error && (
          <Animated.View 
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(200)}
            style={styles.emptyState}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.danger + '15' }]}>
              <IconSymbol name="exclamationmark.triangle" size={48} color={theme.danger} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.danger }]}>
              Pokemon not found
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.gray }]}>
              Try searching for a different Pokemon name
            </Text>
            <Pressable 
              onPress={handleClear}
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </Animated.View>
        )}

        {submittedQuery && !isLoading && searchResults && searchResults.length > 0 && (
          <Animated.View 
            entering={FadeIn.duration(400)}
            style={styles.resultsContainer}
          >
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsTitle, { color: theme.text }]}>
                Search Results
              </Text>
              <Pressable onPress={handleClear}>
                <Text style={[styles.clearText, { color: theme.primary }]}>Clear</Text>
              </Pressable>
            </View>
            <FlatList
              data={searchResults}
              renderItem={renderPokemonCard}
              keyExtractor={(item) => item.name}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          </Animated.View>
        )}
      </View>
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
  searchIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    paddingVertical: Spacing.sm,
  },
  searchButton: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonText: {
    color: 'white',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  content: {
    flex: 1,
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
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  retryButtonText: {
    color: 'white',
    fontSize: FontSizes.md,
    fontWeight: '600',
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
  resultsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  resultsTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
  },
  clearText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
})