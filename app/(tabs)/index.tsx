import { PokemonCard } from '@/components/PokemonCard'
import { FontSizes, Spacing, useTheme } from '@/constants/Theme'
import { usePokemonList } from '@/hooks/usePokemon'
import { PokemonListItem } from '@/types/pokemon'
import { LinearGradient } from 'expo-linear-gradient'
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

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 136,
    offset: 136 * index,
    index,
  }), [])

  if (isLoading) {
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
                    Pokedex
                  </Text>
                  <Text style={[styles.subtitle, { color: theme.gray }]}>
                    Discover amazing Pokemon
                  </Text>
                </View>
                <View style={[styles.pokeball, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={styles.pokeballText}>⚪</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.gray }]}>Loading Pokemon...</Text>
          </View>
        </LinearGradient>
      </View>
    )
  }

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
                  Pokedex
                </Text>
                <Text style={[styles.subtitle, { color: theme.gray }]}>
                  Discover amazing Pokemon
                </Text>
              </View>
              <View style={[styles.pokeball, { backgroundColor: theme.primary + '20' }]}>
                <Text style={styles.pokeballText}>⚪</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
        
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
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          getItemLayout={getItemLayout}
        />
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
  pokeball: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pokeballText: {
    fontSize: 32,
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