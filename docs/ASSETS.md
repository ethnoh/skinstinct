# Image assets and prompts

All generated images used the built-in image generation tool. Optimized copies live in public/images and do not depend on generated-image directories on the development machine.

| Asset | Use |
| --- | --- |
| public/images/procedure-youth.webp | Procedure card, owner photoshoot IMG_5311.jpeg. |
| public/images/procedure-glow.webp | Procedure card, owner photoshoot IMG_5319.jpeg. |
| public/images/procedure-signature.webp | Procedure card, owner photoshoot IMG_5224.jpeg. |
| public/images/procedure-longevity.webp | Procedure card, owner photoshoot IMG_5337.jpeg. |
| public/images/journal-studio.webp | Journal introduction cover, derived from the owner's FOTOSESIJA 11.11.26/IMG_5218.jpeg. |
| public/images/journal-conversation.webp | Conversation article cover, IMG_5147.jpeg from the same photoshoot. |
| public/images/journal-care.webp | Everyday care article cover, IMG_5263.jpeg from the same photoshoot. |
| public/images/journal-brushes.webp | Studio gallery, IMG_5142.jpeg from the same photoshoot. |
| public/images/journal-details.webp | Studio gallery, IMG_5175.jpeg from the same photoshoot. |
| public/images/journal-instagram-intro.jpg | Unchanged 640px public preview from the owner's Instagram introduction post https://www.instagram.com/p/DeGuHoeDNfY/, previously downloaded and visually verified on 2026-10-20. Retained previous introduction cover; replaced with the studio photograph in November. |
| public/images/valerija-botanical-background.webp | Current About portrait: original photo foreground composited over the AI-generated warm botanical and window-shadow background. Full 1536x2752 frame, lossless WebP; face, tunic, hands and tools checked against source pixels. Custom uploaded portraits remain unchanged. |
| public/images/valerija-original-white.jpeg | Retained exact copy of F7369116-3F67-46B7-A485-1775DA32EFFF.jpeg on a plain wall, without retouching or AI edits. Original preserved; the owner requested a background-only edit of this photo. |
| public/images/valerija-v2.webp | Retained alternate portrait refined against the additional facial reference. |
| public/images/valerija.webp | Retained earlier generated portrait with plants and warm wall shadows; background reference only for the new edit. |
| public/images/hero.webp | Illustrative skincare editorial image, not an actual client result. |
| public/images/treatment.webp | Illustrative skincare still life. |
| public/images/ritual.webp | Alternate crop of the generated still life. |
| public/images/skinstinct-logo.webp | Full-resolution 1254px derivative of the owner-supplied logo, used for the doubled header/footer logo so fine print remains sharp on high-density displays. |
| public/images/skinstinct-logo-display-v2.webp | Retained 528px lossless WebP derivative from the previous display size. The doubled logo uses the full-resolution file instead. No AI regeneration or logo redesign. Custom admin-selected logos remain supported. |
| public/images/og-cover.jpg | Social card assembled from the hero image and brand typography. |

## Portrait prompt

Identity-preserving professional cosmetologist portrait for SKINSTINCT. Use the supplied black-hat portrait as primary facial identity reference and the white-tunic portrait as clothing/profession reference. Same woman, age and recognizable facial features, brunette softly waved shoulder-length hair, white short-sleeve cosmetologist tunic, small glass cosmetic bowl and fan brush held naturally at waist height. Vertical half-body composition, warm off-white plaster backdrop, soft natural window light, subtle botanical shadows, muted sage/olive and dusty peach. Real skin texture and polished European editorial photography. No hat, gloves, necklace, text, logo or watermark.

Final refinement: preserve that composition, clothes, hands, bowl, brush and studio. Use the additional high-detail local facial photograph as the primary identity reference. Preserve the actual blue-grey eyes, facial proportions, eyebrow and lip shape, age, natural chestnut hair and facial marks. No de-aging or generic beauty-face substitution. The original local face photograph remains ignored and is not published.

## Hero prompt

Photorealistic intimate editorial close-up of a woman with closed eyes resting in an ivory spa towel while a cosmetologist gently applies serum with a small glass dropper. Real natural skin texture, a soft olive branch and warm cream linen, late-afternoon window light, peach highlights and muted olive shadows. Understated European skincare magazine direction, landscape 3:2. No text, labels, logos or watermarks.

## Still-life prompt

Photorealistic tactile skincare still life on warm ivory linen: off-white ceramic cream bowl, wooden-handled fan brush, plain unlabeled frosted cosmetic bottle with olive-toned liquid, an olive branch and a pale ivory flower. Muted sage, warm off-white, dusty peach and subtle gold. Natural sunlight and botanical shadows on peach plaster. Refined European boutique skincare editorial, landscape 3:2, no text, labels or logos.

## Fonts and icons

The November journal release uses five owner-supplied photographs, rotated using their orientation metadata and resized to at most 1600px width as quality-88 WebP. No AI retouching, recolouring or face changes. Originals remain in the local photoshoot folder and are excluded from Git and Docker; only selected web derivatives ship.

The two new articles are editorial adaptations of the values in the owner's introduction at https://www.instagram.com/p/DeGuHoeDNfY/, not invented additional Instagram posts. The saved introduction caption was reviewed. On 2026-11-22 the public profile confirmed @vr_skinstinct, but did not expose individual post/reel links. The website therefore embeds only the verified introduction, after an explicit visitor click, with an external fallback link. No Instagram request occurs on initial page load. Other posts and reels are reached through the owner's profile link; there is no automatic feed or unverified reel embedded.

Existing article text and custom uploads remain authoritative. The introduction's retired bundled cover is replaced with the studio photograph. Two new multilingual articles are added once using a transactional release marker, so later admin edits, unpublished states and deletions are retained.

- Cormorant Garamond and Manrope are served locally from public/fonts, obtained via the official Google Fonts CSS API. No visitor request goes to Google Fonts.
- Font families: https://fonts.google.com/specimen/Cormorant+Garamond and https://fonts.google.com/specimen/Manrope . Both are available under the SIL Open Font License.
- Icons: Lucide (ISC license), installed through lucide-react.
- Botanical line art is original native SVG.

## Background-only portrait edit (2026-10-20)

Edit only the background of the supplied original white-uniform portrait. Preserve the woman, facial identity, hair, body, white tunic, hands, bowl and brush. Warm ivory studio with bamboo-like leafy plants at the edges, soft window light and botanical shadows. Earlier portrait is a background reference only. No text, logos or watermarks. The final composite restores the original photo foreground using a locally computed alpha matte. Original and generated intermediate are retained separately in the project review folder.
