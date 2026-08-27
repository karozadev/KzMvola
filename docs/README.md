# Ressources — KzMvola

Captures et gabarits visuels du projet, destinés au portfolio et aux
aperçus de partage.

## Captures d'écran

| Fichier | Format | Contenu |
| --- | --- | --- |
| [screenshots/mobile.png](screenshots/mobile.png) | 400 × 1180 | Vue mobile — mode Retrait, exemple à 265 000 Ar |
| [screenshots/desktop.png](screenshots/desktop.png) | 1400 × 1000 | Vue desktop — mode Transfert « non-abonné », exemple à 300 000 Ar |

Elles sont prises sur le build de production servi localement, l'état
(mode / destination / montant) étant pré-rempli via l'URL
(`?mode=`, `?destination=`, `?montant=`) :

```bash
npm run build
npm run preview          # sert http://localhost:4173

# Mobile (Retrait)
chromium --headless --disable-gpu --hide-scrollbars --window-size=400,1180 \
  --screenshot=docs/screenshots/mobile.png \
  "http://localhost:4173/?montant=265000"

# Desktop (Transfert vers un non-abonné)
chromium --headless --disable-gpu --hide-scrollbars --window-size=1400,1000 \
  --screenshot=docs/screenshots/desktop.png \
  "http://localhost:4173/?mode=transfert&destination=non-abonne&montant=300000"
```

## Aperçu de partage (Open Graph / Twitter Card)

[og-image.html](og-image.html) est la **source** de
[`public/og-image.png`](../public/og-image.png) (1200 × 630), l'image
affichée quand le lien est partagé sur Facebook, WhatsApp, LinkedIn, X, etc.
Elle reprend la charte de l'application (noir profond, rouge MVola,
Archivo Black, accents verts).

Pour la régénérer après une retouche (aucun serveur nécessaire) :

```bash
chromium --headless --disable-gpu --hide-scrollbars --window-size=1200,630 \
  --screenshot=public/og-image.png \
  "file://$PWD/docs/og-image.html"
```

Les balises `og:image` / `twitter:image` sont déclarées dans
[`index.html`](../index.html).

## Icônes PWA

[pwa-icon.html](pwa-icon.html) est la source des icônes de `public/`
(fond rouge MVola, « Kz » en Archivo Black). Chrome sur Android exige des
icônes **PNG** en 192 et 512 px pour proposer l'installation ; une icône
SVG seule ne suffit pas.

| Fichier | Taille | `purpose` |
| --- | --- | --- |
| `public/pwa-192.png` | 192 | any |
| `public/pwa-512.png` | 512 | any |
| `public/pwa-maskable-512.png` | 512 | maskable (glyphe dans la zone de sécurité) |
| `public/apple-touch-icon.png` | 180 | iOS « Sur l'écran d'accueil » |

```bash
ICON="file://$PWD/docs/pwa-icon.html"
for s in 192 512; do
  chromium --headless --disable-gpu --window-size=$s,$s \
    --screenshot=public/pwa-$s.png "$ICON"
done
chromium --headless --disable-gpu --window-size=512,512 \
  --screenshot=public/pwa-maskable-512.png "$ICON?mask=1"
chromium --headless --disable-gpu --window-size=180,180 \
  --screenshot=public/apple-touch-icon.png "$ICON"
```

Les icônes sont référencées dans le manifeste
([`vite.config.ts`](../vite.config.ts)) et dans `<head>`
([`index.html`](../index.html)).
