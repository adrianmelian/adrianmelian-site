+++
title = "About"
date = "2025-07-09"

[params]
phone     = "914.874.3390"
location  = "Denver, CO / California (Relocation Ready)"
email     = "adrianmelian123@gmail.com"
resume    = "/adrianmelian_resume.pdf"
portrait  = "featured.png"

bio = [
  "I'm a Technical Artist who designs the systems other artists ship through. Across 14 years at studios like Sledgehammer Games, Meta, Double Fine, and Ubisoft, I've shipped characters, rigs, and pipelines on Call of Duty, Horizon Worlds, South Park, and Broken Age — and as the work has scaled, so has my focus: from building individual tools to designing the architectures that let teams build their own.",
  "My current work runs in two parallel lanes. **KinematicSolutions** is a Maya rigging framework where components are declarative contracts — each module exposes plugs, validators, and option schemas, and new component types slot into the palette automatically. Templates live on disk as YAML blueprints; per-character instances persist in the scene; a reactive PySide6 UI keeps both in sync as you work, no save-reload cycles. **Archangel** is a from-scratch Unreal 5 melee combat game where hit detection runs through an `IHitDetectable` interface, abilities are composable plain components, and a three-layer tuning system (data assets + console variables + debug HUD) lets designers iterate without recompiles. Different domains, same architecture lesson: design systems that get out of the way of the people using them.",
  "Underneath all of this is an ongoing exploration into machine learning for rigging — auto-skinning, rig-setup automation, ML-augmented artist workflows — aimed at cutting per-character cost while protecting deformation quality. My approach blends technical precision with artistic sensibility, and I thrive in cross-functional environments where engineering, design, and art share the same vocabulary."
]

about_me = [
  { heading = "Communication", text = "Authored internal style guides, tech tutorials, training documents, and pipeline documentation. Frequently collaborated with cross-discipline teams, from art to engineering. Delivered presentations, live demos, and 1-on-1 training to onboard artists and support adoption of new tools." },
  { heading = "Leadership", text = "Led Sledgehammer's Character Tech Art team on three Call of Duty titles. Managed, trained, and art-directed internal and offshore artists. Oversaw large-scale rigging and skinning pipelines with consistent quality control. Delegated tasks, reviewed work, and maintained consistency across complex multi-project pipelines." }
]

[params.skills]
disciplines = ["Rigging", "Animation", "Modeling", "Tools", "Scripting", "Game design", "Gameplay programming", "Graphic design"]
software    = ["Maya", "Unreal", "Unity", "ZBrush", "Painter", "Git", "Perforce"]
languages   = ["Python", "PyQt", "PyTorch", "C++", "C#", "Lua", "Hugo"]

[[params.experience]]
type        = "work"
header      = "Independent / Personal Projects"
role        = "Technical Artist & Systems Architect"
location    = "Denver, CO"
year_range  = "Mar 2026 – Present"
titles      = "KinematicSolutions, Archangel, ML rigging research"
bullets = [
  "Building KinematicSolutions — a blueprint-driven Maya rigging framework with contract-based components, two-tier storage authority (YAML templates on disk, per-character state in scene), and a reactive PySide6 authoring UI",
  "Building Archangel — a from-scratch UE5 melee combat game with anim-driven hit detection (`IHitDetectable` interface), modular ability components, and a three-layer designer-tuning system (data assets, CVars, debug HUD)",
  "Continuing ML research into auto-skinning and rig-setup automation — exploring AI-augmented artist workflows aimed at cutting per-character cost while protecting deformation quality"
]

[[params.experience]]
type        = "work"
header      = "Camouflaj @ Meta"
role        = "Expert Technical Artist"
location    = "Remote"
year_range  = "Sep 2025 – Mar 2026"
titles      = "Unannounced Title (2026)"
bullets = [
  "Designed and implemented advanced Maya tools, studio preference systems, and asset stubbing frameworks to streamline setup, prototyping, and daily artist workflows",
  "Partnered with Meta internal teams to troubleshoot complex Horizon engine challenges"
]

[[params.experience]]
type        = "work"
header      = "Sledgehammer Games"
role        = "Lead Technical Artist"
location    = "Remote"
year_range  = "Jan 2021 – Sep 2025"
titles      = "Vanguard (2021), MW3 (2023), Unannounced Title (2026)"
bullets = [
  "Led the Character Tech Art team; trained and managed internal and OS artists",
  "Led the Weapons Tech Art team; trained and managed internal and OS artists and built a modular rigging solution",
  "Developed and maintained character, animation, and rigging workflows",
  "Created proprietary tools for animation, rigging, and cloth simulation",
  "Skinned high-fidelity characters, including celebrity likenesses like Snoop Dogg",
  "Balanced and optimized character assets for in-engine performance"
]

