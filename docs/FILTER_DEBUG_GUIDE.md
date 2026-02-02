# Filter Debug Guide

## Changes Made to Fix Filter Issues

### 1. **Added Touch Feedback**
- Added `hitSlop={8}` to all Pressable components for better touch targets
- Added `pressed` state styling with opacity changes
- Visual feedback when tapping buttons

### 2. **Fixed Sort Options**
- Fixed missing label for "Weight" option
- All sort options now properly display

### 3. **Improved Modal Structure**
- Moved background color from backdrop to modalOverlay
- Added `zIndex: 10` to modalContent
- Added `statusBarTranslucent` to Modal
- Made backdrop non-accessible to prevent interference

### 4. **Added Debug Logging**
- Console logs for all filter actions
- Logs show when types are toggled
- Logs show when sort options change
- Logs show final filter state on apply

## How to Test

### Test 1: Type Filters
1. Open the app
2. Tap the filter button (funnel icon, top right)
3. **Check console** - Should see modal opening
4. Tap any type chip (e.g., "fire")
5. **Check console** - Should see: `Toggle type: fire` and `New types: ['fire']`
6. Tap another type (e.g., "water")
7. **Check console** - Should see: `Toggle type: water` and `New types: ['fire', 'water']`
8. Tap "fire" again to deselect
9. **Check console** - Should see: `New types: ['water']`
10. Tap "Apply Filters"
11. **Check console** - Should see: `Apply filters: { types: ['water'], sortBy: 'number', sortDirection: 'asc' }`

### Test 2: Sort Options
1. Open filter modal
2. Tap "Name" sort option
3. **Check console** - Should see: `Set sort by: name`
4. Tap the direction toggle (Ascending/Descending)
5. **Check console** - Should see: `Toggle sort direction`
6. Tap "Apply Filters"
7. **Check console** - Should see the final filter state

### Test 3: Reset
1. Open filter modal
2. Select some types and change sort
3. Tap "Reset" button
4. **Check console** - Should see: `Reset filters`
5. All selections should clear

### Test 4: Visual Feedback
1. Tap any filter chip
2. **Should see**:
   - Opacity change when pressing
   - Background color change when selected
   - Checkmark appears for selected types
   - Border color changes

## Console Output Examples

### Successful Type Toggle:
```
Toggle type: fire
New types: ['fire']
```

### Successful Sort Change:
```
Set sort by: name
```

### Successful Apply:
```
Apply filters: {
  types: ['fire', 'water'],
  sortBy: 'name',
  sortDirection: 'desc'
}
```

## Troubleshooting

### If taps don't register:
1. **Check console** - If no logs appear, touch isn't reaching the component
2. **Try tapping center** of chips/buttons
3. **Check if modal is visible** - Should slide up from bottom
4. **Try on different device/simulator**

### If filters don't apply:
1. **Check console logs** - Should see "Apply filters" message
2. **Check home screen** - Pokemon count should update
3. **Scroll list** - Should see filtered Pokemon

### If visual feedback missing:
1. **Check theme** - Dark/light mode might affect visibility
2. **Look for opacity changes** when pressing
3. **Check for checkmarks** on selected types

## Expected Behavior

### Type Chips:
- **Unselected**: Gray background, gray border, theme text color
- **Selected**: Type color background (25% opacity), type color border, type color text, checkmark icon
- **Pressed**: 70% opacity

### Sort Options:
- **Unselected**: Card background, border color, gray icon, theme text
- **Selected**: Primary color background (20% opacity), primary border, primary icon, primary text
- **Pressed**: 70% opacity

### Buttons:
- **Reset**: Card background, gray text, gray icon
- **Apply**: Primary background, white text, white icon
- **Pressed**: Opacity change

## Performance Notes

- Filters are applied to loaded Pokemon only
- Scroll down to load more Pokemon before filtering
- First 20-40 Pokemon load initially
- Filter/sort calculations use `useMemo` for efficiency

## Next Steps if Still Not Working

1. **Check React Native Debugger** - Open dev menu, enable debugging
2. **Check for errors** - Look for red screen errors
3. **Restart app** - Sometimes hot reload causes issues
4. **Clear cache** - `npm start -- --reset-cache`
5. **Rebuild** - `npx expo start -c`

## Contact Points

If issues persist, check:
- `components/FilterSort.tsx` - Filter UI component
- `app/(tabs)/index.tsx` - Home screen with filter logic
- Console logs for debugging information
