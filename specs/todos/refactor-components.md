# Component Refactoring Plan

## Goal

Extract repeated styling/markup patterns into reusable components. Reduce duplication across game phases, modals, and forms.

## Key Patterns Found

### 1. Card Container (HIGH PRIORITY)

**Pattern**: `<div class="bg-gray-700 rounded-lg shadow p-6">`

- **Used in**: `description-display.vue`, `guessing-phase.vue`, `voting-phase.vue`, `running-phase.vue`, `join-waiting-modal.vue`
- **Count**: ~8+ instances
- **Action**: Create `Card.vue` component
  ```vue
  <Card>
    <template #header>Round {{ round }} Descriptions</template>
    <!-- content -->
  </Card>
  ```

### 2. Heading Styles (HIGH PRIORITY)

**Patterns identified**:

- `<h2 class="text-2xl font-bold text-white mb-6">` (section titles)
- `<h3 class="text-xl font-bold mb-4 text-white">` (subsection titles)
- `<h3 class="text-lg font-semibold text-gray-300 mb-2">` (info box titles)

**Used in**: All phase components, admin pages, modals

- **Action**: Create `Heading.vue` component with `level` prop (h2, h3, etc)
  ```vue
  <Heading level="2" variant="primary">Game Over</Heading>
  <Heading level="3" variant="secondary">Most Voted</Heading>
  ```

### 3. Info Box / Key-Value Display (HIGH PRIORITY)

**Pattern**: In `ended-phase.vue` and other components

```vue
<div class="bg-gray-700 rounded-lg p-6">
  <h3 class="text-lg font-semibold text-gray-300 mb-2">Label</h3>
  <p class="text-xl text-white"><span class="font-bold text-yellow-400">Value</span></p>
</div>
```

**Used in**: `ended-phase.vue` (3+ times), `running-phase.vue`

- **Action**: Create `InfoBox.vue` component
  ```vue
  <InfoBox title="Most Voted" value="John" valueColor="yellow-400" />
  ```

### 4. Input Component (HIGH PRIORITY)

**Pattern**: `<input class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-400">`

- **Used in**: `create-game-form.vue`, `running-phase.vue`, `guessing-phase.vue`, `join-game-form.vue`
- **Count**: ~5-6 instances
- **Action**: Create `Input.vue` component (like Button.vue)
  ```vue
  <Input v-model="value" type="text" placeholder="Enter..." />
  ```

### 5. Form Field Label + Input (MEDIUM PRIORITY)

**Pattern**: `<label class="block text-sm font-medium text-gray-300 mb-2"> + <Input>`

- **Used in**: `create-game-form.vue`, `running-phase.vue`, `join-game-form.vue`, admin forms
- **Action**: Create `FormField.vue` wrapper
  ```vue
  <FormField label="Number of Rounds">
    <Input v-model="rounds" type="number" />
  </FormField>
  ```

### 6. Empty State / Loading Text (MEDIUM PRIORITY)

**Pattern**: `<div class="text-gray-400 text-center py-4">`

- **Used in**: `description-display.vue`, `player-selection-list.vue`, multiple places
- **Action**: Create `EmptyState.vue` component
  ```vue
  <EmptyState>Waiting for descriptions...</EmptyState>
  ```

### 7. Player Info Display (MEDIUM PRIORITY)

**Pattern**: In `description-display.vue`

```vue
<p class="font-semibold text-gray-200">{{ playerName }}</p>
<p class="text-gray-300 mt-2">{{ text }}</p>
```

- **Used in**: `description-display.vue`, `guessing-phase.vue`
- **Action**: Create `PlayerInfo.vue` component

### 8. Alert / Status Box (LOW PRIORITY)

**Pattern**: In `guessing-phase.vue`

```vue
<div class="p-4 bg-blue-900 rounded border border-blue-600">
  <p class="text-blue-400 font-bold text-lg">Message</p>
</div>
```

- **Used in**: `guessing-phase.vue`, other status messages
- **Action**: Create `Alert.vue` component with variants (success, info, error)

## Implementation Order

1. **Phase 1 (Highest Impact)**
   - `Card.vue` — used 8+ places
   - `Heading.vue` — used 14+ places (h2, h3 combos)
   - `Input.vue` — used 5-6 places (like Button.vue pattern)
   - `InfoBox.vue` — consolidates 3 repeated patterns in ended-phase

2. **Phase 2 (Medium Impact)**
   - `FormField.vue` — wraps Input + label (3-4 forms)
   - `EmptyState.vue` — loading/empty states
   - `Alert.vue` — status messages

3. **Phase 3 (Nice to Have)**
   - `PlayerInfo.vue` — player name + description pattern
   - Tailwind class consolidation into CSS modules if needed

## Files to Refactor (Priority Order)

- `ended-phase.vue` — 3x InfoBox pattern, uses Card
- `description-display.vue` — uses Card, empty state, player info
- `guessing-phase.vue` — uses Card, alert box
- `voting-phase.vue` — uses Card, heading patterns
- `running-phase.vue` — uses Card, info display, form input
- `create-game-form.vue` — form field pattern
- `join-game-form.vue` — form field pattern
- `admin/manage-categories.vue` — heading + input patterns
- `admin/manage-words.vue` — heading + input patterns

## Estimated Duplication Reduction

- **Cards**: Remove ~50-60 lines of repeated div/classes
- **Headings**: Consolidate 14+ h2/h3 into 1 component
- **Input**: Remove ~60-80 lines of repeated input classes across 5-6 instances
- **InfoBox**: Replace 3+ repeated patterns
- **Forms**: Standardize label + input patterns with FormField
- **Total**: ~180-250 lines of boilerplate → reusable components

## Risks / Notes

- All color variants must remain available (text-gray-400, text-yellow-400, etc.)
- Some spacing may need tweaking after extraction
- Maintain existing Button component pattern (already extracted)
- Ensure responsive classes are preserved (p-6, px-3, py-2 need context)
