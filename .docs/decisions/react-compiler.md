# React Compiler decision

Decision date: 2026-05-26

## Decision

Do not enable React Compiler for the whole project yet.

## Context

The project currently uses:

- Next.js 16.2.9
- React 19.2.7
- eslint-plugin-react-hooks 7.0.1

Next.js 16 supports React Compiler, but enabling it adds another moving part to builds and debugging. The app does not currently have measured render bottlenecks that justify enabling the compiler globally.

## Options considered

### Do not enable React Compiler

Use the current React and Next.js setup. Continue fixing render issues with measurement, component structure, and targeted memoization.

This is the current recommendation.

### Enable annotation mode

Install `babel-plugin-react-compiler` and configure:

```js
const nextConfig = {
  reactCompiler: {
    compilationMode: 'annotation',
  },
}
```

Use `"use memo"` only in measured hot components.

This is acceptable for experiments when there is a concrete component to test.

### Enable globally

Set:

```js
const nextConfig = {
  reactCompiler: true,
}
```

This is not recommended until the project has measured performance issues or the compiler becomes a safer default for this stack.

## Revisit when

- React Compiler is stable enough for the project risk profile
- The app has measured render bottlenecks
- Dashboard tables, editors, or product pages show real interaction lag
- A targeted annotation-mode experiment proves useful

## Validation before enabling

- Run `npm run typecheck`
- Run `npm run lint`
- Run `npm run build`
- Test dashboard list pages, product detail, cart, checkout, and account pages
- Compare build time before and after the change
