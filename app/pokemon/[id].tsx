import { EvolutionChainImproved } from '@/components/EvolutionChainImproved'
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
  Extrapolate,
  FadeInRight,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const FAVORITES_KEY = 'pokemon_favorites'

export default function PokemonDetailScreen() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
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
      // Smoother, faster entrance animations
      headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
      imageScale.value = withSpring(1, { damping: 15, stiffness: 150 })
      imageRotate.value = withSequence(
        withSpring(360, { damping: 18, stiffness: 100 }),
        withSpring(0, { damping: 18, stiffness: 100 })
      )
      contentTranslateY.value = withDelay(150, withSpring(0, { damping: 18, stiffness: 120 }))
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
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0], Extrapolate.CLAMP)
    return {
      opacity: headerOpacity.value * opacity,
    }
  })

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [0, 200], [1, 0.7], Extrapolate.CLAMP)
    const translateY = interpolate(scrollY.value, [0, 200], [0, -50], Extrapolate.CLAMP)
    const rotate = interpolate(imageRotate.value, [0, 360], [0, 360])
    
    return {
      transform: [
        { scale: imageScale.value * scale },
        { translateY },
        { rotate: `${rotate}deg` }
      ],
    }
  })

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [contentTranslateY.value, contentTranslateY.value - 10],
      Extrapolate.CLAMP
    )
    return {
      transform: [{ translateY }],
    }
  })

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }))

  const headerBlurStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [0, 1], Extrapolate.CLAMP)
    return { opacity }
  })

  const gradientAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 300], [0, -100], Extrapolate.CLAMP)
    return {
      transform: [{ translateY }],
    }
  })

  if (isLoading || !pokemon) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={[theme.primary + '25', theme.primary + '15', theme.background]}
          style={styles.loadingGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.loadingContainer, { paddingTop: insets.top + 40 }]}>
            <View style={[styles.loadingIconContainer, { backgroundColor: theme.primary + '20' }]}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
            <Text style={[styles.loadingText, { color: theme.text }]}>Loading Pokemon...</Text>
            <Text style={[styles.loadingSubtext, { color: theme.gray }]}>Please wait</Text>
          </View>
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
        decelerationRate="normal"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        removeClippedSubviews={false}
        overScrollMode="never"
      >
        <Animated.View style={gradientAnimatedStyle}>
          <LinearGradient
            colors={[backgroundColor, backgroundColor + 'DD', backgroundColor + '99', theme.background]}
            style={[styles.headerGradient, { paddingTop: insets.top }]}
          >
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
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[contentAnimatedStyle, styles.content]}>
          {/* Hero Stats Card */}
          <View style={[styles.heroCard, { backgroundColor: theme.card }]}>
            <View style={styles.heroStatsGrid}>
              <View style={[styles.heroStatItem, { borderRightWidth: 1, borderColor: theme.border }]}>
                <View style={[styles.heroStatIcon, { backgroundColor: backgroundColor + '15' }]}>
                  <Text style={styles.heroStatEmoji}>📏</Text>
                </View>
                <Text style={[styles.heroStatValue, { color: backgroundColor }]}>
                  {pokemon.height / 10}m
                </Text>
                <Text style={[styles.heroStatLabel, { color: theme.gray }]}>Height</Text>
              </View>
              <View style={[styles.heroStatItem, { borderRightWidth: 1, borderColor: theme.border }]}>
                <View style={[styles.heroStatIcon, { backgroundColor: backgroundColor + '15' }]}>
                  <Text style={styles.heroStatEmoji}>⚖️</Text>
                </View>
                <Text style={[styles.heroStatValue, { color: backgroundColor }]}>
                  {pokemon.weight / 10}kg
                </Text>
                <Text style={[styles.heroStatLabel, { color: theme.gray }]}>Weight</Text>
              </View>
              <View style={styles.heroStatItem}>
                <View style={[styles.heroStatIcon, { backgroundColor: backgroundColor + '15' }]}>
                  <Text style={styles.heroStatEmoji}>⭐</Text>
                </View>
                <Text style={[styles.heroStatValue, { color: backgroundColor }]}>
                  {pokemon.base_experience}
                </Text>
                <Text style={[styles.heroStatLabel, { color: theme.gray }]}>Base XP</Text>
              </View>
            </View>
          </View>

          {/* Description Card */}
          {description && (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: backgroundColor + '20' }]}>
                  <Text style={{ fontSize: 22 }}>📖</Text>
                </View>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  About {pokemon.name}
                </Text>
              </View>
              <Text style={[styles.description, { color: theme.gray }]}>
                {description}
              </Text>
            </View>
          )}

          {/* Abilities Card */}
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: backgroundColor + '20' }]}>
                <Text style={{ fontSize: 22 }}>✨</Text>
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Abilities
              </Text>
            </View>
            <View style={styles.abilitiesContainer}>
              {pokemon.abilities.map((ability, index) => (
                <View 
                  key={ability.ability.name} 
                  style={[
                    styles.abilityChip, 
                    { 
                      backgroundColor: backgroundColor + '15', 
                      borderColor: backgroundColor + '40',
                      borderWidth: 2
                    }
                  ]}
                >
                  <View style={[styles.abilityNumber, { backgroundColor: backgroundColor }]}>
                    <Text style={styles.abilityNumberText}>{index + 1}</Text>
                  </View>
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

          {/* Base Stats Card */}
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: backgroundColor + '20' }]}>
                <Text style={{ fontSize: 22 }}>⚡</Text>
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
                const statColor = 
                  stat.base_stat >= 100 ? '#10B981' :
                  stat.base_stat >= 70 ? '#3B82F6' :
                  stat.base_stat >= 50 ? '#F59E0B' : '#EF4444'

                return (
                  <Animated.View 
                    key={stat.stat.name} 
                    entering={FadeInRight.delay(index * 50).duration(400)}
                    style={styles.statRow}
                  >
                    <View style={styles.statInfo}>
                      <View style={styles.statNameContainer}>
                        <View style={[styles.statDot, { backgroundColor: statColor }]} />
                        <Text style={[styles.statName, { color: theme.text }]}>
                          {statName}
                        </Text>
                      </View>
                      <Text style={[styles.statNumber, { color: statColor }]}>
                        {stat.base_stat}
                      </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                      <Animated.View 
                        entering={FadeInRight.delay(index * 50 + 100).duration(600)}
                        style={[
                          styles.progressFill, 
                          { 
                            backgroundColor: statColor,
                            width: `${percentage}%`,
                          }
                        ]} 
                      />
                    </View>
                  </Animated.View>
                )
              })}
            </View>
            
            {/* Total Stats */}
            <View style={[styles.totalStats, { backgroundColor: backgroundColor + '10', borderColor: backgroundColor + '30' }]}>
              <Text style={[styles.totalStatsLabel, { color: theme.gray }]}>Total Stats</Text>
              <Text style={[styles.totalStatsValue, { color: backgroundColor }]}>
                {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
              </Text>
            </View>
          </View>

          {/* Evolution Chain */}
          {species?.evolution_chain?.url && (
            <EvolutionChainImproved
              evolutionChainUrl={species.evolution_chain.url}
              currentPokemonName={pokemon.name}
              primaryColor={backgroundColor}
            />
          )}
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
    minHeight: 440,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    overflow: 'hidden',
    borderRadius: 22,
  },
  blurButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pokemonNumber: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  pokemonNumberText: {
    fontSize: FontSizes.md,
    color: 'white',
    fontWeight: '800',
  },
  favoriteButton: {
    overflow: 'hidden',
    borderRadius: 22,
  },
  favoriteButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  pokemonName: {
    fontSize: 42,
    fontWeight: '900',
    color: 'white',
    textTransform: 'capitalize',
    marginBottom: Spacing.md,
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  pokemonImage: {
    width: 240,
    height: 240,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  heroStatsGrid: {
    flexDirection: 'row',
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  heroStatIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  heroStatEmoji: {
    fontSize: 24,
  },
  heroStatValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  heroStatLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    padding: Spacing.xl,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: FontSizes.md,
    lineHeight: 26,
    fontWeight: '500',
  },
  baseStatsContainer: {
    gap: Spacing.lg,
  },
  statRow: {
    gap: Spacing.sm,
  },
  statInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    minWidth: 50,
    textAlign: 'right',
  },
  progressBar: {
    height: 14,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  totalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 2,
  },
  totalStatsLabel: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  totalStatsValue: {
    fontSize: 32,
    fontWeight: '900',
  },
  abilitiesContainer: {
    gap: Spacing.md,
  },
  abilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
    gap: Spacing.md,
  },
  abilityNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  abilityNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
  },
  abilityName: {
    flex: 1,
    fontSize: FontSizes.lg,
    textTransform: 'capitalize',
    fontWeight: '700',
  },
  hiddenBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 12,
  },
  hiddenLabel: {
    fontSize: 11,
    color: 'white',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  loadingIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingText: {
    fontSize: 22,
    fontWeight: '800',
  },
  loadingSubtext: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
})