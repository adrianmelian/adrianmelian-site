+++
title = "KinematicSolutions"
description = "A blueprint-driven Maya rigging framework with contract-based components and a reactive PySide6 authoring UI."
date = "2026-01-15"

[params]
role = "Solo developer"
studio = "Personal Project"
shipped_year = "In progress"
status = "in_development"
engine = "Maya 2024+"
platform = "Maya"
+++

**KinematicSolutions | Personal Project | Solo developer | In progress**

KinematicSolutions is a Maya rigging framework built around a simple idea: components should declare their own contracts. Each rig module — a spine, an IK arm, an eyeball — exposes plugs (the outputs other modules can connect to), validators (rules the module knows about itself), and an option schema (the form fields the artist sees in the palette). New component types just slot in; the system auto-discovers them, generates UIs from their schemas, validates their connections, and computes the build order from their plug graph.

**Architecture highlights**

- **Two-tier storage authority** — YAML blueprints on disk define template recipes that version cleanly through git; per-character instances persist in the Maya scene. Templates and instances stay in sync without manual rebuild cycles.
- **Component contracts** — Declarative `Contract` metadata drives auto-discovery, palette UI generation, build-order topology sorting, and plug resolution. New component types are Liskov-substitutable — third-party riggers can extend the system without touching core code.
- **Reactive PySide6 UI** — Four-panel authoring (blueprint selector, palette, canvas tree, properties panel, logger) with every property edit auto-saving to scene state. Joint trees, component assignments, and nested properties update in real time — no save-reload-rebuild loops.
- **DAG validation before build** — A 12-rule validator catches schema, hierarchy, and plug-graph errors before the build runs, with clear error messages pointing at the specific module that's misconfigured.

The system follows a three-phase workflow — *Create Guides → Build Skeleton → Build Modules* — with phase awareness guarding destructive operations.

Built in Python 3.8+ with PySide6 and PyYAML, targeting Maya 2024+. Successor to the earlier [Rig Authoring Framework]({{< ref "rig_authoring_framework/index.md" >}}) — same philosophy of declarative, modular rigging, rebuilt with full contract semantics and a reactive UI.
