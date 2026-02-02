import { BorderRadius, FontSizes, Spacing, useTheme } from '@/constants/Theme'
import { FilterOptions, SortOption, TYPE_COLORS } from '@/types/pokemon'
import * as Haptics from 'expo-haptics'
import React, { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

interface FilterSortProps {
  visible: boolean
  onClose: () => void
  filters: FilterOptions
  onApplyFilters: (filters: FilterOptions) => void
}

const POKEMON_TYPES = Object.keys(TYPE_COLORS)

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'number', label: 'Number' },
  { value: 'name', label: 'Name' },
  { value: 'height', label: 'Height' },
  { value: 'weight', label: 'Weight' },
]

export function FilterSortSimple({ visible, onClose, filters, onApplyFilters }: FilterSortProps) {
  const theme = useTheme()
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)

  React.useEffect(() => {
    if (visible) {
      setLocalFilters(filters)
      console.log('Modal opened - Types:', POKEMON_TYPES.length, 'Sort options:', SORT_OPTIONS.length)
    }
  }, [visible])

  const toggleType = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setLocalFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }))
  }

  const setSortBy = (sortBy: SortOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setLocalFilters(prev => ({ ...prev, sortBy }))
  }

  const toggleSortDirection = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setLocalFilters(prev => ({
      ...prev,
      sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onApplyFilters(localFilters)
    onClose()
  }

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setLocalFilters({
      types: [],
      sortBy: 'number',
      sortDirection: 'asc'
    })
  }

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              🎯 Filter & Sort
            </Text>
            <Pressable onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.card }]}>
              <Text style={[styles.closeButtonText, { color: theme.text }]}>✕</Text>
            </Pressable>
          </View>

          <ScrollView 
            style={styles.scrollContent} 
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={true}
          >
            {/* Debug Info */}
            <View style={[styles.section, { backgroundColor: theme.primary + '10' }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Debug: {POKEMON_TYPES.length} types, {SORT_OPTIONS.length} sort options
              </Text>
            </View>

            {/* Sort Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Sort By</Text>
                <Pressable 
                  onPress={toggleSortDirection}
                  style={[styles.directionButton, { backgroundColor: theme.primary + '20' }]}
                >
                  <Text style={[styles.directionText, { color: theme.primary }]}>
                    {localFilters.sortDirection === 'asc' ? '⬆️ Asc' : '⬇️ Desc'}
                  </Text>
                </Pressable>
              </View>
              
              <View style={styles.sortOptions}>
                {SORT_OPTIONS.map(option => {
                  const isSelected = localFilters.sortBy === option.value
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setSortBy(option.value)}
                      style={[
                        styles.sortOption,
                        {
                          backgroundColor: isSelected ? theme.primary + '20' : theme.card,
                          borderColor: isSelected ? theme.primary : theme.border,
                          borderWidth: 2,
                        }
                      ]}
                    >
                      <Text style={[
                        styles.sortOptionText,
                        { color: isSelected ? theme.primary : theme.text }
                      ]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  )
                })}
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
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor: isSelected ? typeColor + '30' : theme.card,
                          borderColor: isSelected ? typeColor : theme.border,
                          borderWidth: 2,
                        }
                      ]}
                    >
                      <Text style={[
                        styles.typeChipText,
                        { color: isSelected ? typeColor : theme.text }
                      ]}>
                        {type}
                      </Text>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
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
              style={[styles.resetButton, { backgroundColor: theme.card }]}
            >
              <Text style={[styles.resetButtonText, { color: theme.gray }]}>🔄 Reset</Text>
            </Pressable>
            
            <Pressable 
              onPress={handleApply}
              style={[styles.applyButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.applyButtonText}>✓ Apply Filters</Text>
            </Pressable>
          </View>
        </View>
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
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: Spacing.xl,
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  sortOptionText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  directionButton: {
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeChipText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '900',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  resetButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  applyButton: {
    flex: 2,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: 'white',
  },
})
