# UI Consistency Guide

## Design System Overview

This document outlines the consistent design patterns applied across all screens in the Pokedex app.

## Color Palette

### Light Theme
- **Background**: #F8F9FA (Soft white)
- **Card**: #FFFFFF (Pure white)
- **Text**: #11181C (Dark gray)
- **Gray**: #6C757D (Medium gray)
- **Primary**: #3B82F6 (Blue)
- **Danger**: #EF4444 (Red)
- **Success**: #10B981 (Green)
- **Border**: #E9ECEF (Light gray)

### Dark Theme
- **Background**: #0F1419 (Deep black)
- **Card**: #1A1F26 (Dark gray)
- **Text**: #ECEDEE (Light gray)
- **Gray**: #9CA3AF (Medium gray)
- **Primary**: #60A5FA (Light blue)
- **Danger**: #F87171 (Light red)
- **Success**: #34D399 (Light green)
- **Border**: #2D3748 (Dark border)

## Typography

### Headers
- **Title**: 36px, weight 800, letter-spacing -0.5
- **Subtitle**: 16px, weight 500
- **Card Title**: 20px (xl), weight bold

### Body Text
- **Regular**: 16px (md)
- **Small**: 14px (sm)
- **Large**: 18px (lg)

## Layout Patterns

### Screen Structure
All main screens follow this structure:
```
View (container)
  └─ LinearGradient (themed background)
      └─ SafeAreaView (top edge only)
          └─ Header
              └─ Content
```

### Header Pattern
```tsx
<View style={styles.header}>
  <View style={styles.headerContent}>
    <View>
      <Text style={styles.title}>Title</Text>
      <Text style={styles.subtitle}>Subtitle</Text>
    </View>
    <View style={styles.iconContainer}>
      {/* Icon or Emoji */}
    </View>
  </View>
</View>
```

### Header Styles
```typescript
header: {
  paddingHorizontal: Spacing.md,
  paddingTop: Spacing.sm,
  paddingBottom: Spacing.md,
}
headerContent: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}
title: {
  fontSize: 36,
  fontWeight: '800',
  marginBottom: 4,
  letterSpacing: -0.5,
}
subtitle: {
  fontSize: FontSizes.md,
  fontWeight: '500',
}
iconContainer: {
  width: 56,
  height: 56,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
}
```

## Gradient Backgrounds

### Implementation
```tsx
<LinearGradient
  colors={[theme.primary + '15', theme.background, theme.background]}
  style={styles.gradientBackground}
>
  {/* Content */}
</LinearGradient>
```

### Variants by Screen
- **Home (Pokedex)**: Primary color (blue) - `theme.primary + '15'`
- **Favorites**: Danger color (red) - `theme.danger + '15'`
- **Search**: Primary color (blue) - `theme.primary + '15'`
- **Pokemon Detail**: Type-based color - `backgroundColor + '20'`

### Gradient Style
```typescript
gradientBackground: {
  flex: 1,
}
```

## Icon Badges

### Circular Icon Container
- **Size**: 56x56px
- **Border Radius**: 28px (full circle)
- **Background**: Theme color + '20' opacity
- **Shadow**: Subtle elevation
- **Icon Size**: 28px

### Examples
```tsx
// Home - Pokeball Emoji
<View style={[styles.pokeball, { backgroundColor: theme.primary + '20' }]}>
  <Text style={styles.pokeballText}>⚪</Text>
</View>

// Favorites - Heart Icon
<View style={[styles.heartIcon, { backgroundColor: theme.danger + '20' }]}>
  <IconSymbol name="heart.fill" size={28} color={theme.danger} />
</View>

// Search - Magnifying Glass
<View style={[styles.searchIcon, { backgroundColor: theme.primary + '20' }]}>
  <IconSymbol name="magnifyingglass" size={28} color={theme.primary} />
</View>
```

## Cards

### Card Style
```typescript
card: {
  padding: Spacing.lg,
  borderRadius: BorderRadius.xl,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
}
```

### Card Header with Icon
```tsx
<View style={styles.cardHeader}>
  <View style={[styles.cardIcon, { backgroundColor: color + '20' }]}>
    <Text style={{ fontSize: 20 }}>📖</Text>
  </View>
  <Text style={[styles.cardTitle, { color: theme.text }]}>
    Title
  </Text>
</View>
```

## Buttons

### Primary Button
```typescript
button: {
  borderRadius: BorderRadius.lg,
  paddingHorizontal: Spacing.lg,
  paddingVertical: 14,
  alignItems: 'center',
  justifyContent: 'center',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 4,
}
```