[[params.experience]]
type        = "work"
header      = "Meta"
role        = "Technical Artist"
location    = "Menlo Park"
year_range  = "Nov 2018 – Dec 2020"
titles      = "Meta Horizon Worlds (2021)"
bullets = [
  "Created artist-facing tools and animation exporters",
  "Built performance-optimized workflows for VR",
  "Developed a Figma-to-ReactVR plugin"
]

[[params.experience]]
type        = "work"
header      = "Nomadic VR"
role        = "Senior Technical Artist"
location    = "San Rafael"
year_range  = "Dec 2017 – Nov 2018"
titles      = "Arizona Sunshine: Rampage (2018)"
bullets = [
  "Integrated LEAP Motion VR",
  "Calibrated OptiTrack & Motive systems",
  "Prototyped LBE VR experiences and digital-physical rigs"
]

[[params.experience]]
type        = "work"
header      = "NCSoft"
role        = "Senior Technical Artist"
location    = "San Mateo"
year_range  = "Jan 2017 – Dec 2017"
titles      = "Unannounced Title (2018)"
bullets = [
  "Built main character rigs and batch rigging tools",
  "Developed a modular auto-rigging system and animation retargeting tools",
  "Created 30+ rigs for hero and enemy characters"
]

[[params.experience]]
type        = "work"
header      = "Ubisoft"
role        = "Senior Technical Artist"
location    = "San Francisco"
year_range  = "Aug 2016 – Dec 2016"
titles      = "South Park: The Fractured But Whole (2017)"
bullets = [
  "Rigged 2D/3D characters",
  "Authored pipeline and 2D flipbook animation tools"
]

[[params.experience]]
type        = "work"
header      = "ToyTalk Inc. (now Pullstring Inc.)"
role        = "Senior Technical Artist"
location    = "San Francisco"
year_range  = "Oct 2015 – Jul 2016"
titles      = "Unannounced Title (2016)"
bullets = [
  "Rigged all characters across multiple projects",
  "Built a pose/animation library, Trax editor pipeline, lip-sync tools, and Maya–Unity exporters",
  "Authored planetary shaders for procedural galaxy rendering"
]

[[params.experience]]
type        = "work"
header      = "Perfect World Entertainment"
role        = "Technical Artist"
location    = "Redwood City"
year_range  = "Mar 2015 – Oct 2015"
titles      = "Unannounced Title (2016)"
bullets = [
  "Rigged and animated characters, props, and buildings for mobile games",
  "Built Maya to Unity export tools"
]

[[params.experience]]
type        = "work"
header      = "Double Fine Productions"
role        = "Technical Artist"
location    = "San Francisco"
year_range  = "Jan 2012 – Nov 2014"
titles      = "Multiple titles"
bullets = [
  "Costume Quest 2 — Rigged/skinned 26 of 28 characters, animated gameplay and cutscenes",
  "Broken Age — Modeled, rigged/skinned 40+ characters, built flipbook animation system",
  "Massive Chalice — Created map-editing and randomization tools based on CSV input",
  "Spacebase DF-9 — Animation/Rigging",
  "My Alien Buddy — Concepted and prototyped gameplay, created all characters, and wrote Lua scripts",
  "Kinect Party — Updated tools, authored animation transfer tools",
  "Worked on multiple Amnesia Fortnight titles (Little Pink Best Buds, Dear Leader, Black Lake, White Birch)"
]

[[params.experience]]
type        = "work"
header      = "Concept Art House"
role        = "Technical Artist & Project Manager"
location    = "San Francisco"
year_range  = "Feb 2011 – Sep 2011"
bullets = [
  "Created MEL-based auto-rigging tools for bipeds and quadrupeds",
  "Managed outsourcing teams, tracked production, and maintained quality",
  "Authored style guides, tutorials, and assignments for external partners",
  "Worked across various social and browser-based games (Zoo World 2, Legacy of a Thousand Suns, Vegas City, etc.)"
]

[[params.experience]]
type        = "education"
header      = "Art Institute of California — San Francisco"
role        = "B.S. in Media Arts & Animation"
year_range  = "Sep 2006 – Dec 2010"
bullets = [
  "Best Portfolio Award 2010"
]

[[params.experience]]
type        = "education"
header      = "SUNY Sullivan — New York"
role        = "A.S. in Graphic Design"
year_range  = "Aug 2004 – Aug 2006"
bullets = [
  "Coursework focused on graphic design fundamentals"
]
+++

A short bio and the people, places, and projects that have shaped my career.
