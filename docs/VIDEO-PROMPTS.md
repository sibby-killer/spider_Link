# Hero video — AI generation prompts

The current hero is a live 3D scene (`src/components/HeroScene3D.tsx`). The
goal here is a **real, rendered brand loop** to use instead of (or behind) the
3D scene. Keep it short, dark and red — the logo must stay recognisable.

## Before you generate (important)

1. **Do not ask the AI to draw the logo from text.** Text-to-video models
   redraw and distort logos. Use **image-to-video** and upload the real logo
   PNG/SVG as the start frame (or the "reference image" if the tool supports
   it). Ask the model to animate *around* the logo, not to recreate it.
2. **Best fidelity method:** generate an abstract fibre/red-light background
   loop, then composite the real logo (SVG or transparent PNG) on top in
   CapCut / Canva / After Effects. This is the safest option for brand use.
3. Generate **16:9 for desktop** and **9:16 for mobile**. Do not crop one into
   the other.
4. Ask for **seamless loop**, **no text**, **no watermark**, **no camera cuts**.
5. Pick the quietest clip. The hero has headline text and buttons over it — a
   busy video hurts conversion and performance.

## Prompt 1 — "Logo ignition" (hero, 16:9)

> Animate the uploaded Spider Link logo on a near-black background (#0B0B0B).
> Thin glowing red fibre-optic strands (#E60000) sweep in from the edges and
> converge behind the spider mark. The spider's body slowly ignites with a deep
> red rim light while the three Wi-Fi arcs above it pulse outward one after
> another. Fine red embers and dust particles drift upward. Slow cinematic
> push-in, shallow depth of field, glossy reflections, premium tech commercial
> look. The logo stays perfectly still, centred and undistorted. Seamless
> 8-second loop, no text, no cuts, no extra logos.

**Negative:** text, letters, watermark, logo distortion, extra legs, morphing,
camera shake, cuts, bright white background, cartoon style.

## Prompt 2 — "Signal web" (hero alternative, 16:9)

> Top-down macro shot of a dark spider web made of glowing red fibre-optic
> threads on a black surface. Bright signal pulses travel along the threads
> toward the centre, where the uploaded Spider Link logo sits, lit by soft red
> light. The three Wi-Fi arcs above the logo ripple like slow sonar rings.
> Subtle parallax, ultra-slow camera drift, cinematic contrast, black and red
> only. The logo remains sharp and unchanged. Seamless 8-second loop, no text,
> no watermark.

**Negative:** realistic spider, insects, scary, web strands crossing the logo,
text, watermark, fast motion, flicker.

## Prompt 3 — "Fibre to the home" (brand story, 16:9)

> Cinematic night shot of a modern Kenyan home exterior, warm window light, a
> single glowing red fibre line running cleanly along the wall and disappearing
> into a small router. Red signal arcs pulse softly from the router. The camera
> glides slowly along the cable toward the door. Minimal, premium, dark, red
> and warm amber palette. No people, no text. Ends with the uploaded Spider
> Link logo fading in over the dark sky. 8 seconds, smooth motion, no cuts.

**Negative:** daylight, crowds, logos on the house, text, watermark, distorted
architecture, fast camera, cartoon.

## Prompt 4 — "Particle assembly" (mobile hero, 9:16)

> Vertical composition, near-black background. Thousands of tiny red light
> particles spiral inward and assemble into the uploaded Spider Link logo in
> the centre. Once formed, the Wi-Fi arcs above the spider pulse outward in
> sequence and a soft red glow blooms behind the mark. Slow upward drift,
> macro depth of field, premium tech aesthetic. Logo stays crisp and centred.
> Seamless 8-second loop, no text, no watermark.

**Negative:** text, letters, watermark, extra shapes, broken logo, fast
spinning, lens flare overload, white background.

## Prompt 5 — "Living network map" (mobile, 9:16)

> Vertical shot of a dark abstract map of Kakamega and Bungoma counties drawn
> in faint red lines. Small nodes light up one by one and connect with glowing
> fibre paths; the paths converge into the uploaded Spider Link logo at the
> centre. Soft pulsing Wi-Fi arcs, floating dust, slow zoom. Black background,
> red and white accents, premium and calm. Seamless 8-second loop, no text, no
> labels, no watermark.

**Negative:** real map labels, country borders, text, watermark, busy
animation, fast cuts.

## Prompt 6 — "Ambient background" (behind sections, 16:9)

> Extremely subtle abstract background: slow-moving dark red light waves and
> faint fibre threads on a near-black surface, like signal travelling through
> glass. Very low contrast, no focal point, no logo, no objects. Designed to
> sit behind white text without competing with it. Seamless 10-second loop, no
> text, no watermark.

**Negative:** bright colours, faces, logos, text, fast movement, high contrast,
particles in the centre.

## Prompt 7 — "Metal emblem" (premium variant, 16:9)

> The uploaded Spider Link logo rendered as a polished dark-metal emblem with
> red edge lighting, floating in a black studio void. A slow 20-degree orbit
> reveals glossy reflections. Red light pulses travel through the Wi-Fi arcs.
> Volumetric haze, macro lens, luxury product-film lighting. Logo geometry
> stays exact and undistorted. Seamless 8-second loop, no text, no watermark.

**Negative:** chrome rainbow, deformation, extra limbs, text, watermark,
spinning logo, bright studio background.

## Free / low-cost tools

Free tiers and rate limits change often — check the current limits before
committing to a tool.

| Tool | Why use it | Watch out for |
| --- | --- | --- |
| **Google Gemini / Flow (Veo)** | Best prompt understanding; image-to-video with a reference image; 8s clips | Free access is limited/queued; watermark on some tiers; paid credits for more |
| **Kling AI** | Strong image-to-video, daily free credits | Queue times; logo can drift — use the real logo as start frame |
| **Hailuo AI (MiniMax)** | Daily free credits, good motion quality | Short clips; watermark on free tier |
| **Luma Dream Machine** | Free tier, easy image-to-video | Monthly generation cap |
| **Runway** | High quality, good control | Free credits are one-off; paid after |
| **Wan (open source) via Hugging Face / ModelScope** | Genuinely free if you wait in the GPU queue; runs the model yourself | Slow queue; setup effort; quality varies |
| **LTX Studio** | Storyboard + video, free trial | Watermark/limits on free plan |

**Recommendation:** use **Gemini/Veo first** (you already have access), with the
real logo uploaded as the start frame and Prompt 1. If the logo distorts, use
**Kling** or **Hailuo** with the same prompt, then composite the crisp logo on
top. For a zero-cost option, use **Wan** on Hugging Face and accept the queue.

## After you generate

- Choose one 6–8s clip; trim to 6s.
- Export **1920×1080 H.264 MP4**, target **under 5 MB** (mobile: 1080×1920).
- No audio track.
- Keep a **poster frame** (first frame, JPG/WebP) for `prefers-reduced-motion`
  and for the moment before the video starts.
- Deliver as `public/brand/hero-loop.mp4` (desktop) and
  `public/brand/hero-loop-mobile.mp4` (mobile), plus `hero-poster.jpg`.
- Tell the developer to wire it in — the 3D scene stays as the fallback and
  for reduced-motion users.
