import { BorderRadius, Spacing, useTheme } from '@/constants/Theme'
import { usePokemon } from '@/hooks/usePokemon'
import { TYPE_COLORS } from '@/types/pokemon'
import * as Haptics from 'expo-haptics'
import { Image as ExpoImage } from 'expo-image'
import { router } from 'expo-router'
import React, { memo, useEffect } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming
} from 'react-native-reanimated'
import { PokemonType } from './PokemonType'

interface PokemonCardProps {
  name: string
  url: string
  index: number
}

const PokemonCardComponent: React.FC<PokemonCardProps> = ({ name, url, index }) => {
  const theme = useTheme()
  const pokemonId = url.split('/').slice(-2, -1)[0]
  const { data: pokemon, isLoading, error } = usePokemon(pokemonId)
  
  const scale = useSharedValue(0.8)
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(30)

  useEffect(() => {
    // Staggered entrance animation
    const delay = index * 50
    opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }))
    scale.value = withDelay(delay, withSpring(1, { damping: 20, stiffness: 200 }))
    translateY.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 150 }))
  }, [index])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
      opacity: opacity.value,
    }
  })

  const pressScale = useSharedValue(1)
  
  const pressAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pressScale.value }]
    }
  })

  const handlePressIn = () => {
    pressScale.value = withSpring(0.96, { damping: 20, stiffness: 400 })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 20, stiffness: 400 })
  }

  const handlePress = () => {
    router.push(`/pokemon/${pokemonId}`)
  }

  const primaryType = pokemon?.types?.[0]?.type?.name
  const secondaryType = pokemon?.types?.[1]?.type?.name
  const backgroundColor = TYPE_COLORS[primaryType] || '#6c757d'
  const secondaryColor = secondaryType ? TYPE_COLORS[secondaryType] : backgroundColor
  const displayName = pokemon?.name || name
  const displayId = pokemon?.id || pokemonId

  return (
    <Animated.View style={[pressAnimatedStyle, { marginHorizontal: Spacing.md, marginVertical: Spacing.xs }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={styles.pressable}
      >
        <Animated.View style={[animatedStyle, styles.card, { backgroundColor }]}>
          {/* Decorative circles */}
          <View style={[styles.decorativeCircle, styles.circle1, { backgroundColor: secondaryColor, opacity: 0.1 }]} />
          <View style={[styles.decorativeCircle, styles.circle2, { backgroundColor: 'white', opacity: 0.05 }]} />
          
          <View style={styles.cardContent}>
            <View style={styles.leftContent}>
              <Text style={styles.pokemonName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.pokemonId}>
                #{displayId.toString().padStart(3, '0')}
              </Text>
              {pokemon && (
                <View style={styles.typesContainer}>
                  {pokemon.types.map((type) => (
                    <PokemonType key={type.type.name} type={type.type.name} />
                  ))}
                </View>
              )}
            </View>
            <View style={styles.rightContent}>
              {pokemon?.sprites?.other?.['official-artwork']?.front_default ? (
                <ExpoImage
                  source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
                  style={styles.pokemonImage}
                  contentFit="contain"
                  transition={300}
                  cachePolicy="memory-disk"
                />
              ) : (
                <View style={[styles.pokemonImage, styles.placeholderImage]}>
                  {isLoading && <Text style={styles.loadingDot}>●</Text>}
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

export const PokemonCard = memo(PokemonCardComponent)

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  circle1: {
    width: 120,
    height: 120,
    top: -40,
    right: -40,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: -20,
    left: -20,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  leftContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rightContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokemonName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'capitalize',
    marginBottom: Spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pokemonId: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  pokemonImage: {
    width: 90,
    height: 90,
  },
  placeholderImage: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    color: 'white',
    fontSize: 24,
    opacity: 0.5,
  },
})