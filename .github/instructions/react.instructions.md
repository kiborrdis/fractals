---
applyTo: '**/*.tsx'
---

- All prop types should be inlined.
- There should not be React.FC declaration, component type must be infered by ts
- Prefer mantine components where possible for layout. If need custom styling prefer css modules over inline styles
- Only add comments if the code is not self explanatory. Aim for self documenting code.
- Do not use React.<something>, import <something> directly
- When working with zustland store, prefer to create custom hooks for specific pieces of state, or using already defined hooks and actions instead of using the store directly in the component