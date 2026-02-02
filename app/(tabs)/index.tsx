import { PokemonCard } from '@/components/PokemonCard'
import { FontSizes, Spacing, useTheme } from '@/constants/Theme'
import { usePokemonList } from '@/hooks/usePokemon'
import { PokemonListItem } from '@/types/pokemon'
import React, { useCallback } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  const theme = useTheme()
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = usePokemonList(20)

  const pokemonList = data?.pages.flatMap(page => page.results) || []

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const renderPokemonCard = useCallback(({ item, index }: { item: PokemonListItem; index: number }) => (
    <PokemonCard
      key={item.name}
      name={item.name}
      url={item.url}
      index={index}
    />
  ), [])

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    )
  }, [isFetchingNextPage, theme.primary])

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.gray }]}>Loading Pokemon...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Pokedex
        </Text>
        <Text style={[styles.subtitle, { color: theme.gray }]}>
          Discover amazing Pokemon
        </Text>
      </View>
      
      <FlatList
        data={pokemonList}
        renderItem={renderPokemonCard}
        keyExtractor={(item) => item.name}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
  },
  loadingText: {
    fontSize: FontSizes.lg,
    marginTop: Spacing.md,
  },
  footerLoader: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  listContent: {
    paddingBottom: 100,
  },
})