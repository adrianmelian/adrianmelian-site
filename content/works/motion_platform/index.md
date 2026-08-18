+++
title = "Arizona Sunshine: Motion Platform Helicopter Experience"
# Adrian, 2026-08-18. The images carry the engineering, so the headline gets to be fun.
# Slug stays motion_platform: the URL shipped this morning and does not need churning.
date = "2018-09-18"
aliases = ["/tools/motion_platform/"]

[params]
role = "Technical Artist"
studio = "Nomadic VR"
engine = "Unity"
platform = "Location-based VR"
status = "shipped"
# The title is the fun half, so the subtext carries what the title and the photo cannot:
# that it was real hardware with an engine-side twin driving it.
tagline = "Servo-Driven Machine + Unity Digital Twin"
+++

**Nomadic VR | Technical Artist**

Nomadic built location-based VR, where the room the audience walks into is part of the hardware. For one of those experiences the team built a motion platform: a real servo-driven machine that moves under people while the headset carries the rest.

I programmed its control in Unity and rigged the machine as a digital twin, so moving the rig in engine moved the physical machine on the floor. Animating it was keyframes blended over sine waves running at different frequencies, which is where the rumble and the sway came from.

The engineers on the build came out of practical effects for film, where they had spent years making physical machines and props behave on camera. Finding where their craft stopped and the engine started was most of the work, and it is still one of my favourite things I have built.
