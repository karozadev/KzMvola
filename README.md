<div align="center">
  <img src="public/favicon.svg" alt="Logo KzMvola" width="96" height="96" />

  # KzMvola

  **Optimiseur de frais de retrait MVola**

  Calculez en temps réel la manière la plus économique de retirer de l'argent via MVola à Madagascar, en comparant le retrait direct et le retrait fractionné.

  [![License: MIT](https://img.shields.io/badge/License-MIT-fbbf24.svg)](./LICENSE)
  ![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-10b981)
  ![Made with React](https://img.shields.io/badge/React-19-020617)
  ![Made with TypeScript](https://img.shields.io/badge/TypeScript-6-020617)
</div>

---

## À propos

**KzMvola** est une web app PWA légère et rapide qui aide les utilisateurs de MVola (Cash Point) à Madagascar à réduire les frais payés lors de leurs retraits d'argent. Pour un montant donné, l'application compare :

- **Le retrait direct** : le montant retiré en une seule transaction, avec les frais correspondants.
- **Le retrait optimisé (fractionné)** : une décomposition du montant en plusieurs retraits, calculée pour minimiser la somme totale des frais selon la grille tarifaire officielle MVola.

L'économie réalisée entre les deux options est affichée instantanément à chaque saisie.

## Fonctionnalités

- ⚡ Calcul instantané pendant la saisie, sans rechargement de page
- 🔢 Formatage automatique des milliers (`265 000 Ar`) avec un curseur qui reste à sa place
- 🧮 Algorithme d'optimisation exhaustif basé sur les sommets de paliers tarifaires (250 000 / 500 000 / 1 000 000 Ar)
- 📱 PWA installable, pensée pour une utilisation rapide sur mobile
- 🎨 Design flat, sans dégradé, entièrement responsive

## Grille tarifaire MVola (Cash Point)

| Tranche (Ar)          | Frais (Ar) |
| --------------------- | ---------- |
| 100 – 1 000            | 0          |
| 1 001 – 5 000          | 100        |
| 5 001 – 10 000         | 275        |
| 10 001 – 20 000        | 550        |
| 20 001 – 25 000        | 650        |
| 25 001 – 50 000        | 1 300      |
| 50 001 – 100 000       | 1 900      |
| 100 001 – 250 000      | 3 400      |
| 250 001 – 500 000      | 4 700      |
| 500 001 – 1 000 000    | 8 800      |
| 1 000 001 – 2 000 000  | 14 700     |
| 2 000 001 – 3 000 000  | 19 600     |
| 3 000 001 – 4 000 000  | 24 500     |
| 4 000 001 – 5 000 000  | 29 400     |

## Stack technique

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [Tailwind CSS 4](https://tailwindcss.com/)

## Démarrage

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Construire pour la production
npm run build
```

## Structure du projet

```
src/
├── types/mvola.ts               # Interfaces (paliers, résultats)
├── utils/
│   ├── mvolaFeeCalculator.ts    # Grille tarifaire + logique d'optimisation
│   └── format.ts                # Formatage des montants et gestion du curseur
├── hooks/useMvolaCalculator.ts  # État et calcul en temps réel
├── components/
│   ├── CalculatorForm.tsx
│   ├── DirectOptionCard.tsx
│   └── OptimizedOptionCard.tsx
└── App.tsx
```

## Licence

Ce projet est **open source** et distribué sous licence [MIT](./LICENSE). Vous êtes libre de l'utiliser, le modifier et le redistribuer, y compris à des fins commerciales, à condition de conserver la mention de copyright.

## Auteur

Développé par **[Stephanot Zafindratafa](https://stephanot.karoza.dev)**.
