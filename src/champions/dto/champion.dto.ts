export interface ChampionResult {
  name: string;
  exists: boolean;
}

export interface ChampionImageDto {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ChampionSkinDto {
  id: string;
  num: number;
  name: string;
  chromas: boolean;
}

export interface ChampionSpellDto {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  leveltip: {
    label: string[];
    effect: string[];
  };
  maxrank: number;
  cooldown: number[];
  cooldownBurn: string;
  cost: number[];
  costBurn: string;
  effect: (number[] | null)[];
  effectBurn: string[];
  vars: any[];
  costType: string;
  maxammo: string;
  range: number[];
  rangeBurn: string;
  image: ChampionImageDto;
  resource: string;
}

export interface ChampionPassiveDto {
  name: string;
  description: string;
  image: ChampionImageDto;
}

export interface ChampionDto {
  id: string;
  key: string;
  name: string;
  title: string;
  image: ChampionImageDto;
  skins: ChampionSkinDto[];
  lore: string;
  blurb: string;
  allytips: string[];
  enemytips: string[];
  tags: string[];
  partype: string;
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  stats: {
    hp: number;
    hpperlevel: number;
    mp: number;
    mpperlevel: number;
    movespeed: number;
    armor: number;
    armorperlevel: number;
    spellblock: number;
    spellblockperlevel: number;
    attackrange: number;
    hpregen: number;
    hpregenperlevel: number;
    mpregen: number;
    mpregenperlevel: number;
    crit: number;
    critperlevel: number;
    attackdamage: number;
    attackdamageperlevel: number;
    attackspeedperlevel: number;
    attackspeed: number;
  };
  spells: ChampionSpellDto[];
  passive: ChampionPassiveDto;
  recommended: any[]; // Vous pouvez définir une interface pour les recommandations si nécessaire
}

export interface ChampionResponse {
  type: string;
  format: string;
  version: string;
  data: {
    [key: string]: ChampionDto;
  };
}
