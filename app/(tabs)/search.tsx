import { PokemonCard } from '@/components/PokemonCard'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { BorderRadius, FontSizes, Spacing, useTheme } from '@/constants/Theme'
import { useSearchPokemon } from '@/hooks/usePokemon'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SearchScreen() {
  const theme = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  
  const { data: searchResults, isLoading, error } = useSearchPokemon(submittedQuery)

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery.trim().toLowerCase())
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Search Pokemon
        </Text>
        <Text style={[styles.subtitle, { color: theme.gray }]}>
          Find your favorite Pokemon by name
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: theme.card, 
            borderColor: theme.border,
            color: theme.text 
          }]}
          placeholder="Enter Pokemon name..."
          placeholderTextColor={theme.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          onPress={handleSearch}
          style={[styles.searchButton, { backgroundColor: theme.primary }]}
          disabled={!searchQuery.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <IconSymbol name="magnifyingglass" size={20} color="white" />
          )}
        </Pressable>
        {submittedQuery && (
          <Pressable
            onPress={handleClear}
            style={[styles.clearButton, { backgroundColor: theme.card }]}
          >
            <IconSymbol name="xmark" size={20} color={theme.text} />
          </Pressable>
        )}
      </View>

      <View style={styles.content}>
        {!submittedQuery && (
          <View style={styles.emptyState}>
            <IconSymbol name="magnifyingglass" size={64} color={theme.gray} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Search for Pokemon
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.gray }]}>
              Try searching for "pikachu", "charizard", or any Pokemon name
            </Text>
          </View>
        )}

        {submittedQuery && isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.gray }]}>
              Searching for "{submittedQuery}"...
            </Text>
          </View>
        )}

        {submittedQuery && !isLoading && error && (
          <View style={styles.emptyState}>
            <IconSymbol name="exclamationmark.triangle" size={64} color={theme.danger} />
            <Text style={[styles.emptyTitle, { color: theme.danger }]}>
              Pokemon not found
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.gray }]}>
              Try searching for a different Pokemon name
            </Text>
          </View>
        )}

        {submittedQuery && !isLoading && searchResults && searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsTitle, { color: theme.text }]}>
              Search Results
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderPokemonCard}
              keyExtractor={(item) => item.name}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          </View>
        )}
      </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: FontSizes.md,
  },
  searchButton: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  resultsTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 100,
  },
})