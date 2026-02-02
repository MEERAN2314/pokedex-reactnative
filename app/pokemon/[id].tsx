import { PokemonType } from '@/components/PokemonType'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { BorderRadius, FontSizes, Spacing, useTheme } from '@/constants/Theme'
import { usePokemon, usePokemonSpecies } from '@/hooks/usePokemon'
import { TYPE_COLORS } from '@/types/pokemon'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

const FAVORITES_KEY = 'pokemon_favorites'

export default function PokemonDetailScreen() {
  const theme = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: pokemon, isLoading } = usePokemon(id!)
  const { data: species } = usePokemonSpecies(id!)
  const [isFavorite, setIsFavorite] = useState(false)

  const headerOpacity = useSharedValue(0)
  const imageScale = useSharedValue(0)
  const contentTranslateY = useSharedValue(100)
  const heartScale = useSharedValue(1)

  useEffect(() => {
    if (pokemon) {
      headerOpacity.value = withTiming(1, { duration: 800 })
      imageScale.value = withSpring(1, { damping: 15, stiffness: 150 })
      contentTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 })
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

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }))

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }))

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }))

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }))

  if (isLoading || !pokemon) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.gray }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const primaryType = pokemon.types[0]?.type.name
  const backgroundColor = TYPE_COLORS[primaryType] || '#A8A878'
  const description = species?.flavor_text_entries
    ?.find((entry: any) => entry.language.name === 'en')
    ?.flavor_text?.replace(/\f/g, ' ')

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[backgroundColor, backgroundColor + '80', '#ffffff']}
          style={styles.headerGradient}
        >
          <Animated.View style={[headerAnimatedStyle, styles.header]}>
            <View style={styles.headerTop}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <IconSymbol name="chevron.left" size={24} color="white" />
              </Pressable>
              <View style={styles.headerRight}>
                <Text style={styles.pokemonNumber}>
                  #{pokemon.id.toString().padStart(3, '0')}
                </Text>
                <Pressable onPress={toggleFavorite} style={styles.favoriteButton}>
                  <Animated.View style={heartAnimatedStyle}>
                    <IconSymbol 
                      name={isFavorite ? "heart.fill" : "heart"} 
                      size={24} 
                      color="white" 
                    />
                  </Animated.View>
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
                  source={{
                    uri: pokemon.sprites.other['official-artwork'].front_default ||
                         pokemon.sprites.front_default
                  }}
                  style={styles.pokemonImage}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
          </Animated.View>
        </LinearGradient>

        <Animated.View style={[contentAnimatedStyle, styles.content]}>
          {description && (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                About
              </Text>
              <Text style={[styles.description, { color: theme.gray }]}>
                {description}
              </Text>
            </View>
          )}

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Physical Stats
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: backgroundColor }]}>
                  {pokemon.height / 10}m
                </Text>
                <Text style={[styles.statLabel, { color: theme.gray }]}>Height</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: backgroundColor }]}>
                  {pokemon.weight / 10}kg
                </Text>
                <Text style={[styles.statLabel, { color: theme.gray }]}>Weight</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: backgroundColor }]}>
                  {pokemon.base_experience}
                </Text>
                <Text style={[styles.statLabel, { color: theme.gray }]}>Base Exp</Text>
              </View>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Base Stats
            </Text>
            <View style={styles.baseStatsContainer}>
              {pokemon.stats.map((stat) => {
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
                    <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { backgroundColor, width: `${percentage}%` }
                        ]} 
                      />
                    </View>
                  </View>
                )
              })}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Abilities
            </Text>
            <View style={styles.abilitiesContainer}>
              {pokemon.abilities.map((ability) => (
                <View key={ability.ability.name} style={styles.abilityRow}>
                  <Text style={[styles.abilityName, { color: theme.text }]}>
                    {ability.ability.name.replace('-', ' ')}
                  </Text>
                  {ability.is_hidden && (
                    <Text style={[styles.hiddenLabel, { color: theme.gray }]}>
                      (Hidden)
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    minHeight: 400,
  },
  header: {
    padding: Spacing.md,
    paddingTop: Spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pokemonNumber: {
    fontSize: FontSizes.sm,
    color: 'white',
    fontWeight: 'bold',
  },
  favoriteButton: {
    padding: Spacing.xs,
  },
  pokemonName: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'capitalize',
    marginBottom: Spacing.sm,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  imageContainer: {
    alignItems: 'center',
  },
  pokemonImage: {
    width: 200,
    height: 200,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  cardTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: FontSizes.sm,
  },
  baseStatsContainer: {
    gap: 12,
  },
  statRow: {
    gap: Spacing.sm,
  },
  statInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statName: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    minWidth: 120,
  },
  statNumber: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  abilitiesContainer: {
    gap: Spacing.sm,
  },
  abilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  abilityName: {
    fontSize: FontSizes.md,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  hiddenLabel: {
    fontSize: FontSizes.sm,
    fontStyle: 'italic',
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
})