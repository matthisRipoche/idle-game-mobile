# Idle Game Mobile

Petit jeu incrémental ("idle game") fait avec Expo/React Native. Le principe : une seule valeur qui grandit, passivement (générateurs) et activement (en tapant), jusqu'à un seuil où on peut "prestige" : repartir de zéro contre un bonus permanent qui accélère le cycle suivant.

## Fonctionnalités

- Génération passive + tap actif
- Deux types d'améliorations : générateurs (bonus fixe) et multiplicateur (bonus en %), achetables à l'unité ou en "max" d'un coup
- Notation qui change automatiquement avec la taille du nombre (entier → K → M → notation scientifique → notation "exponentielle" pour les valeurs vraiment énormes)
- Système de prestige ("Cycle") avec multiplicateur permanent
- Boost temporaire en secouant le téléphone (accéléromètre), débloquable dans la Boutique
- Sauvegarde locale automatique (AsyncStorage)

## Stack

- Expo SDK 57 + expo-router, TypeScript
- Pas de lib de state management externe — le state du jeu vit dans un hook (`useGameLoop`) partagé entre les écrans via un Context React
- expo-haptics, expo-sensors, expo-dev-client

## Structure du code

- `src/engine/` — logique pure du jeu, sans dépendance à React. `big-number.ts` gère les très grands nombres (représentation mantisse/exposant, pour ne pas perdre en précision au-delà de ce qu'un `number` JS peut représenter proprement). `game-state.ts` contient l'état et toutes les règles (tick, achats, prestige...)
- `src/hooks/` — pont entre le moteur et l'UI
- `src/services/` — wrappers autour des API natives (haptique, capteurs, stockage)
- `src/app/` — écrans (routing par fichiers avec expo-router)

## Installation

```bash
npm install
npm start
```

Ce projet utilise des modules natifs (expo-haptics, expo-sensors...) qui ne sont pas supportés par l'app Expo Go du store — il faut un dev client :

```bash
npx expo run:android
```

Ça build et installe une version de l'app dédiée au projet sur un téléphone/émulateur branché. Une fois installée, `npm start` suffit pour les lancements suivants (pas besoin de rebuild, sauf en ajoutant une nouvelle lib native).

## Build d'un APK

```bash
cd android
./gradlew assembleRelease
```

L'APK se trouve dans `android/app/build/outputs/apk/release/`.
