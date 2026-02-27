+++
title = "Krazy Kaiju! (Unreal)"
description = "A VR game made in Unreal where a lonely farmer protects his farm from an alien invasion!"
date = "2020-12-01"
+++

Krazy Kaiju! is a personal VR game project I’ve been building in my free time using **Unreal Engine**. The vibe is playful, weird, and slightly unhinged (the best kind): a lonely farmer defending his farm from an alien invasion.

This is a true from-scratch project. I built **everything**: concepting, modeling, texturing, rigging, animation, gameplay engineering, and a full **end-to-end production pipeline** to keep the project scalable as it grows.

While I prototyped occasionally in Blueprints, the systems were **finalized in C++** (because I like sleeping at night knowing things are solid 😄). Oh, and I made the music too.

**Tech Highlights**
- Unreal Engine VR gameplay systems finalized in **C++** (Blueprints used for early prototyping)
- End-to-end content pipeline:
  - Custom **Maya modeling tools** + export tooling
  - **Substance** texturing workflow + asset organization conventions
  - Full **modular rigging system** with export support for Unreal
- Enemy AI behavior (UFO search / abduct / aggro response loop)

This is a small demo of Krazy Kaiju!  
{{< youtubeLite id="CE9qcW61jrQ" label="Krazy Kaiju - Demo" >}}

This is a demo of the UFO A.I. It searches for farm animals, abducts them, and reacts to player interference. Shooting it disrupts the abduction and kicks it into an aggressive state.  
{{< youtubeLite id="T0sFbAQxpeg" label="Krazy Kaiju - UFO AI" >}}
{{< youtubeLite id="0JZoqIEZvuo" label="Krazy Kaiju - The Enemy" >}}
