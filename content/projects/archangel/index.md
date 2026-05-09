+++
title = "Archangel"
description = "A from-scratch melee combat game built in Unreal Engine 5.4 with anim-driven hit detection, modular abilities, and a three-layer designer-tuning architecture."
date = "2026-02-01"

[params]
role = "Solo developer"
studio = "Personal Project"
shipped_year = "In progress"
status = "in_development"
engine = "Unreal Engine 5.4"
platform = "PC"
+++

**Archangel | Personal Project | Solo developer | In progress**

Archangel is a from-scratch melee combat game built in Unreal Engine 5.4 — tight, arcade-style 3D combat where the architecture serves the find-the-fun loop, not the other way around.

**Architecture highlights**

- **Anim-driven hit detection** — A unified `IHitDetectable` interface lets any actor (player, melee enemy, future bosses) expose hit windows via a single `UAnimNotifyState_HitDetect`. The same notify class drives sword swings and enemy claws — combat logic decouples cleanly from actor type. Blade sweeps run per-tick, deduped per swing.
- **Lyra-style snapshot AnimInstance pattern** — Game-thread state (chain index, sword state, parry, charge meter, special-attack tier) snapshots into thread-safe `UPROPERTY`s every tick. AnimBPs run on worker threads reading those snapshots — zero thread-safety issues during animation evaluation, no game-thread access on the worker side.
- **Modular ability components** — Plain `UActorComponent` derivatives compose on the player: SwordComponent, DefenseComponent, ChargeMeterComponent, ThrowComponent, JumpAttackComponent, SpecialAttackComponent. No Gameplay Ability System overhead — the per-component approach scales to the moveset without GAS's complexity tax.
- **Three-layer designer tuning** — Data Assets persist values across PIE; CVar overrides allow live tuning during play without recompiles; an on-screen Debug HUD shows real-time state. At iteration close, baked CVar values flip back to Data Assets. Zero recompile loops during find-the-fun work.

Built in Unreal Engine 5.4 with C++ for gameplay logic and Blueprints for designer-facing data assets and tuning. Find-the-fun iteration is embedded in the development cadence rather than treated as a separate phase: small chunks of C++ land, get PIE-tested, get tuned via CVars, then the values bake into Data Assets — no waterfall, no recompile loops.
