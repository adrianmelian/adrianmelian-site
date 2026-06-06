+++
title = "Michael: the Archangel (Unreal)"
description = "A 3D arena melee beat-em-up I'm building in UE5, milestone by milestone."
date = "2026-05-13"

[params]
term_title = "Unreal 5.4"
role = "Solo developer"
studio = "Personal Project"
shipped_year = "In progress"
status = "in_development"
engine = "Unreal Engine 5.4"
platform = "PC (Steam)"
+++

{{< milestoneCard date="2026-06-05" title="Combat & Locomotion Update" >}}

Here's where the build is at right now. Michael's locomotion and combat are running off the new hand-authored anim set, no more capsule placeholders. Early enemy AI is in, driving combat behavior against him. Engine side: a Lyra-style thread-safe AnimBP and an anim-driven combat pipeline, all the moment-to-moment feel I've been dialing in over the last few weeks. Animation authored in Maya, rigs built with [Kinematic Solutions](/tools/kinematic_solutions/).

{{< youtubeLite id="uTYBit029t4" label="Archangel, combat & locomotion update" >}}

{{< /milestoneCard >}}

{{< milestoneCard date="2026-06-05" title="Character animation: Michael & Dybbuk" >}}

Here's a little showcase of the animations I made for the game. Heavily inspired by UPA and Hanna-Barbera animation styles. Walk cycles, run cycles, attacks, combos, hit reacts, and death animations have been my concentration these past few weeks as I dial in the moment-to-moment gameplay feel. Lots of back-and-forth between gameplay engineering in Unreal and animation tuning and polish in Maya. I hope you enjoy!

**Michael:** Our main hero. The Archangel, the celestial high priest, the weigher of souls, and the great adversary of Satan.

**Dybbuk:** The restless soul of a dead sinner that attaches to and possesses a living person.

{{< youtubeLite id="J5qKUvMIGcw" label="Michael & Dybbuk, character animation reel" >}}

{{< /milestoneCard >}}

{{< milestoneCard date="2026-05-12" title="Final Michael model & rig" >}}

Model, rig, and texture pass. Concept, modeling, texturing, and rigging all by me. Modeled the base shape in **Maya**, sculpted in **Blender**, textured in **Substance Painter**, and rigged with [**Kinematic Solutions' Fabricator**](/tools/kinematic_solutions/#fabricator). Next up: Unreal integration, using motion matching plus hand-authored animation sets for Michael (and the enemy character), then swapping out the capsule placeholders.

{{< loopVideo src="/MichaelRig.mp4" alt="Michael rig demonstration loop" >}}

{{< figure src="/MichaelPainter.png" alt="Michael, Substance Painter beauty render" >}}

{{< /milestoneCard >}}

{{< milestoneCard date="2026-05-06" title="Combat prototyping" >}}

Three pillars landed. **Tuning pipeline**: every system exposes its values through a Data Asset, a console-variable override, and an on-screen debug HUD, so nothing waits on a recompile. **Anim-driven combat**: hit windows and chain timing live on the animation timeline (`UAnimNotifyState_HitDetect`), not in C++ tick code. **Thread-safe AnimBP**: Lyra-style snapshot pattern. Game-thread C++ writes UPROPERTYs, AnimBP reads them on a worker thread. Scales to crowd combat. Hand made placeholder animations for the capsules.

{{< figure src="/HUD.png" alt="Debug HUD overlay during PIE, showing live tunable state for movement, combat, and crowd coordination" lightbox="true" >}}

{{< youtubeLite id="ctlpTh4ypgU" label="Michael the Archangel, 30s gameplay" >}}

{{< /milestoneCard >}}
