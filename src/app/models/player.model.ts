/**
 * Created by dragos on 15/12/2016.
 */
import { PlayingCard } from "./playing-card.model";
export class Player {  
  name: string;  
  bankroll: number;
  amountWon?: number;
  isDealer?: boolean;
  cards?: PlayingCard[];
  points: number;
  standing?: boolean;  
  gameModeOn?: boolean;
  currentBetValue?: number;
  bust?: boolean;
  blackjack?: boolean;  
  naturalBlackjack?: boolean;  
  winnerOfRound: boolean;
}
