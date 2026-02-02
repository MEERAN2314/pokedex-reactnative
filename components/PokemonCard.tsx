import { BorderRadius, Spacing, useTheme } from '@/constants/Theme'
import { usePokemon } from '@/hooks/usePokemon'
import { TYPE_COLORS } from '@/types/pokemon'
import { router } from 'expo-router'
import React, { useEffect } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
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

export const PokemonCard: React.FC<PokemonCardProps> = ({ name, url, index }) => {
  const theme = useTheme()
  const pokemonId = url.split('/').slice(-2, -1)[0]
  const { data: pokemon, isLoading, error } = usePokemon(pokemonId)
  
  const scale = useSharedValue(1) // Start at full scale
  const opacity = useSharedValue(1) // Start visible
  const translateY = useSharedValue(0) // Start at position

  useEffect(() => {
    // Simple entrance animation
    scale.value = withSpring(1.05, { damping: 15, stiffness: 150 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 })
    })
  }, [])

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
    pressScale.value = withSpring(0.95, { damping: 15, stiffness: 300 })
  }

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 15, stiffness: 300 })
  }

  const handlePress = () => {
    console.log('Pressed Pokemon:', name, pokemonId)
    router.push(`/pokemon/${pokemonId}`)
  }

  // Always show a card, even if loading
  const primaryType = pokemon?.types?.[0]?.type?.name
  const backgroundColor = TYPE_COLORS[primaryType] || '#6c757d'
  const displayName = pokemon?.name || name
  const displayId = pokemon?.id || pokemonId

  return (
    <Animated.View style={pressAnimatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={styles.pressable}
      >
        <Animated.View style={[animatedStyle, styles.card, { backgroundColor }]}>
          <View style={styles.cardContent}>
            <View style={styles.leftContent}>
              <Text style={styles.pokemonName}>
                {displayName}
              </Text>
              <Text style={styles.pokemonId}>
                #{displayId.toString().padStart(3, '0')}
              </Text>
              {isLoading && (
                <Text style={[styles.loadingText, { color: 'white' }]}>
                  Loading...
                </Text>
              )}
              {error && (
                <Text style={[styles.loadingText, { color: 'white' }]}>
                  Error loading
                </Text>
              )}
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
                <Image
                  source={{
                    uri: pokemon.sprites.other['official-artwork'].front_default ||
                         pokemon.sprites.front_default
                  }}
                  style={styles.pokemonImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.pokemonImage, styles.placeholderImage]} />
              )}
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  pressable: {
    // Add explicit pressable style
  },
  card: {
    padding: Spacing.md,
    margin: Spacing.sm,
    borderRadius: BorderRadius.md,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rightContent: {
    alignItems: 'center',
  },
  pokemonName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'capitalize',
    marginBottom: Spacing.xs,
  },
  pokemonId: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    marginBottom: Spacing.sm,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  pokemonImage: {
    width: 80,
    height: 80,
  },
  placeholderImage: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
})