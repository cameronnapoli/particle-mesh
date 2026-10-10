# Particle mesh

An interactive Three.js particle grid. Each particle is held in place by a damped spring and pulled toward the cursor.

![Screenshot of particle mesh simulation](screenshot.png)

- [`packages/react-particle-mesh`](packages/react-particle-mesh) — the React component, published to npm as [`react-particle-mesh`](https://www.npmjs.com/package/react-particle-mesh)
- [`apps/demo`](apps/demo) — Next.js demo site

```sh
bun install
bun dev        # builds the package in watch mode and serves the demo at http://localhost:8000
bun run test
bun run lint
bun run build
```
