import { BorderRadius, FontSizes, Spacing, useTheme } from '@/constants/Theme'
import { useEvolutionChain, usePokemon } from '@/hooks/usePokemon'
import { EvolutionChainLink, TYPE_COLORS } from '@/types/pokemon'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated'

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
  isLast?: boolean
}

function EvolutionStage({ link, currentPokemonName, primaryColor, index, isLast }: EvolutionStageProps) {
  const theme = useTheme()
  const pokemonId = link.species.url.split('/').filter(Boolean).pop()
  const { data: pokemon } = usePokemon(pokemonId!)
  
  const isCurrent = link.species.name === currentPokemonName
  const evolutionDetail = link.evolution_details[0]
  
  const getEvolutionMethod = () => {
    if (!evolutionDetail) return null
    
    if (evolutionDetail.min_level) {
      return { icon: '📊', text: `Lv. ${evolutionDetail.min_level}` }
    }
    if (evolutionDetail.item) {
      const itemName = evolutionDetail.item.name.replace('-', ' ')
      return { icon: '💎', text: itemName }
    }
    if (evolutionDetail.trigger.name === 'trade') {
      return { icon: '🔄', text: 'Trade' }
    }
    return { icon: '✨', text: evolutionDetail.trigger.name }
  }

  const handlePress = () => {
    if (!isCurrent && pokemonId) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      router.push(`/pokemon/${pokemonId}`)
    }
  }

  if (!pokemon) {
    return (
      <View style={styles.evolutionCardWrapper}>
        <View style={[styles.evolutionCard, { backgroundColor: theme.card }]}>
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      </View>
    )
  }

  const primaryType = pokemon.types[0]?.type.name
  const typeColor = TYPE_COLORS[primaryType] || primaryColor
  const method = getEvolutionMethod()

  return (
    <>
      {/* Evolution Arrow & Method */}
      {evolutionDetail && (
        <Animated.View 
          entering={FadeInRight.delay(index * 100).duration(400)}
          style={styles.arrowContainer}
        >
          <View style={styles.arrowLine}>
            <LinearGradient
              colors={[primaryColor + '40', primaryColor + '80', primaryColor + '40']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.arrowGradient}
            />
          </View>
          {method && (
            <View style={[styles.methodBadge, { backgroundColor: theme.card, borderColor: primaryColor }]}>
              <Text style={styles.methodIcon}>{method.icon}</Text>
              <Text style={[styles.methodText, { color: theme.text }]}>
                {method.text}
              </Text>
            </View>
          )}
          <View style={[styles.arrowHead, { borderLeftColor: primaryColor }]} />
        </Animated.View>
      )}

      {/* Pokemon Card */}
      <Animated.View 
        entering={FadeInDown.delay(index * 150).duration(500)}
        style={styles.evolutionCardWrapper}
      >
        <Pressable
          onPress={handlePress}
          disabled={isCurrent}
          style={({ pressed }) => [
            styles.evolutionCard,
            {
              backgroundColor: theme.card,
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            }
          ]}
        >
          {/* Gradient Background */}
          <LinearGradient
            colors={isCurrent 
              ? [typeColor + '30', typeColor + '15', typeColor + '05']
              : [theme.card, theme.card]
            }
            style={styles.cardGradient}
          />

          {/* Current Badge */}
          {isCurrent && (
            <View style={[styles.currentBadge, { backgroundColor: typeColor }]}>
              <Text style={styles.currentBadgeIcon}>⭐</Text>
              <Text style={styles.currentBadgeText}>You are here</Text>
            </View>
          )}

          {/* Pokemon Image with Glow */}
          <View style={styles.imageContainer}>
            {isCurrent && (
              <View style={[styles.imageGlow, { backgroundColor: typeColor + '30' }]} />
            )}
            <Image
              source={{ uri: pokemon.sprites.other['official-artwork'].front_default }}
              style={styles.evolutionImage}
              contentFit="contain"
              transition={300}
            />
          </View>
          
          {/* Pokemon Info */}
          <View style={styles.evolutionInfo}>
            <View style={[styles.numberBadge, { backgroundColor: theme.border }]}>
              <Text style={[styles.evolutionNumber, { color: theme.gray }]}>
                #{pokemon.id.toString().padStart(3, '0')}
              </Text>
            </View>
            
            <Text style={[styles.evolutionName, { color: theme.text }]}>
              {pokemon.name}
            </Text>
            
            {/* Type Tags */}
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

            {/* Stats Preview */}
            <View style={styles.statsPreview}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.gray }]}>HP</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {pokemon.stats[0].base_stat}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.gray }]}>ATK</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {pokemon.stats[1].base_stat}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.gray }]}>DEF</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {pokemon.stats[2].base_stat}
                </Text>
              </View>
            </View>
          </View>

          {/* Border Highlight for Current */}
          {isCurrent && (
            <View style={[styles.cardBorder, { borderColor: typeColor }]} />
          )}
        </Pressable>
      </Animated.View>
    </>
  )
}

function EvolutionLine({ chain, currentPokemonName, primaryColor }: { 
  chain: EvolutionChainLink
  currentPokemonName: string
  primaryColor: string
}) {
  const stages: EvolutionChainLink[] = []
  
  // Flatten the evolution chain into stages
  let current: EvolutionChainLink | null = chain
  while (current) {
    stages.push(current)
    current = current.evolves_to[0] || null
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.evolutionLine}
      decelerationRate="fast"
      snapToInterval={200}
    >
      {stages.map((stage, index) => (
        <EvolutionStage
          key={stage.species.name}
          link={stage}
          currentPokemonName={currentPokemonName}
          primaryColor={primaryColor}
          index={index}
          isLast={index === stages.length - 1}
        />
      ))}
    </ScrollView>
  )
}

export function EvolutionChainImproved({ evolutionChainUrl, currentPokemonName, primaryColor }: EvolutionChainProps) {
  const theme = useTheme()
  const { data: evolutionChain, isLoading } = useEvolutionChain(evolutionChainUrl)

  if (isLoading) {
    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: primaryColor + '20' }]}>
            <Text style={{ fontSize: 28 }}>🔄</Text>
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
          <Text style={{ fontSize: 28 }}>🔄</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Evolution Chain
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.gray }]}>
            Swipe to see all stages →
          </Text>
        </View>
      </View>
      
      <EvolutionLine
        chain={evolutionChain.chain}
        currentPokemonName={currentPokemonName}
        primaryColor={primaryColor}
      />
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
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
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
  evolutionLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  evolutionCardWrapper: {
    marginHorizontal: Spacing.xs,
  },
  evolutionCard: {
    width: 180,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 3,
    pointerEvents: 'none',
  },
  currentBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  currentBadgeIcon: {
    fontSize: 12,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    marginTop: Spacing.md,
  },
  imageGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.5,
  },
  evolutionImage: {
    width: 120,
    height: 120,
  },
  evolutionInfo: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  numberBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  evolutionNumber: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  evolutionName: {
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'capitalize',
    marginTop: 2,
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
    fontSize: 10,
    fontWeight: '800',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.xs,
  },
  arrowLine: {
    width: 60,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  arrowGradient: {
    flex: 1,
  },
  arrowHead: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 0,
    borderBottomWidth: 8,
    borderTopWidth: 8,
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    marginLeft: -1,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    marginVertical: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  methodIcon: {
    fontSize: 14,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
})
