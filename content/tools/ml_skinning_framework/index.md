+++
title = "ML Skinning Framework"
description = "A Modular Non-linear Auto Rigging and Animation System"
date = "2025-07-01"
+++
{{< lead >}}
"Rigging is the Art of Articulation. Not the Art of Naming Attributes or Setting Driven Keys"  --Somebody, somewhere
{{< /lead >}}

Welcome to the ML Skinning Framework — where skinning gets a fresh twist!

What started as a small research project into the world of ML turned into something quite incredible.


{{< timeline >}}

{{< timelineItem icon="code" header="Can ML skin a Pinky Finger?" badge="" subheader="" >}}
This project explores using machine learning to automate the skin weighting process, for… the pinky finger. By training a model on existing skinned assets, we can teach a model to predict joint weights based on mesh and spatial data. The goal is to build an MLP (multilayer perceptron) model that can predict the proper skin weights for a new pinky finger mesh.
{{< /timelineItem >}}

{{< timelineItem icon="code" header="First Model" badge="" subheader="Collecting Basic Data" >}}
I started by batching about 15 assets, gathering data about each vertex influenced by a list of joints. I gathered world position and skin influence. Unfortunately I did not capture a video fo my first test. But it was successful enough to show me the potential of this technology and move forward with a bigger dataset.
{{< /timelineItem >}}

{{< timelineItem icon="youtube" header="Second Model" badge="" subheader="Improving Predictions by Adding Features" >}}
The initial result were not perfect but they showed there was potential.
The initial model was limited to only vertex position as input.
I began exporting additional features per vertex. Vertex normal, blend weights, joint matrices, etc.
The model’s input vector expanded from 3 to 12 dimensions which allowed the model to better understand spatial relationships in the context of deformation.
And here are the results:
<iframe width="560" height="315" src="https://www.youtube.com/embed/MW1jnLHifF0?si=bImht2jOBPu7MVwp" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
{{< /timelineItem >}}

{{< timelineItem icon="youtube" header="Third Model" badge="" subheader="Scaling the Dataset" >}}
With the new features added the model began learning complex relationships between geometry and deformation.
Even with the same 15 character dataset the improvement was dramatic.
Predictions became cleaner, smoother and closer to human painted weights.
Now to see the results of a larger dataset:
<iframe width="560" height="315" src="https://www.youtube.com/embed/qMmAO_AeQVk?si=kkGm9f4I9MQ-eVJU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
I think we can now answer the question. An ML can skin a pinky finger.
{{< /timelineItem >}}

{{< timelineItem icon="youtube" header="Comparing Results" badge="" subheader="Ml vs Human" >}}
With the models now ouputting good skin weights, are the results better than human made?
Additionally, are the results of 131 datasets more accurate than roughly 15? 
<iframe width="560" height="315" src="https://www.youtube.com/embed/BmzBpF_heT4?si=gzGrC-a2Wns5zsKR" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
{{< /timelineItem >}}

{{< timelineItem icon="youtube" header="Can ML skin a Hand?" badge="" subheader="Is an MLP Model suffecient for a more complex mesh?" >}}
After training a model on the vertices of a hand, on about 50 assets. Here are the results.
<iframe width="560" height="315" src="https://www.youtube.com/embed/BmzBpF_heT4?si=gzGrC-a2Wns5zsKR" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
This shows a lot of promise! But I think we are running into the limitation of a simple MLP model. I will next explore using PointNet to give the model a better understanding of the geometry it is working on.
{{< /timelineItem >}}

{{< /timeline >}}

