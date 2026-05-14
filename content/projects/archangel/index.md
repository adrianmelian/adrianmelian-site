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

{{< youtubeLite id="ctlpTh4ypgU" label="Michael the Archangel, 30s gameplay" >}}

{{< milestoneHeading date="2026-05-13" title="Real Michael model & rig" >}}

Model, rig, and texture pass landed today. Stylized hand-built rig in **Maya**, beauty render out of **Substance Painter**. Up next: Unreal integration, with distance-matching locomotion and a hand-authored anim pass to replace the capsule placeholder.

{{< loopVideo src="/MichaelRig.mp4" alt="Michael rig demonstration loop" >}}

{{< figure src="/MichaelPainter.png" alt="Michael, Substance Painter beauty render" >}}

{{< milestoneHeading date="2026-05-06" title="Combat foundation" >}}

Three pillars landed. **Tuning pipeline**: every system exposes its values through a Data Asset, a console-variable override, and an on-screen debug HUD, so nothing waits on a recompile. **Anim-driven combat**: hit windows and chain timing live on the animation timeline (`UAnimNotifyState_HitDetect`), not in C++ tick code. **Thread-safe AnimBP**: Lyra-style snapshot pattern. Game-thread C++ writes UPROPERTYs, AnimBP reads them on a worker thread. Scales to crowd combat.

{{< figure src="/HUD.png" alt="Debug HUD overlay during PIE, showing live tunable state for movement, combat, and crowd coordination" >}}
