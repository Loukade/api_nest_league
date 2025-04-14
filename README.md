# API_Nest_League

A NestJS API that interacts with the League of Legends API and stores data in a MongoDB database to optimize performance.

## Prerequisites

- Node.js (version 14 or higher)
- MongoDB
- A Riot Games API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Loukade/api_nest_league.git
cd api_nest_league
```

2. Install dependencies:
```bash
npm install
```

## Configuration

Create a `.env` file at the root of the project with the following variables:

```env
# Riot Games API Key (get it from https://developer.riotgames.com/)
RIOT_API_KEY=your_riot_api_key

# MongoDB connection URL
MONGODB_URI=mongodb://localhost:27017/league
```

### Getting a Riot Games API Key

1. Create an account on the [Riot Developer Portal](https://developer.riotgames.com/)
2. Generate a new API key
3. Copy the key into your `.env` file

## Features

- Retrieve and store champion data
- Patch version management
- Player account management
- Store data in MongoDB
- RESTful API to access data

## Available Endpoints

### Champions
- `POST /champions/fetch/all` - Fetch and save all champions from the latest patch into the database
- `GET /champions/all/:patch` - List all champions available in a specific patch / Example: http://localhost:3000/champions/all/15.7.1
- `GET /champions/:id/:patch` - Retrieve information about a specific champion in a specific patch / Example: http://localhost:3000/champions/Aatrox/15.7.1

### Patches
- `POST /patches/fetch/all` - Fetch and save new patch versions in the database
- `GET /patches/all` - List all patch versions (sorted from newest to oldest)
- `GET /patches/latest` - Retrieve the latest available patch version

### Accounts
- `GET /account/:gameName/:tagLine` - Retrieve full information about a player account (account, summoner, and champion mastery) / Example: http://localhost:3000/account/Loukade/1434

## Getting Started

```bash
# Development
npm run start:dev
```

## Project Structure

```
src/
├── account/            # Player account module
│   ├── account.controller.ts
│   ├── account.module.ts
│   ├── account.service.ts
│   └── dto/            # Data Transfer Objects
│       ├── account.dto.ts
│       ├── summoner.dto.ts
│       └── champion-mastery.dto.ts
├── champions/          # Champions module
│   ├── champions.controller.ts
│   ├── champions.module.ts
│   ├── champions.service.ts
    └── dto/            # Data Transfer Objects
        ├── champion.dto.ts
│   └── schemas/        # MongoDB Schemas
│       └── champion.schema.ts
    
├── patches/            # Patches module
│   ├── patches.controller.ts
│   ├── patches.module.ts
│   ├── patches.service.ts
│   └── schemas/        # MongoDB Schemas
│       └── patch.schema.ts
└── main.ts             # Application entry point
```
