# Image assets and prompts

All generated images used the built-in image generation tool. Optimized copies live in public/images and do not depend on generated-image directories on the development machine.

| Asset | Use |
| --- | --- |
| public/images/valerija-v2.webp | Final portrait refined against the additional detailed facial reference. |
| public/images/valerija.webp | Retained first portrait variant. |
| public/images/hero.webp | Illustrative skincare editorial image, not an actual client result. |
| public/images/treatment.webp | Illustrative skincare still life. |
| public/images/ritual.webp | Alternate crop of the generated still life. |
| public/images/skinstinct-logo.webp | High-quality derivative of the owner-supplied logo. |
| public/images/og-cover.jpg | Social card assembled from the hero image and brand typography. |

## Portrait prompt

Identity-preserving professional cosmetologist portrait for SKINSTINCT. Use the supplied black-hat portrait as primary facial identity reference and the white-tunic portrait as clothing/profession reference. Same woman, age and recognizable facial features, brunette softly waved shoulder-length hair, white short-sleeve cosmetologist tunic, small glass cosmetic bowl and fan brush held naturally at waist height. Vertical half-body composition, warm off-white plaster backdrop, soft natural window light, subtle botanical shadows, muted sage/olive and dusty peach. Real skin texture and polished European editorial photography. No hat, gloves, necklace, text, logo or watermark.

Final refinement: preserve that composition, clothes, hands, bowl, brush and studio. Use the additional high-detail local facial photograph as the primary identity reference. Preserve the actual blue-grey eyes, facial proportions, eyebrow and lip shape, age, natural chestnut hair and facial marks. No de-aging or generic beauty-face substitution. The original local face photograph remains ignored and is not published.

## Hero prompt

Photorealistic intimate editorial close-up of a woman with closed eyes resting in an ivory spa towel while a cosmetologist gently applies serum with a small glass dropper. Real natural skin texture, a soft olive branch and warm cream linen, late-afternoon window light, peach highlights and muted olive shadows. Understated European skincare magazine direction, landscape 3:2. No text, labels, logos or watermarks.

## Still-life prompt

Photorealistic tactile skincare still life on warm ivory linen: off-white ceramic cream bowl, wooden-handled fan brush, plain unlabeled frosted cosmetic bottle with olive-toned liquid, an olive branch and a pale ivory flower. Muted sage, warm off-white, dusty peach and subtle gold. Natural sunlight and botanical shadows on peach plaster. Refined European boutique skincare editorial, landscape 3:2, no text, labels or logos.

## Fonts and icons

- Cormorant Garamond and Manrope are served locally from public/fonts, obtained via the official Google Fonts CSS API. No visitor request goes to Google Fonts.
- Font families: https://fonts.google.com/specimen/Cormorant+Garamond and https://fonts.google.com/specimen/Manrope . Both are available under the SIL Open Font License.
- Icons: Lucide (ISC license), installed through lucide-react.
- Botanical line art is original native SVG.
