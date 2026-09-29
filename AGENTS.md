# Chowly

A MERN food delivery platform in three apps:

- `api/` — TypeScript Express 5 API (`/api/v1`), MongoDB + Mongoose, Passport JWT.
- `mobile/` — Expo SDK 57 + expo-router app serving both customers and drivers, routed by role.
- `admin/` — Vite + React 19 backoffice.

## Project documents

- [Chowly v1 plan](docs/plans/2026-09-03-chowly-v1.md) — specification, confirmed decisions,
  assumptions, risks, and the M0–M4 implementation plan. Source of truth for v1 scope; update it in
  place rather than creating a second plan.
- [Mobile design](docs/design/mobile-design.md) — locked visual system for `mobile/` (teal palette,
  Inter, spacing/radii), screen inventory, states, asset prompts, and the board prompt. Build screens
  from these values; do not invent new tokens.

## Notes for agents

- `mobile/AGENTS.md` applies inside `mobile/` — read the versioned Expo 57 docs before writing Expo code.
- The `api` dev runner is `tsx` (not `ts-node`, which is incompatible with the installed TypeScript 7).
