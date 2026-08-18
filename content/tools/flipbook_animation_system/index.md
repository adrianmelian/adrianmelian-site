+++
title = "Flipbook Rigging and Animation System"
date = "2015-03-04"

[params]
role = "Technical Artist"
studio = "Double Fine Productions"
shipped_year = "2015"
status = "shipped"
+++

**Broken Age | Double Fine Productions | Technical Artist**

Broken Age had to move like one of Nathan Stapley's paintings. Rebuilding the characters as ordinary 3D models would have thrown that artwork away, and pre-rendering them as sprite sheets would have cost gigabytes per character.

So the studio went hybrid, on an approach it called 2.5D. Hand-painted artwork arrives as an exploded view, with every piece that needs to move on its own already broken out. Those pieces get mapped onto flat planes with alpha, and the planes get bound to a joint chain. From there an animator poses and deforms it like any other rig.

{{< loopVideo src="/flipbook_pull_apart.mp4" alt="A character rig pulled apart into its separate painted planes, then reassembled" >}}

The flipbook half is the visibility. Every plane can be keyed on or off, so a character gets redrawn mid-motion while the joints keep deforming underneath. A 180 degree turn is mostly planes swapping: the head leads, the body follows, the legs arrive last. Front, side and back views all live on one rig rather than three, and none of them are straight on, which is what stops the characters flattening out against the painted backgrounds.

{{< loopVideo src="/flipbook_2d_layers.mp4" alt="A hand-painted character animating as layered flat planes" >}}

Rigs ran 20 to 60 joints. The arms come off the body so the shoulders can travel across the silhouette on a turn, while the clavicles stay attached to the torso so it still deforms. Faces are planes too, with the eyelids, the eyeball plate, the pupil and the specular highlight all separate, and the highlight deliberately kept off the pupil so it stays put while the eye moves underneath it.

I built the Flipbook Animation Control Center, the Maya tool that drove it for Act 2. Before it existed, animators dug through channel-box menus and keyed plane visibility by hand. After it, a filtered list of every flipbook on the character sat in one window: click a control to toggle it, yellow means on, and with auto key enabled the click sets the key for you.

{{< loopVideo src="/flipbook_control_center.mp4" alt="The Flipbook Animation Control Center switching a character between front, side and back views" >}}

The whole of Shay came in around 36 megabytes, rig, animation and textures together. The sprite-sheet version of the same character would have been 7.4 gigabytes.

Double Fine's lead animator, Raymond Crook, presented the system at GDC 2015.

{{< youtubeLite id="iWEVY4ujyI4" label="Animation Style and Process for Broken Age" >}}