### Icon Button (Circular)
```typescript
iconButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
}
```

## Tab Bar

### Configuration
```tsx
tabBarStyle: {
  position: 'absolute',
  borderTopWidth: 0,
  elevation: 0,
  height: Platform.OS === 'ios' ? 88 : 70,
  paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  paddingTop: 12,
  backgroundColor: 'transparent',
}
```

### Tab Icons
- **Active**: 30px
- **Inactive**: 26px
- **Label**: 11px, weight 600

### Background
- **iOS**: BlurView with 80 intensity
- **Android**: TabBarBackground component

## Loading States

### Loading Container
```tsx
<View style={styles.loadingContainer}>
  <View style={[styles.loadingIconContainer, { backgroundColor: theme.primary + '20' }]}>
    <ActivityIndicator size="large" color={theme.primary} />
  </View>
  <Text style={[styles.loadingText, { color: theme.gray }]}>
    Loading...
  </Text>
</View>
```

### Styles
```typescript
loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  gap: Spacing.md,
}
loadingIconContainer: {
  width: 80,
  height: 80,
  borderRadius: 40,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 4,
}
loadingText: {
  fontSize: FontSizes.lg,
  fontWeight: '600',
}
```

## Empty States

### Structure
```tsx
<View style={styles.emptyState}>
  <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
    <IconSymbol name="icon" size={48} color={theme.gray} />
  </View>
  <Text style={[styles.emptyTitle, { color: theme.text }]}>
    Title
  </Text>
  <Text style={[styles.emptyDescription, { color: theme.gray }]}>
    Description
  </Text>
</View>
```

### Styles
```typescript
emptyState: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: Spacing.xl,
  gap: Spacing.md,
}
iconContainer: {
  width: 100,
  height: 100,
  borderRadius: BorderRadius.xl,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: Spacing.sm,
}
emptyTitle: {
  fontSize: FontSizes.xxl,
  fontWeight: 'bold',
  textAlign: 'center',
}
emptyDescription: {
  fontSize: FontSizes.md,
  textAlign: 'center',
  lineHeight: 24,
}
```

## Input Fields

### Search Input
```tsx
<View style={[styles.searchInputContainer, { 
  backgroundColor: theme.card, 
  borderColor: theme.primary + '30',
  shadowColor: theme.primary,
}]}>
  <IconSymbol name="magnifyingglass" size={20} color={theme.gray} />
  <TextInput
    style={[styles.searchInput, { color: theme.text }]}
    placeholder="Placeholder..."
    placeholderTextColor={theme.gray}
  />
</View>
```

### Styles
```typescript
searchInputContainer: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: BorderRadius.lg,
  borderWidth: 2,
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.xs,
  gap: Spacing.sm,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
}
```

## Spacing System

```typescript
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}
```

## Border Radius

```typescript
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
}
```

## Shadows

### Light Shadow (Cards)
```typescript
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 8,
elevation: 3,
```

### Medium Shadow (Buttons)
```typescript
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 8,
elevation: 4,
```

## Animations

### Entrance Animations
- **Duration**: 300-600ms
- **Easing**: Cubic out
- **Stagger**: 50ms per item

### Press Animations
- **Spring**: damping 20, stiffness 400
- **Scale**: 0.96 on press

### Scroll Animations
- **Interpolate**: Based on scroll position
- **Smooth**: 16ms throttle

## Best Practices

1. **Always use theme colors** - Never hardcode colors
2. **Consistent spacing** - Use Spacing constants
3. **Proper shadows** - Match elevation to importance
4. **Gradient backgrounds** - All main screens should have them
5. **Icon badges** - Use for screen identifiers
6. **Loading states** - Always show with gradient background
7. **Empty states** - Provide helpful guidance
8. **Animations** - Keep them smooth and purposeful
9. **Typography** - Follow the hierarchy
10. **Safe areas** - Always use SafeAreaView with edges prop

## Screen Checklist

When creating or updating a screen, ensure:

- [ ] Gradient background with theme color
- [ ] Header with title, subtitle, and icon badge
- [ ] Consistent typography (36px title, 16px subtitle)
- [ ] Proper spacing using Spacing constants
- [ ] Theme-aware colors
- [ ] Loading state with gradient background
- [ ] Empty state (if applicable)
- [ ] Proper shadows on elevated elements
- [ ] SafeAreaView with edges={['top']}
- [ ] Smooth animations
- [ ] Haptic feedback on interactions
