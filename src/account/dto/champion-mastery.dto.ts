export interface RewardConfigDto {
  rewardValue: string;
  rewardType: string;
  maximumReward: number;
}

export interface NextSeasonMilestonesDto {
  requireGradeCounts: Record<string, number>;
  rewardMarks: number;
  bonus: boolean;
  rewardConfig: RewardConfigDto;
}

export interface ChampionMasteryDto {
  puuid: string;
  championPointsUntilNextLevel: number;
  chestGranted: boolean;
  championId: number;
  lastPlayTime: number;
  championLevel: number;
  championPoints: number;
  championPointsSinceLastLevel: number;
  markRequiredForNextLevel: number;
  championSeasonMilestone: number;
  nextSeasonMilestone: NextSeasonMilestonesDto;
  tokensEarned: number;
  milestoneGrades: string[];
}
