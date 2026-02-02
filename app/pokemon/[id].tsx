import { PokemonType } from '@/components/PokemonType'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { BorderRadius, FontSizes, Spacing, useTheme } from '@/constants/Theme'
import { usePokemon, usePokemonSpecies } from '@/hooks/usePokemon'
import { TYPE_COLORS } from '@/types/pokemon'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  Easing,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

const FAVORITES_KEY = 'pokemon_favorites'

export default function PokemonDetailScreen() {
  const theme = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: pokemon, isLoading } = usePokemon(id!)
  const { data: species } = usePokemonSpecies(id!)
  const [isFavorite, setIsFavorite] = useState(false)

  const scrollY = useSharedValue(0)
  const headerOpacity = useSharedValue(0)
  const imageScale = useSharedValue(0.5)
  const imageRotate = useSharedValue(0)
  const contentTranslateY = useSharedValue(50)
  const heartScale = useSharedValue(1)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  useEffect(() => {
    if (pokemon) {
      headerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
      imageScale.value = withSpring(1, { damping: 18, stiffness: 120 })
      imageRotate.value = withSpring(360, { damping: 20, stiffness: 80 })
      contentTranslateY.value = withDelay(200, withSpring(0, { damping: 20, stiffness: 100 }))
      checkIfFavorite()
    }
  }, [pokemon])

  const checkIfFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY)
      if (favorites) {
        const favoritesArray = JSON.parse(favorites)
        setIsFavorite(favoritesArray.includes(pokemon?.name))
      }
    } catch (error) {
      console.error('Error checking favorites:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!pokemon) return
    
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY)
      let favoritesArray = favorites ? JSON.parse(favorites) : []
      
      if (isFavorite) {
        favoritesArray = favoritesArray.filter((name: string) => name !== pokemon.name)
        setIsFavorite(false)
      } else {
        favoritesArray.push(pokemon.name)
        setIsFavorite(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      }
      
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesArray))
      
      // Animate heart
      heartScale.value = withSpring(1.3, { damping: 10, stiffness: 300 }, () => {
        heartScale.value = withSpring(1, { damping: 10, stiffness: 300 })
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0])
    return {
      opacity: headerOpacity.value * opacity,
    }
  })

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [0, 200], [1, 0.8], 'clamp')
    const translateY = interpolate(scrollY.value, [0, 200], [0, -50], 'clamp')
    const rotate = interpolate(imageRotate.value, [0, 360], [0, 360])
    
    return {
      transform: [
        { scale: imageScale.value * scale },
        { translateY },
        { rotate: `${rotate}deg` }
      ],
    }
  })

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }))

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }))

  const headerBlurStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [0, 1], 'clamp')
    return { opacity }
  })

  if (isLoading || !pokemon) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={[theme.primary + '20', theme.background, theme.background]}
          style={styles.loadingGradient}
        >
          <SafeAreaView style={styles.loadingContainer}>
            <View style={[styles.loadingIconContainer, { backgroundColor: theme.primary + '20' }]}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
            <Text style={[styles.loadingText, { color: theme.gray }]}>Loading Pokemon...</Text>
          </SafeAreaView>
        </LinearGradient>
      </View>
    )
  }

  const primaryType = pokemon.types[0]?.type.name
  const backgroundColor = TYPE_COLORS[primaryType] || '#A8A878'
  const description = species?.flavor_text_entries
    ?.find((entry: any) => entry.language.name === 'en')
    ?.flavor_text?.replace(/\f/g, ' ')

  return (
    <View style={styles.container}>
      <Animated.ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <LinearGradient
          colors={[backgroundColor, backgroundColor + 'DD', backgroundColor + '99', theme.background]}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']}>
            <Animated.View style={[headerAnimatedStyle, styles.header]}>
              <View style={styles.headerTop}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                  {Platform.OS === 'ios' ? (
                    <BlurView intensity={80} tint="light" style={styles.blurButton}>
                      <IconSymbol name="chevron.left" size={24} color="white" />
                    </BlurView>
                  ) : (
                    <View style={[styles.backButtonInner, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                      <IconSymbol name="chevron.left" size={24} color="white" />
                    </View>
                  )}
                </Pressable>
                <View style={styles.headerRight}>
                  <View style={[styles.pokemonNumber, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                    <Text style={styles.pokemonNumberText}>
                      #{pokemon.id.toString().padStart(3, '0')}
                    </Text>
                  </View>
                  <Pressable onPress={toggleFavorite} style={styles.favoriteButton}>
                    {Platform.OS === 'ios' ? (
                      <BlurView intensity={80} tint="light" style={styles.blurButton}>
                        <Animated.View style={heartAnimatedStyle}>
                          <IconSymbol 
                            name={isFavorite ? "heart.fill" : "heart"} 
                            size={24} 
                            color="white" 
                          />
                        </Animated.View>
                      </BlurView>
                    ) : (
                      <View style={[styles.favoriteButtonInner, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                        <Animated.View style={heartAnimatedStyle}>
                          <IconSymbol 
                            name={isFavorite ? "heart.fill" : "heart"} 
                            size={24} 
                            color="white" 
                          />
                        </Animated.View>
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>

              <Text style={styles.pokemonName}>
                {pokemon.name}
              </Text>

              <View style={styles.typesContainer}>
                {pokemon.types.map((type) => (
                  <PokemonType key={type.type.name} type={type.type.name} size="medium" />
                ))}
              </View>

              <View style={styles.imageContainer}>
                <Animated.View style={imageAnimatedStyle}>
                  <Image
                    source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
                    style={styles.pokemonImage}
                    contentFit="contain"
                    transition={500}
                    cachePolicy="memory-disk"
                  />
                </Animated.View>
              </View>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>

        <Animated.View style={[contentAnimatedStyle, styles.content]}>
          {description && (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: backgroundColor + '20' }]}>
                  <Text style={{ fontSize: 20 }}>📖</Text>
                </View>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  About
                </Text>
              </View>
              <Text style={[styles.description, { color: theme.gray }]}>
                {description}
              </Text>
            </View>
          )}

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: backgroundColor + '20' }]}>
                <Text style={{ fontSize: 20 }}>📏</Text>
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Physical Stats
              </Text>
            </View>
            <View style={styles.statsRow}>
              <View style={[styles.statItem, { backgroundColor: backgroundColor + '10' }]}>
                <Text style={[styles.statValue, { color: backgroundColor }]}>
                  {pokemon.height / 10}m
                </Text>
                <Text style={[styles.statLabel, { color: theme.gray }]}>Height</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: backgroundColor + '10' }]}>
                <Text style={[styles.statValue, { color: backgroundColor }]}>
                  {pokemon.weight / 10}kg
                </Text>
                <Text style={[styles.statLabel, { color: theme.gray }]}>Weight</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: backgroundColor + '10' }]}>
                <Text style={[styles.statValue, { color: backgroundColor }]}>
                  {pokemon.base_experience}
                </Text>
                <Text style={[styles.statLabel, { color: theme.gray }]}>Base Exp</Text>
              </View>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: backgroundColor + '20' }]}>
                <Text style={{ fontSize: 20 }}>⚡</Text>
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Base Stats
              </Text>
            </View>
            <View style={styles.baseStatsContainer}>
              {pokemon.stats.map((stat, index) => {
                const statName = stat.stat.name
                  .replace('-', ' ')
                  .replace(/\b\w/g, l => l.toUpperCase())
                const percentage = (stat.base_stat / 255) * 100

                return (
                  <View key={stat.stat.name} style={styles.statRow}>
                    <View style={styles.statInfo}>
                      <Text style={[styles.statName, { color: theme.text }]}>
                        {statName}
                      </Text>
                      <Text style={[styles.statNumber, { color: backgroundColor }]}>
                        {stat.base_stat}
                      </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: backgroundColor + '15' }]}>
                      <Animated.View 
                        style={[
                          styles.progressFill, 
                          { 
                            backgroundColor,
                            width: `${percentage}%`,
                          }
                        ]} 
                      />
                    </View>
                  </View>
                )
              })}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: backgroundColor + '20' }]}>
                <Text style={{ fontSize: 20 }}>✨</Text>
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Abilities
              </Text>
            </View>
            <View style={styles.abilitiesContainer}>
              {pokemon.abilities.map((ability) => (
                <View 
                  key={ability.ability.name} 
                  style={[styles.abilityChip, { backgroundColor: backgroundColor + '15', borderColor: backgroundColor + '30' }]}
                >
                  <Text style={[styles.abilityName, { color: theme.text }]}>
                    {ability.ability.name.replace('-', ' ')}
                  </Text>
                  {ability.is_hidden && (
                    <View style={[styles.hiddenBadge, { backgroundColor: backgroundColor }]}>
                      <Text style={styles.hiddenLabel}>Hidden</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    minHeight: 420,
  },
  header: {
    padding: Spacing.md,
    paddingTop: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButton: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  blurButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pokemonNumber: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pokemonNumberText: {
    fontSize: FontSizes.md,
    color: 'white',
    fontWeight: 'bold',
  },
  favoriteButton: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  favoriteButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pokemonName: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    textTransform: 'capitalize',
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  pokemonImage: {
    width: 220,
    height: 220,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: 40,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
  },
  description: {
    fontSize: FontSizes.md,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  baseStatsContainer: {
    gap: Spacing.md,
  },
  statRow: {
    gap: Spacing.sm,
  },
  statInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    minWidth: 120,
  },
  statNumber: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
  },
  progressBar: {
    height: 10,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.md,
  },
  abilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  abilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  abilityName: {
    fontSize: FontSizes.md,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  hiddenBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  hiddenLabel: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
})