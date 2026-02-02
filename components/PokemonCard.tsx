import { BorderRadius, Spacing, useTheme } from '@/constants/Theme'
import { usePokemon } from '@/hooks/usePokemon'
import { TYPE_COLORS } from '@/types/pokemon'
import * as Haptics from 'expo-haptics'
import { Image as ExpoImage } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { memo, useEffect } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
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
  const rotate = useSharedValue(0)
  const shimmer = useSharedValue(0)

  useEffect(() => {
    // Staggered entrance animation
    const delay = index * 50
    opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }))
    scale.value = withDelay(delay, withSpring(1, { damping: 20, stiffness: 200 }))
    translateY.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 150 }))
    
    // Subtle shimmer effect
    shimmer.value = withDelay(delay + 200, withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      false
    ))
  }, [index])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
        { rotateZ: `${rotate.value}deg` }
      ],
      opacity: opacity.value,
    }
  })

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-200, 200])
    return {
      transform: [{ translateX }],
      opacity: shimmer.value * 0.3,
    }
  })

  const pressScale = useSharedValue(1)
  const pressRotate = useSharedValue(0)
  
  const pressAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: pressScale.value },
        { rotateZ: `${pressRotate.value}deg` }
      ]
    }
  })

  const handlePressIn = () => {
    pressScale.value = withSpring(0.96, { damping: 20, stiffness: 400 })
    pressRotate.value = withSpring(-1, { damping: 15, stiffness: 300 })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 20, stiffness: 400 })
    pressRotate.value = withSpring(0, { damping: 15, stiffness: 300 })
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
        <Animated.View style={[animatedStyle, styles.card]}>
          <LinearGradient
            colors={[backgroundColor, secondaryColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            {/* Shimmer effect */}
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
            
            {/* Decorative circles */}
            <View style={[styles.decorativeCircle, styles.circle1, { backgroundColor: 'white', opacity: 0.1 }]} />
            <View style={[styles.decorativeCircle, styles.circle2, { backgroundColor: 'white', opacity: 0.05 }]} />
            <View style={[styles.decorativeCircle, styles.circle3, { backgroundColor: 'black', opacity: 0.05 }]} />
            
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
          </LinearGradient>
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
    borderRadius: BorderRadius.xl,
    minHeight: 120,
    overflow: 'hidden',
  },
  gradientCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    width: 100,
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
  circle3: {
    width: 60,
    height: 60,
    top: 20,
    left: -10,
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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