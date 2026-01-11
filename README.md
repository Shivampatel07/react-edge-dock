# react-edge-dock

A zero-dependency React + TypeScript library for customizable draggable edge-docked floating buttons with popup support.

## Features

- 🎯 Zero dependencies (React only)
- 🎨 Fully customizable and headless
- 📱 Touch and pointer event support
- 🎬 Smooth animations with spring physics
- 📦 TypeScript first with full type safety
- 🎮 Multiple docking modes (free, auto, manual)
- 💡 Smart popup positioning
- ⚡ Performance optimized with transform: translate3d
- 🌐 **SSR compatible (Next.js, Remix, etc.)**
- 📏 **Configurable edge offset/margin**

## Installation

```bash
npm install react-edge-dock
```

## Quick Start

```tsx
import { EdgeDock } from 'react-edge-dock';

function App() {
  return (
    <EdgeDock
      dockMode="auto"
      animation={true}
      edgeOffset={16} // 16px gap from screen edge
      button={<button>🚀</button>}
      popup={<div>Your content here</div>}
    />
  );
}
```

## Usage in Next.js

Works out of the box with Next.js App Router and Pages Router:

```tsx
'use client'; // For App Router

import { EdgeDock } from 'react-edge-dock';

export default function MyComponent() {
  return (
    <EdgeDock
      dockMode="auto"
      edgeOffset={20}
      button={<button>Menu</button>}
      popup={<div>Navigation</div>}
    />
  );
}
```

## Configuration

- `dockMode`: `"free"` | `"auto"` | `"manual"` - Docking behavior
- `dockEdge`: `"left"` | `"right"` | `"top"` | `"bottom"` - Fixed edge (manual mode)
- `allowedEdges`: `DockEdge[]` - Restrict docking to specific edges (e.g., `['left', 'right']` for horizontal only)
- `edgeOffset`: `number | { left?: number; right?: number; top?: number; bottom?: number }` - Gap from edges in pixels
- `animation`: `boolean` - Enable snap animations
- `popupGap`: `number` - Gap between button and popup
- `position`: `{ x: number; y: number }` - Initial/controlled position
- `zIndex`: `number` - z-index for the dock
- `onDockChange`: Callback when dock state changes
- `isPopupOpen` / `onPopupChange`: Controlled popup state

## Examples

### Same offset for all edges

```tsx
<EdgeDock
  dockMode="auto"
  edgeOffset={16}
  button={<button>🚀</button>}
/>
```

### Different offset for each edge

```tsx
<EdgeDock
  dockMode="auto"
  edgeOffset={{ left: 10, right: 20, top: 15, bottom: 25 }}
  button={<button>🎯</button>}
/>
```

### Restrict to horizontal edges only (left/right)

```tsx
<EdgeDock
  dockMode="auto"
  allowedEdges={['left', 'right']}
  edgeOffset={{ left: 16, right: 24 }}
  button={<button>📱</button>}
/>
```

### Restrict to vertical edges only (top/bottom)

```tsx
<EdgeDock
  dockMode="auto"
  allowedEdges={['top', 'bottom']}
  button={<button>⬆️</button>}
/>
```

### Manual edge with offset

```tsx
<EdgeDock
  dockMode="manual"
  dockEdge="right"
  edgeOffset={{ right: 20 }}
  button={<button>➡️</button>}
/>
```

## API

See the [example.tsx](https://github.com/Shivampatel07/react-edge-dock/blob/master/example.tsx) file for more detailed usage examples.
