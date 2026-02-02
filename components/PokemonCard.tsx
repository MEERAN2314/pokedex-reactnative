import { Spacing, useTheme } from '@/constants/Theme'
import { usePokemon } from '@/hooks/usePokemon'
import { TYPE_COLORS } from '@/types/pokemon'
import * as Haptics from 'expo-haptics'
import { Image as ExpoImage } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring
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
  
  const pressScale = useSharedValue(1)
  
  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }]
  }))

  const handlePressIn = () => {
    pressScale.value = withSpring(0.97, { damping: 15, stiffness: 400 })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(`/pokemon/${pokemonId}`)
  }

  const primaryType = pokemon?.types?.[0]?.type?.name
  const secondaryType = pokemon?.types?.[1]?.type?.name
  const backgroundColor = TYPE_COLORS[primaryType] || '#6c757d'
  const secondaryColor = secondaryType ? TYPE_COLORS[secondaryType] : backgroundColor
  const displayName = pokemon?.name || name
  const displayId = pokemon?.id || pokemonId

  return (
    <Animated.View 
      entering={FadeInUp.delay(index * 30).duration(400).springify().damping(15).stiffness(100)}
      style={styles.container}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <Animated.View style={[pressAnimatedStyle, styles.card]}>
          <LinearGradient
            colors={[backgroundColor, secondaryColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            {/* Decorative circles */}
            <View style={[styles.decorativeCircle, styles.circle1]} />
            <View style={[styles.decorativeCircle, styles.circle2]} />
            
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
                    transition={200}
                    cachePolicy="memory-disk"
                    priority="normal"
                    recyclingKey={pokemon.name}
                    placeholder={{ blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I' }}
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

export const PokemonCard = memo(PokemonCardComponent, (prevProps, nextProps) => {
  // Only re-render if name, url, or index changes
  return prevProps.name === nextProps.name && 
         prevProps.url === nextProps.url && 
         prevProps.index === nextProps.index
})

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  pressable: {
    flex: 1,
  },
  card: {
    borderRadius: 20,
    minHeight: 130,
    overflow: 'hidden',
  },
  gradientCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'white',
  },
  circle1: {
    width: 140,
    height: 140,
    top: -50,
    right: -50,
    opacity: 0.1,
  },
  circle2: {
    width: 90,
    height: 90,
    bottom: -30,
    left: -30,
    opacity: 0.05,
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
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    textTransform: 'capitalize',
    marginBottom: Spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  pokemonId: {
    fontSize: 15,
    color: 'white',
    opacity: 0.95,
    marginBottom: Spacing.sm,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  pokemonImage: {
    width: 100,
    height: 100,
  },
  placeholderImage: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    color: 'white',
    fontSize: 28,
    opacity: 0.6,
  },
})