# Feature Guide: Evolution Chain & Advanced Filtering

## 🔄 Evolution Chain Viewer

### What It Does
Shows the complete evolution line for any Pokemon, making it easy to see how Pokemon evolve and navigate between evolutionary stages.

### How to Use
1. **Open any Pokemon** - Tap on a Pokemon card from the home screen
2. **Scroll down** - Past the stats section
3. **View evolution chain** - See all evolution stages with:
   - Pokemon sprites
   - Pokedex numbers
   - Names and types
   - Evolution methods (Level 16, Trade, Fire Stone, etc.)
4. **Navigate** - Tap any evolution to jump to that Pokemon's page

### Visual Features
- ✨ **Current badge** - Shows which Pokemon you're viewing
- 🎨 **Type colors** - Each Pokemon uses its primary type color
- ➡️ **Evolution arrows** - Show progression with method labels
- 🎭 **Smooth animations** - Staggered entrance effects

### Example Evolution Chains
- **Simple**: Charmander → Charmeleon → Charizard
- **Complex**: Eevee → 8 different evolutions
- **Two-stage**: Pikachu → Raichu
- **No evolution**: Legendary Pokemon (chain won't show)

---

## 🎯 Advanced Filtering & Sorting

### What It Does
Filter Pokemon by type and sort by various attributes to find exactly what you're looking for.

### How to Access
1. **Tap filter button** - Top right of home screen (funnel icon)
2. **Modal opens** - Full-screen filter interface slides up

### Filter by Type
- **18 Pokemon types** available
- **Multi-select** - Choose multiple types at once
- **Color-coded chips** - Each type has its signature color
- **Checkmarks** - Show selected types
- **Counter badge** - Shows how many types selected

**Available Types**:
```
Normal, Fire, Water, Electric, Grass, Ice,
Fighting, Poison, Ground, Flying, Psychic,
Bug, Rock, Ghost, Dragon, Dark, Steel, Fairy
```

### Sort Options

#### 1. Number (Default)
- Sorts by Pokedex number
- #001 Bulbasaur → #151 Mew (Gen 1)

#### 2. Name
- Alphabetical order
- Abra → Zubat

#### 3. Height
- Shortest to tallest (or reverse)
- Useful for finding tiny or giant Pokemon

#### 4. Weight
- Lightest to heaviest (or reverse)
- Find the heaviest Pokemon!

### Sort Direction
- **Ascending** ⬆️ - Low to high, A to Z
- **Descending** ⬇️ - High to low, Z to A
- **Toggle button** - Tap to switch direction

### Applying Filters
1. **Select types** - Tap type chips to select/deselect
2. **Choose sort** - Pick sorting method
3. **Set direction** - Ascending or descending
4. **Apply** - Tap "Apply Filters" button
5. **Results** - List updates immediately

### Resetting Filters
- **Reset button** - Clears all filters and sorts
- **Returns to default** - Number ascending, no type filters

### Visual Indicators
- **Badge on filter button** - Shows count of active filters
- **Button color change** - Filter button turns blue when filters active
- **Pokemon count** - Header shows filtered count (e.g., "45 Pokemon")

---

## 💡 Pro Tips

### Evolution Chain
- **Quick navigation** - Use evolution chain to explore related Pokemon
- **Learn evolution methods** - See what's needed to evolve
- **Type coverage** - See how types change through evolution

### Filtering
- **Combine filters** - Select multiple types to find dual-type Pokemon
- **Sort by stats** - Use height/weight to find unique Pokemon
- **Quick access** - Filter button always visible in header
- **Performance** - Filters work on loaded Pokemon (load more by scrolling)

### Combinations
1. **Fire types by power** - Filter Fire, sort by Weight (heavier = stronger)
2. **Smallest Pokemon** - Sort by Height ascending
3. **Alphabetical favorites** - Sort by Name to find Pokemon quickly
4. **Type specialists** - Filter single type to build themed teams

---

## 🎨 UI Elements

### Evolution Chain Card
```
┌─────────────────────────────────┐
│ 🔄 Evolution Chain              │
├─────────────────────────────────┤
│                                 │
│  ┌──────────┐  ➡️ Level 16     │
│  │ #004     │                   │
│  │ 🦎       │  ┌──────────┐    │
│  │Charmander│  │ #005     │    │
│  │🔥        │  │ 🦎       │    │
│  └──────────┘  │Charmeleon│    │
│                │🔥        │    │
│                └──────────┘    │
└─────────────────────────────────┘
```

### Filter Modal
```
┌─────────────────────────────────┐
│ 🎯 Filter & Sort           ✕    │
├─────────────────────────────────┤
│                                 │
│ Sort By              ⬆️ Ascending│
│ [Number] [Name] [Height] [Weight]│
│                                 │
│ Filter by Type      2 selected  │
│ [Fire✓] [Water✓] [Grass] [...]│
│                                 │
├─────────────────────────────────┤
│ [Reset]      [Apply Filters ✓] │
└─────────────────────────────────┘
```

---

## 🚀 Performance Notes

- **Smooth scrolling** maintained during filtering
- **Background loading** for Pokemon details
- **Instant updates** when applying filters
- **Optimized rendering** with FlatList
- **Haptic feedback** for better UX

---

## 🎯 Use Cases

### For Collectors
- Filter by type to complete type collections
- Sort by number to track Pokedex progress
- Use evolution chains to plan captures

### For Battlers
- Filter by type for team building
- Sort by weight/height for strategy
- Check evolution chains for move learning

### For Explorers
- Sort alphabetically to discover new Pokemon
- Filter multiple types for rare combinations
- Navigate evolution chains to learn lore

---

## 📱 Accessibility

- **Large touch targets** - Easy to tap buttons and chips
- **Clear labels** - All options clearly labeled
- **Visual feedback** - Selected states clearly indicated
- **Haptic feedback** - Physical confirmation of actions
- **Smooth animations** - Not too fast, not too slow
- **Dark mode support** - Works in both themes
