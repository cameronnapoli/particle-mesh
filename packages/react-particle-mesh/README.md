# react-particle-mesh

[![npm](https://img.shields.io/npm/v/react-particle-mesh)](https://www.npmjs.com/package/react-particle-mesh)

An interactive Three.js particle grid for React. Each particle is held in place by a damped spring and pulled toward the cursor.

## Install

```sh
npm install react-particle-mesh three
```

`react` (18+) and `three` are peer dependencies.

## Usage

```tsx
import { ParticleMesh } from 'react-particle-mesh';

export default function Hero() {
  return (
    <div style={{ height: 480 }}>
      <ParticleMesh backgroundColor="#0b0b10" particleColor={() => '#7aa2ff'} />
    </div>
  );
}
```

The mesh fills its parent, so give the parent a size. It works in Next.js server components out of the box (the package ships with `'use client'`).

## Props

All props are optional.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `particleColumnCount` | `number` | `80` | Particles per row. Rows are derived from the aspect ratio. |
| `particleSize` | `number` | `5` | Particle size in CSS pixels. |
| `particleColor` | `(index: number) => Color` | random blues | Color of each particle. Applied when the grid is built. |
| `backgroundColor` | `Color` | `'#f0f0f0'` | Canvas and container background. |
| `mouseGravityStrength` | `number` | `6` | How strongly the cursor pulls particles. |
| `mouseGravityRadius` | `number \| null` | `null` | Cursor pull range in pixels; `null` for unlimited. |
| `anchorSpringConstant` | `number` | `0.1` | Spring stiffness pulling particles back home. |
| `anchorDampingConstant` | `number` | `0.1` | Spring damping; higher settles faster. |
| `interactive` | `boolean` | `true` | Set `false` to ignore the cursor. |
| `debug` | `boolean` | `false` | Draws the tracked cursor position. |
| `className` | `string` | | Class on the container. |
| `style` | `CSSProperties` | | Style on the container; overrides the default 100% width and height. |

`Color` is any CSS color string or hex number (`'#7aa2ff'`, `'tomato'`, `0x7aa2ff`).

Changing `particleColumnCount` or `debug`, or resizing the container, rebuilds the grid. Other props apply immediately.

## Behavior

- Animation pauses while the mesh is scrolled out of view.
- Cursor attraction is disabled when the user prefers reduced motion.
- Touch and pen input are supported.

## License

MIT
