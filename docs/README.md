# Ressources — KzMvola

Captures et gabarits visuels du projet, destinés au portfolio et aux
aperçus de partage.

## Captures d'écran

| Fichier | Format | Contenu |
| --- | --- | --- |
| [screenshots/mobile.png](screenshots/mobile.png) | 400 × 1120 | Vue mobile, style Netflix, exemple à 265 000 Ar |
| [screenshots/desktop.png](screenshots/desktop.png) | 1400 × 900 | Vue desktop, cartes « Retrait direct » / « Retrait fractionné » côte à côte |

Elles sont prises sur le build de production servi localement, avec le
montant pré-rempli via le paramètre d'URL `?montant=` :

```bash
npm run build
npm run preview          # sert http://localhost:4173

# Mobile
chromium --headless --disable-gpu --hide-scrollbars --window-size=400,1120 \
  --screenshot=docs/screenshots/mobile.png \
  "http://localhost:4173/?montant=265000"

# Desktop
chromium --headless --disable-gpu --hide-scrollbars --window-size=1400,900 \
  --screenshot=docs/screenshots/desktop.png \
  "http://localhost:4173/?montant=265000"
```

## Aperçu de partage (Open Graph / Twitter Card)

[og-image.html](og-image.html) est la **source** de
[`public/og-image.png`](../public/og-image.png) (1200 × 630), l'image
affichée quand le lien est partagé sur Facebook, WhatsApp, LinkedIn, X, etc.
Elle reprend la charte de l'application (noir profond, rouge MVola,
Archivo Black, accents verts).

Pour la régénérer après une retouche :

```bash
chromium --headless --disable-gpu --hide-scrollbars --window-size=1200,630 \
  --screenshot=public/og-image.png \
  "file://$PWD/docs/og-image.html"
```

Les balises `og:image` / `twitter:image` sont déclarées dans
[`index.html`](../index.html).
