import { IconSymbol } from '@/components/ui/IconSymbol'
import { BorderRadius, FontSizes, Spacing, useTheme } from '@/constants/Theme'
import { useEvolutionChain, usePokemon } from '@/hooks/usePokemon'
import { EvolutionChainLink, TYPE_COLORS } from '@/types/pokemon'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInRight } from 'react-native-reanimated'

interface EvolutionChainProps {
  evolutionChainUrl: string
  currentPokemonName: string
  primaryColor: string
}

interface EvolutionStageProps {
  link: EvolutionChainLink
  currentPokemonName: string
  primaryColor: string
  index: number
}

function EvolutionStage({ link, currentPokemonName, primaryColor, index }: EvolutionStageProps) {
  const theme = useTheme()
  const pokemonId = link.species.url.split('/').filter(Boolean).pop()
  const { data: pokemon } = usePokemon(pokemonId!)
  
  const isCurrent = link.species.name === currentPokemonName
  const evolutionDetail = link.evolution_details[0]
  
  const getEvolutionMethod = () => {
    if (!evolutionDetail) return null
    
    if (evolutionDetail.min_level) {
      return `Level ${evolutionDetail.min_level}`
    }
    if (evolutionDetail.item) {
      return evolutionDetail.item.name.replace('-', ' ')
    }
    if (evolutionDetail.trigger.name === 'trade') {
      return 'Trade'
    }
    return evolutionDetail.trigger.name
  }

  const handlePress = () => {
    if (!isCurrent && pokemonId) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      router.push(`/pokemon/${pokemonId}`)
    }
  }

  if (!pokemon) {
    return (
      <View style={[styles.evolutionCard, { backgroundColor: theme.card }]}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    )
  }

  const primaryType = pokemon.types[0]?.type.name
  const typeColor = TYPE_COLORS[primaryType] || primaryColor

  return (
    <View style={styles.evolutionStageContainer}>
      {evolutionDetail && (
        <View style={styles.evolutionMethodContainer}>
          <View style={[styles.evolutionArrow, { backgroundColor: primaryColor + '20' }]}>
            <IconSymbol name="arrow.right" size={20} color={primaryColor} />
          </View>
          <Text style={[styles.evolutionMethod, { color: theme.gray }]}>
            {getEvolutionMethod()}
          </Text>
        </View>
      )}
      
      <Animated.View entering={FadeInRight.delay(index * 100).duration(400)}>
        <Pressable
          onPress={handlePress}
          disabled={isCurrent}
          style={[
            styles.evolutionCard,
            {
              backgroundColor: isCurrent ? typeColor + '25' : theme.card,
              borderColor: isCurrent ? typeColor : theme.border,
              borderWidth: isCurrent ? 3 : 1,
            }
          ]}
        >
          {isCurrent && (
            <View style={[styles.currentBadge, { backgroundColor: typeColor }]}>
              <IconSymbol name="star.fill" size={12} color="white" />
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
          
          <Image
            source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
            style={styles.evolutionImage}
            contentFit="contain"
            transition={300}
          />
          
          <View style={styles.evolutionInfo}>
            <Text style={[styles.evolutionNumber, { color: theme.gray }]}>
              #{pokemon.id.toString().padStart(3, '0')}
            </Text>
            <Text style={[styles.evolutionName, { color: theme.text }]}>
              {pokemon.name}
            </Text>
            <View style={styles.evolutionTypes}>
              {pokemon.types.map(type => (
                <View 
                  key={type.type.name}
                  style={[styles.typeTag, { backgroundColor: TYPE_COLORS[type.type.name] }]}
                >
                  <Text style={styles.typeTagText}>{type.type.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </Pressable>
      </Animated.View>

      {link.evolves_to.length > 0 && (
        <View style={styles.nextEvolutions}>
          {link.evolves_to.map((evolution, idx) => (
            <EvolutionStage
              key={evolution.species.name}
              link={evolution}
              currentPokemonName={currentPokemonName}
              primaryColor={primaryColor}
              index={index + idx + 1}
            />
          ))}
        </View>
      )}
    </View>
  )
}

export function EvolutionChain({ evolutionChainUrl, currentPokemonName, primaryColor }: EvolutionChainProps) {
  const theme = useTheme()
  const { data: evolutionChain, isLoading } = useEvolutionChain(evolutionChainUrl)

  if (isLoading) {
    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: primaryColor + '20' }]}>
            <Text style={{ fontSize: 22 }}>🔄</Text>
          </View>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Evolution Chain
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.gray }]}>
            Loading evolution chain...
          </Text>
        </View>
      </View>
    )
  }

  if (!evolutionChain) return null

  // Check if Pokemon has evolutions
  const hasEvolutions = evolutionChain.chain.evolves_to.length > 0 || 
    evolutionChain.chain.evolves_to.some(evo => evo.evolves_to.length > 0)

  if (!hasEvolutions) return null

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: primaryColor + '20' }]}>
          <Text style={{ fontSize: 22 }}>🔄</Text>
        </View>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Evolution Chain
        </Text>
      </View>
      
      <View style={styles.chainContainer}>
        <EvolutionStage
          link={evolutionChain.chain}
          currentPokemonName={currentPokemonName}
          primaryColor={primaryColor}
          index={0}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  chainContainer: {
    gap: Spacing.md,
  },
  evolutionStageContainer: {
    gap: Spacing.md,
  },
  evolutionMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginLeft: Spacing.md,
  },
  evolutionArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evolutionMethod: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  evolutionCard: {
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  currentBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    zIndex: 1,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  evolutionImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
  },
  evolutionInfo: {
    alignItems: 'center',
    gap: 4,
  },
  evolutionNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  evolutionName: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  evolutionTypes: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  typeTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  typeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
  },
  nextEvolutions: {
    gap: Spacing.md,
    marginLeft: Spacing.lg,
  },
})
