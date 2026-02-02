import { FilterSortSimple } from '@/components/FilterSortSimple'
import { PokemonCard } from '@/components/PokemonCard'
import { FontSizes, Spacing, useTheme } from '@/constants/Theme'
import { usePokemonList } from '@/hooks/usePokemon'
import { FilterOptions, Pokemon, PokemonListItem } from '@/types/pokemon'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<PokemonListItem>)

export default function HomeScreen() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = usePokemonList(20)

  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    types: [],
    sortBy: 'number',
    sortDirection: 'asc'
  })
  const [detailedPokemon, setDetailedPokemon] = useState<Pokemon[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const pokemonList = data?.pages.flatMap(page => page.results) || []
  const scrollY = useSharedValue(0)
  const headerScale = useSharedValue(1)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
    onBeginDrag: () => {
      headerScale.value = withSpring(0.98, { damping: 20, stiffness: 300 })
    },
    onEndDrag: () => {
      headerScale.value = withSpring(1, { damping: 20, stiffness: 300 })
    },
  })

  // Load detailed Pokemon data for filtering (in batches to avoid network errors)
  useEffect(() => {
    const loadDetailedPokemon = async () => {
      if (pokemonList.length === 0 || isLoadingDetails) return
      
      // Check which Pokemon we haven't loaded yet
      const loadedNames = new Set(detailedPokemon.map(p => p.name))
      const toLoad = pokemonList.filter(item => !loadedNames.has(item.name))
      
      if (toLoad.length === 0) return
      
      setIsLoadingDetails(true)
      try {
        const { pokemonApi } = await import('@/services/pokemonApi')
        
        // Load in batches of 5 to avoid overwhelming the system
        const batchSize = 5
        const newResults: Pokemon[] = []
        
        for (let i = 0; i < toLoad.length; i += batchSize) {
          const batch = toLoad.slice(i, i + batchSize)
          const batchPromises = batch.map(item => {
            const id = item.url.split('/').filter(Boolean).pop()
            return pokemonApi.getPokemon(id!).catch(err => {
              console.warn(`Failed to load Pokemon ${item.name}:`, err.message)
              return null
            })
          })
          
          const batchResults = await Promise.all(batchPromises)
          newResults.push(...batchResults.filter((p): p is Pokemon => p !== null))
          
          // Delay between batches to avoid overwhelming the system
          if (i + batchSize < toLoad.length) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }
        }
        
        // Append new results to existing ones
        setDetailedPokemon(prev => [...prev, ...newResults])
        console.log(`Loaded ${newResults.length} new Pokemon (total: ${detailedPokemon.length + newResults.length})`)
      } catch (error) {
        console.error('Error loading detailed Pokemon:', error)
      } finally {
        setIsLoadingDetails(false)
      }
    }

    loadDetailedPokemon()
  }, [pokemonList.length])

  // Create a Map for O(1) lookup instead of O(n) find operations
  const pokemonMap = useMemo(() => {
    const map = new Map<string, Pokemon>()
    detailedPokemon.forEach(p => map.set(p.name, p))
    return map
  }, [detailedPokemon])

  // Filter and sort Pokemon with optimized logic
  const filteredAndSortedPokemon = useMemo(() => {
    const startTime = performance.now()
    
    let filtered = pokemonList

    // Apply type filters with Map lookup (O(1) instead of O(n))
    if (filters.types.length > 0 && pokemonMap.size > 0) {
      filtered = pokemonList.filter(item => {
        const pokemon = pokemonMap.get(item.name)
        if (!pokemon) return true // Keep Pokemon we haven't loaded yet
        return pokemon.types.some(t => filters.types.includes(t.type.name))
      })
    }

    // Apply sorting with optimized logic
    if (pokemonMap.size > 0) {
      filtered = [...filtered].sort((a, b) => {
        const pokemonA = pokemonMap.get(a.name)
        const pokemonB = pokemonMap.get(b.name)
        
        // If we don't have data for both, maintain current order
        if (!pokemonA || !pokemonB) {
          // For number sorting, we can use URL even without detailed data
          if (filters.sortBy === 'number') {
            const idA = parseInt(a.url.split('/').filter(Boolean).pop() || '0')
            const idB = parseInt(b.url.split('/').filter(Boolean).pop() || '0')
            const comparison = idA - idB
            return filters.sortDirection === 'asc' ? comparison : -comparison
          }
          return 0
        }

        let comparison = 0
        switch (filters.sortBy) {
          case 'number':
            comparison = pokemonA.id - pokemonB.id
            break
          case 'name':
            comparison = pokemonA.name.localeCompare(pokemonB.name)
            break
          case 'height':
            comparison = pokemonA.height - pokemonB.height
            break
          case 'weight':
            comparison = pokemonA.weight - pokemonB.weight
            break
        }

        return filters.sortDirection === 'asc' ? comparison : -comparison
      })
    } else if (filters.sortBy === 'number') {
      // For number sorting, we can use the URL which contains the ID
      filtered = [...filtered].sort((a, b) => {
        const idA = parseInt(a.url.split('/').filter(Boolean).pop() || '0')
        const idB = parseInt(b.url.split('/').filter(Boolean).pop() || '0')
        const comparison = idA - idB
        return filters.sortDirection === 'asc' ? comparison : -comparison
      })
    }

    const endTime = performance.now()
    console.log(`Filtering took ${(endTime - startTime).toFixed(2)}ms - ${filtered.length}/${pokemonList.length} Pokemon`)
    
    return filtered
  }, [pokemonList, pokemonMap, filters])

  const handleApplyFilters = useCallback((newFilters: FilterOptions) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setFilters(newFilters)
  }, [])

  const clearFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setFilters({
      types: [],
      sortBy: 'number',
      sortDirection: 'asc'
    })
  }

  const openFilterModal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setFilterModalVisible(true)
  }, [])

  const activeFiltersCount = useMemo(() => 
    filters.types.length + (filters.sortBy !== 'number' ? 1 : 0),
    [filters.types.length, filters.sortBy]
  )

  // Calculate filter statistics
  const filterStats = useMemo(() => {
    if (filters.types.length === 0) return null
    
    const totalLoaded = pokemonList.length
    const totalFiltered = filteredAndSortedPokemon.length
    const percentage = totalLoaded > 0 ? Math.round((totalFiltered / totalLoaded) * 100) : 0
    
    return {
      total: totalLoaded,
      filtered: totalFiltered,
      percentage,
      hidden: totalLoaded - totalFiltered
    }
  }, [pokemonList.length, filteredAndSortedPokemon.length, filters.types.length])

  console.log('Filter state:', { filterModalVisible, activeFiltersCount, filterStats })

  const headerAnimatedStyle = useAnimatedStyle(() => {
    'worklet'
    const opacity = Math.max(0.7, Math.min(1, interpolate(
      scrollY.value,
      [0, 50, 100],
      [1, 0.9, 0.7]
    )))
    const translateY = Math.max(-15, Math.min(0, interpolate(
      scrollY.value,
      [0, 100],
      [0, -15]
    )))
    const scale = Math.max(0.95, Math.min(1, interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.95]
    )))
    return {
      opacity,
      transform: [
        { translateY },
        { scale: headerScale.value * scale }
      ],
    }
  })

  const pokeballAnimatedStyle = useAnimatedStyle(() => {
    'worklet'
    const rotate = Math.max(0, Math.min(360, interpolate(
      scrollY.value,
      [0, 200],
      [0, 360]
    )))
    return {
      transform: [{ rotate: `${rotate}deg` }],
    }
  })

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

  const keyExtractor = useCallback((item: PokemonListItem) => item.name, [])

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null
    
    return (
      <View style={styles.footerLoader}>
        <View style={[styles.loaderContainer, { backgroundColor: theme.primary + '20' }]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
        <Text style={[styles.loadingText, { color: theme.gray }]}>Loading more Pokemon...</Text>
      </View>
    )
  }, [isFetchingNextPage, theme.primary, theme.gray])

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 136,
    offset: 136 * index,
    index,
  }), [])

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={[theme.primary + '20', theme.primary + '10', theme.background]}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.loadingContainer, { paddingTop: insets.top + 20 }]}>
            <View style={[styles.loadingIconContainer, { backgroundColor: theme.primary + '20' }]}>
              <Text style={styles.loadingEmoji}>⚪</Text>
            </View>
            <Text style={[styles.loadingTitle, { color: theme.text }]}>Loading Pokedex</Text>
            <Text style={[styles.loadingSubtitle, { color: theme.gray }]}>Discovering amazing Pokemon...</Text>
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
          </View>
        </LinearGradient>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.primary + '20', theme.primary + '10', theme.background]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ paddingTop: insets.top }}>
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Text style={[styles.title, { color: theme.text }]}>
                  Pokedex
                </Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.badgeText, { color: theme.primary }]}>
                      {filteredAndSortedPokemon.length} Pokemon
                    </Text>
                  </View>
                  {isLoadingDetails && (
                    <View style={[styles.badge, { backgroundColor: theme.warning + '20' }]}>
                      <ActivityIndicator size="small" color={theme.warning} />
                      <Text style={[styles.badgeText, { color: theme.warning, marginLeft: 4 }]}>
                        Loading...
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.headerActions}>
                <Animated.View style={[styles.pokeball, { backgroundColor: theme.primary + '15' }, pokeballAnimatedStyle]}>
                  <Text style={styles.pokeballText}>⚪</Text>
                </Animated.View>
                <Pressable 
                  onPress={openFilterModal}
                  hitSlop={12}
                  style={({ pressed }) => [
                    styles.filterButton, 
                    { 
                      backgroundColor: activeFiltersCount > 0 ? theme.primary : theme.primary + '15',
                      opacity: pressed ? 0.8 : 1,
                    }
                  ]}
                >
                  <Text style={styles.filterIcon}>
                    {activeFiltersCount > 0 ? '🎯' : '⚙️'}
                  </Text>
                  {activeFiltersCount > 0 && (
                    <View style={[styles.filterBadge, { backgroundColor: theme.danger }]}>
                      <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
            <Text style={[styles.subtitle, { color: theme.gray }]}>
              Discover and explore amazing Pokemon
            </Text>
          </Animated.View>
        </View>
        
        <AnimatedFlatList
          data={filteredAndSortedPokemon}
          renderItem={renderPokemonCard}
          keyExtractor={keyExtractor}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.primary}
              progressViewOffset={insets.top}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          removeClippedSubviews={true}
          maxToRenderPerBatch={6}
          updateCellsBatchingPeriod={50}
          initialNumToRender={6}
          windowSize={7}
          getItemLayout={getItemLayout}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        />
      </LinearGradient>

      <FilterSortSimple
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    marginBottom: Spacing.sm,
    letterSpacing: -1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    lineHeight: 22,
  },
  pokeball: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  pokeballText: {
    fontSize: 36,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  filterIcon: {
    fontSize: 24,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingEmoji: {
    fontSize: 48,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: Spacing.md,
  },
  loadingSubtitle: {
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  footerLoader: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  loaderContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: Spacing.sm,
  },
  filterBanner: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterBannerContent: {
    flex: 1,
  },
  filterBannerText: {
    fontSize: 14,
    fontWeight: '700',
  },
  filterBannerSubtext: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  clearButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },
})
