-- Short --

Animation timeline editor for creating and modifying parameter animations over time. View, add, and edit animation keyframes.

-- Long --
# Timeline Tool

A collapsible panel at the bottom of the editor for creating and editing parameter animations. All animated parameters are displayed as line graphs plotted over time.

## Graph

- **X-axis:** Time, formatted as hours/minutes/seconds.
- **Y-axis:** Parameter values (normalized).
- **Current time cursor:** A vertical line showing the current playback position.

## Toolbar

- **Collapse/expand:** Toggle timeline visibility.
- **Tracks list (list icon):** Show or hide the list of animation rule names.
- **Preview on hover (pen icon):** Toggle hover preview — move the cursor over the timeline to see the fractal update at that time point.

## Editing

- **Add steps:** Click on the graph to add new animation keyframes.
- **Move steps:** Drag keyframe points horizontally to change timing, or vertically to change values.
- **Select steps:** Click a keyframe to open its transition editor, where you can choose easing functions and adjust timing.

The timeline shows all dynamic parameter rules simultaneously, giving you a complete overview of how your fractal animation evolves over time.
