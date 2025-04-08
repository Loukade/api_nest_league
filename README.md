# API_Nest_League

Une API NestJS permettant d'interagir avec l'API de League of Legends et de stocker les données en base de données MongoDB pour optimiser les performances.

## Prérequis

- Node.js (version 14 ou supérieure)
- MongoDB
- Une clé API Riot Games

## Installation

1. Cloner le repository :
```bash
git clone https://github.com/Loukade/api_nest_league.git
cd api_nest_league
```

2. Installer les dépendances :
```bash
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Clé API Riot Games (obtenue sur https://developer.riotgames.com/)
RIOT_API_KEY=votre_clé_api_riot

# URL de connexion à MongoDB
MONGODB_URI=mongodb://localhost:27017/league
```

### Obtention de la clé API Riot Games

1. Créez un compte sur [Riot Developer Portal](https://developer.riotgames.com/)
2. Générez une nouvelle clé API
3. Copiez la clé dans votre fichier `.env`

## Fonctionnalités

- Récupération et stockage des champions
- Gestion des versions de patch
- Gestion des comptes joueurs
- Stockage des données en base de données MongoDB
- API RESTful pour accéder aux données

## Endpoints disponibles

### Champions
- `POST /champions/fetch/all` - Récupère et sauvegarde tous les champions du dernier patch dans la base de données
- `GET /champions/all/:patch` - Liste tous les champions disponibles dans un patch spécifique / Exemple : http://localhost:3000/champions/all/15.7.1
- `GET /champions/:id/:patch` - Récupère les informations d'un champion spécifique dans un patch spécifique / Exemple : http://localhost:3000/champions/Aatrox/15.7.1

### Patches
- `POST /patches/fetch/all` - Récupère et sauvegarde les nouvelles versions de patch dans la base de données
- `GET /patches/all` - Liste toutes les versions de patch (triées du plus récent au plus ancien)
- `GET /patches/latest` - Récupère la dernière version de patch disponible

### Comptes
- `GET /account/:gameName/:tagLine` - Récupère les informations complètes d'un compte joueur (compte, summoner et maîtrise des champions) / Exemple : http://localhost:3000/account/Loukade/1434

## Démarrage

```bash
# Développement
npm run start:dev
```

## Structure du projet

```
src/
├── account/            # Module des comptes joueurs
│   ├── account.controller.ts
│   ├── account.module.ts
│   ├── account.service.ts
│   └── dto/           # Data Transfer Objects
│       ├── account.dto.ts
│       ├── summoner.dto.ts
│       └── champion-mastery.dto.ts
├── champions/         # Module des champions
│   ├── champions.controller.ts
│   ├── champions.module.ts
│   ├── champions.service.ts
│   └── schemas/       # Schémas MongoDB
│       └── champion.schema.ts
├── patches/          # Module des patches
│   ├── patches.controller.ts
│   ├── patches.module.ts
│   ├── patches.service.ts
│   └── schemas/      # Schémas MongoDB
│       └── patch.schema.ts
└── main.ts          # Point d'entrée de l'application
```

