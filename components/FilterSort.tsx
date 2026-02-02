import { IconSymbol } from '@/components/ui/IconSymbol'
import { BorderRadius, FontSizes, Spacing, useTheme } from '@/constants/Theme'
import { FilterOptions, SortOption, TYPE_COLORS } from '@/types/pokemon'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import React, { useState } from 'react'
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

interface FilterSortProps {
  visible: boolean
  onClose: () => void
  filters: FilterOptions
  onApplyFilters: (filters: FilterOptions) => void
}

const POKEMON_TYPES = Object.keys(TYPE_COLORS)

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: 'number', label: 'Number', icon: 'number' },
  { value: 'name', label: 'Name', icon: 'textformat.abc' },
  { value: 'height', label: 'Height', icon: 'arrow.up.and.down' },
  { value: 'weight', label: 'Weight', icon: 'scalemass' },
]

export function FilterSort({ visible, onClose, filters, onApplyFilters }: FilterSortProps) {
  const theme = useTheme()
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)

  // Sync local filters when modal opens
  React.useEffect(() => {
    if (visible) {
      console.log('Modal opened with filters:', filters)
      setLocalFilters(filters)
    }
  }, [visible, filters])

  const toggleType = (type: string) => {
    console.log('Toggle type:', type)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setLocalFilters(prev => {
      const newTypes = prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
      console.log('New types:', newTypes)
      return {
        ...prev,
        types: newTypes
      }
    })
  }

  const setSortBy = (sortBy: SortOption) => {
    console.log('Set sort by:', sortBy)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setLocalFilters(prev => ({ ...prev, sortBy }))
  }

  const toggleSortDirection = () => {
    console.log('Toggle sort direction')
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setLocalFilters(prev => ({
      ...prev,
      sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleApply = () => {
    console.log('Apply filters:', localFilters)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onApplyFilters(localFilters)
    onClose()
  }

  const handleReset = () => {
    console.log('Reset filters')
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const resetFilters = {
      types: [],
      sortBy: 'number' as SortOption,
      sortDirection: 'asc' as const
    }
    setLocalFilters(resetFilters)
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {console.log('FilterSort Modal rendering, visible:', visible)}
      <View style={styles.modalOverlay}>
        <Pressable 
          style={styles.backdrop} 
          onPress={() => {
            console.log('Backdrop pressed')
            onClose()
          }}
          accessible={false}
        />
        
        <Animated.View 
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.modalContent, { backgroundColor: theme.background }]}
        >
          {console.log('Modal content rendering, types count:', POKEMON_TYPES.length, 'sort options:', SORT_OPTIONS.length)}
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIcon, { backgroundColor: theme.primary + '20' }]}>
                <Text style={{ fontSize: 24 }}>🎯</Text>
              </View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Filter & Sort
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              {Platform.OS === 'ios' ? (
                <BlurView intensity={80} tint={theme.background === '#0F1419' ? 'dark' : 'light'} style={styles.blurButton}>
                  <IconSymbol name="xmark" size={20} color={theme.text} />
                </BlurView>
              ) : (
                <View style={[styles.closeButtonInner, { backgroundColor: theme.card }]}>
                  <IconSymbol name="xmark" size={20} color={theme.text} />
                </View>
              )}
            </Pressable>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Sort Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Sort By</Text>
                <Pressable 
                  onPress={toggleSortDirection}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.directionButton, 
                    { 
                      backgroundColor: theme.primary + '15',
                      opacity: pressed ? 0.7 : 1,
                    }
                  ]}
                >
                  <IconSymbol 
                    name={localFilters.sortDirection === 'asc' ? 'arrow.up' : 'arrow.down'} 
                    size={16} 
                    color={theme.primary} 
                  />
                  <Text style={[styles.directionText, { color: theme.primary }]}>
                    {localFilters.sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                  </Text>
                </Pressable>
              </View>
              
              <View style={styles.sortOptions}>
                {SORT_OPTIONS.map(option => (
                  <Pressable
                    key={option.value}
                    onPress={() => setSortBy(option.value)}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.sortOption,
                      {
                        backgroundColor: localFilters.sortBy === option.value 
                          ? theme.primary + '20' 
                          : theme.card,
                        borderColor: localFilters.sortBy === option.value 
                          ? theme.primary 
                          : theme.border,
                        opacity: pressed ? 0.7 : 1,
                      }
                    ]}
                  >
                    <IconSymbol 
                      name={option.icon} 
                      size={20} 
                      color={localFilters.sortBy === option.value ? theme.primary : theme.gray} 
                    />
                    <Text style={[
                      styles.sortOptionText,
                      { color: localFilters.sortBy === option.value ? theme.primary : theme.text }
                    ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Type Filter Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Filter by Type</Text>
                {localFilters.types.length > 0 && (
                  <View style={[styles.badge, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.badgeText, { color: theme.primary }]}>
                      {localFilters.types.length} selected
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.typeGrid}>
                {POKEMON_TYPES.map(type => {
                  const isSelected = localFilters.types.includes(type)
                  const typeColor = TYPE_COLORS[type]
                  
                  return (
                    <Pressable
                      key={type}
                      onPress={() => toggleType(type)}
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.typeChip,
                        {
                          backgroundColor: isSelected ? typeColor + '25' : theme.card,
                          borderColor: isSelected ? typeColor : theme.border,
                          borderWidth: 2,
                          opacity: pressed ? 0.7 : 1,
                        }
                      ]}
                    >
                      <Text style={[
                        styles.typeChipText,
                        { color: isSelected ? typeColor : theme.text }
                      ]}>
                        {type}
                      </Text>
                      {isSelected && (
                        <View style={[styles.checkmark, { backgroundColor: typeColor }]}>
                          <IconSymbol name="checkmark" size={12} color="white" />
                        </View>
                      )}
                    </Pressable>
                  )
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Pressable 
              onPress={handleReset}
              hitSlop={8}
              style={({ pressed }) => [
                styles.resetButton, 
                { 
                  backgroundColor: theme.card,
                  opacity: pressed ? 0.7 : 1,
                }
              ]}
            >
              <IconSymbol name="arrow.counterclockwise" size={18} color={theme.gray} />
              <Text style={[styles.resetButtonText, { color: theme.gray }]}>Reset</Text>
            </Pressable>
            
            <Pressable 
              onPress={handleApply}
              hitSlop={8}
              style={({ pressed }) => [
                styles.applyButton, 
                { 
                  backgroundColor: theme.primary,
                  opacity: pressed ? 0.9 : 1,
                }
              ]}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
              <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
  },
  closeButton: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  blurButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  sortOptionText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  directionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  typeChipText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  resetButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  applyButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: 'white',
  },
})
