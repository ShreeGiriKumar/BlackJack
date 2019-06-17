import { Component, OnInit } from "@angular/core";
import { Player } from "../../models/player.model";
import { BlackjackService } from '../../services/blackjack.service';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements  OnInit{
  
  playerBetAmount: number = null;
  playerName: string;
  playerBankRoll: number;
  
  constructor(private blackjackService: BlackjackService) {
  }

  ngOnInit():void{
  }

  pickBetAmount(betVal: number):void{    
    this.playerBetAmount = betVal;
  }  
  
  startGame(): void {    
    let player: Player = {
      name: this.playerName,
      bankroll: this.playerBankRoll,
      gameModeOn : false,
      cards : [],
      currentBetValue : this.playerBetAmount,
      winnerOfRound : false,
      bust : false,
      blackjack : false,
      naturalBlackjack : false,
      amountWon : 0,
      points : 0,
      standing : false
     };
    this.blackjackService.startGame(player);
  }
}
