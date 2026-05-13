+++
title = "Michael: the Archangel (Unreal)"
description = "A 3D arena melee beat-em-up I'm building in UE5 — tuning pipeline, anim-driven combat, thread-safe AnimBP."
date = "2026-05-13"

[params]
role = "Solo developer"
studio = "Personal Project"
shipped_year = "In progress"
status = "in_development"
engine = "Unreal Engine 5"
platform = "PC (Steam)"
+++

{{< youtubeLite id="YOUTUBE_ID_PLACEHOLDER" label="Michael: the Archangel — 30s gameplay" >}}

## What it is

A 3D arena melee beat-em-up I'm building solo in **Unreal Engine 5**. Megaman structure, Returnal pacing, South Park tone. One intro stage, six stages in any order, each ending with a boss kill that grants Michael a new power. No meta-progression — die and restart.

## What I built

This page is about the engineering scaffolding under the hood — the part of the work that's TA-flavored rather than gameplay-design-flavored. Three pillars: a **tuning pipeline** that lets me iterate on combat feel without recompiling, an **anim-driven combat system** where animators define hit windows and chain timing on the timeline, and a **thread-safe AnimBP** built on the Lyra snapshot pattern. The combat layer itself — 3-hit combo, charge attack, throw with crowd plow-through, pulse shield, ground slam — sits on top of that scaffolding.

## System: Tuning Pipeline

Tuning is a TA problem disguised as an engineering problem. Every gameplay system in Archangel exposes its tunable values through three coordinated surfaces:

1. A **`UPrimaryDataAsset`** subclass per system (Movement, Camera, Dodge, SoftAim, Attack, HitFeedback, Parry — seven so far) holds the design-time defaults
2. A small **`Archangel::GetTunable`** helper resolves CVar overrides at runtime, so values like `move.run_speed` or `camera.fov` can be hotswapped from the console without a recompile
3. An **on-screen `UDebugHUDComponent`** overlay shows the live state of every tunable system — current values, current combat-state flags, active token counts, meter levels

The whole point is to make iteration loops free. Once a system is wired into this pattern, design-time changes flow through the DA, runtime feel-tuning flows through CVars, and verification is a glance at the HUD. Nothing waits on a programmer to rebuild.

![Debug HUD overlay during PIE — live tunable state for movement, combat, and crowd coordination](/images/projects/archangel/debug-hud.png)

## System: Anim-Driven Combat

Hit windows used to live in the C++ state machine — "Active phase = lasts 0.3 seconds, hit detection on the whole time." That works until the third combo anim has a different windup-to-impact timing, and now you're tuning numbers in C++ to match an animator's intent.

The fix: give animators the timeline as the design surface. I built a `UAnimNotifyState_HitDetect` that any combat anim can drag onto its timeline. The notify boundaries are the hit-active window — independent of whatever state phase the C++ side thinks it's in. Different anims can have different windows. Tuning combat feel becomes an AnimBP-side activity.

```cpp
// AnimNotifyState_HitDetect — drag onto a combat anim's timeline to define
// exactly when the blade is "live." Independent of the C++ state machine's
// Active phase. Different anims can have different notify durations.

UCLASS(meta=(DisplayName="Hit Detect"))
class ARCHANGEL_API UAnimNotifyState_HitDetect : public UAnimNotifyState
{
    GENERATED_BODY()
public:
    virtual void NotifyBegin(USkeletalMeshComponent* MeshComp, UAnimSequenceBase* Anim,
        float TotalDuration, const FAnimNotifyEventReference& EventRef) override;
    virtual void NotifyEnd(USkeletalMeshComponent* MeshComp, UAnimSequenceBase* Anim,
        const FAnimNotifyEventReference& EventRef) override;
};

void UAnimNotifyState_HitDetect::NotifyBegin(USkeletalMeshComponent* MeshComp, ...)
{
    Super::NotifyBegin(MeshComp, Animation, TotalDuration, EventReference);
    if (!MeshComp) return;
    AnimNotifyDispatch::DispatchBegin(MeshComp->GetOwner());
}

void UAnimNotifyState_HitDetect::NotifyEnd(USkeletalMeshComponent* MeshComp, ...)
{
    Super::NotifyEnd(MeshComp, Animation, EventReference);
    if (!MeshComp) return;
    AnimNotifyDispatch::DispatchEnd(MeshComp->GetOwner());
}
```

`AnimNotifyDispatch` routes the begin/end signals to any actor implementing `IHitDetectable`, so the same notify works for Michael's sword, an enemy's claw swipe, or anything else combat-shaped without code changes.

A sibling notify, `UAnimNotify_ChainReady`, sits on the Hold anims (the looping in-between-hits poses). It fires when the AnimBP enters the Hold state, and that's what advances the combo chain — not a C++ tick timer. Mashed input still can't skip hits; each swing has to complete before the next can begin.

## System: Thread-Safe AnimBP (Lyra Snapshot Pattern)

A naive AnimBP reaches back into the game thread to ask the character "are you parrying right now?" That works for one character; it breaks when you've got a dozen enemies all asking the game thread simultaneously every frame.

The Lyra-style fix: **snapshot in, render out.** Each game-thread tick, the C++ AnimInstance copies the relevant component state into BlueprintReadOnly UPROPERTYs on itself. The AnimBP runs Multi Threaded Animation Update and reads those snapshot fields on a worker thread. No game-thread reach-back. Scales to crowd combat without falling over.

```cpp
void UArchangelAnimInstance::NativeInitializeAnimation()
{
    Super::NativeInitializeAnimation();
    CachedCharacter = Cast<AArchangelCharacter>(TryGetPawnOwner());
}

void UArchangelAnimInstance::NativeUpdateAnimation(float DeltaSeconds)
{
    Super::NativeUpdateAnimation(DeltaSeconds);

    if (!CachedCharacter)
    {
        CachedCharacter = Cast<AArchangelCharacter>(TryGetPawnOwner());
    }
    if (!CachedCharacter) return;

    // Snapshot Sword state (game thread; safe).
    if (USwordComponent* Sword = CachedCharacter->FindComponentByClass<USwordComponent>())
    {
        ChainIndex = Sword->GetChainIndex();
        SwordState = Sword->GetState();
    }

    // Snapshot Defense state.
    if (UDefenseComponent* Defense = CachedCharacter->FindComponentByClass<UDefenseComponent>())
    {
        bIsParrying     = Defense->IsParryActive();
        bIsDashing      = Defense->IsDashing();
        bIsInvulnerable = Defense->IsInvulnerable();
    }

    // ...further snapshots for sword meter, special-attack tier, throw, jump-attack state
}
```

The AnimBP's Event Graph is empty. Transitions read C++ UPROPERTYs directly. The pattern extends cleanly to enemies — `UEnemyAnimInstance` follows the same shape with a cached `AMeleeEnemy*`.

## Companion work

{{< wipCard image="/images/projects/archangel/wipcard-kinematic-solutions.png" title="Kinematic Solutions" description="Companion DCC-to-engine tooling — Maya rigging, skinning, and export pipeline for the real Michael rig. Page coming soon." >}}

---

Next up: Plan E. Real Michael rig in Maya, locomotion via distance matching, and the first hand-authored anim pass to replace the capsule placeholder. The scaffolding is ready; the character drops onto it.
