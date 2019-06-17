import { Component, OnInit } from "@angular/core";
import { Player } from "../../models/player.model";
import { Router } from "@angular/router";
import { BlackjackService } from '../../services/blackjack.service';
import { NullAstVisitor } from '@angular/compiler';

@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent implements OnInit {
  player: Player;
  dealer: Player;
  gameStarted: boolean = false;
  playerBetAmount: number = null;
  newRoundFlag: boolean = false;
  resultTracker: string[];

  constructor(private blackjackService: BlackjackService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.player = this.blackjackService.getPlayer();

    if (!this.player)
      this.router.navigate(['/home']);

    this.resetDealer();
    this.blackjackService.dealHand(this.dealer);
    this.gameStarted = true;
  }

  dealCard(): void {
    this.blackjackService.dealCard(this.player, false);
    this.resultTracker = this.blackjackService.resultTracker;
  }

  stand(): void {
    this.player.standing = true;
    this.blackjackService.playerStands(this.player);
    this.resultTracker = this.blackjackService.resultTracker;
  }

  pickBetAmount(betVal: number):void{    
    this.playerBetAmount = betVal;
    this.player.cards = [];
    this.player.bankroll -=  this.playerBetAmount; 
    this.player.currentBetValue = this.playerBetAmount; 
    this.player.winnerOfRound = false;
    this.player.bust = false;
    this.player.blackjack = false;
    this.player.naturalBlackjack = false;
    this.player.amountWon = 0;
    this.player.points = 0;
    this.player.standing = false;

    this.resetDealer();

    this.player = this.blackjackService.getPlayer();
    this.blackjackService.dealHand(this.dealer);

    this.newRoundFlag = false;
  }  

  newRound(): void {
    this.newRoundFlag = true;    
  }

  private resetDealer(): void {
    this.dealer = {
      isDealer: true,
      name: "Dealer",
      bankroll: 0,
      points: 0,
      cards: [],
      winnerOfRound: false,
      naturalBlackjack: false,
      gameModeOn: true
    };
  }

  private goToHome(): void {
    this.router.navigate(['/home']);
  }
}
