import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { PlayingCard } from '../models/playing-card.model'
import { Player } from "../models/player.model";
import { Observable, observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class BlackjackService {

  deckofCardApiUrl: string = 'https://deckofcardsapi.com/api/deck/';
  deckId: string = null;
  cardDeck: PlayingCard[] = [];
  resultTracker: string[] = [];

  player: Player;
  dealer: Player;

  private cardsIdIndex: number = 0;
  private playerHighestPoints: number = 0;

  constructor(private router: Router, private http: HttpClient, ) {
  }

  startGame(player: Player): void {
    this.player = player;
    this.getCardDeck();
  }

  getPlayer(): Player {
    return this.player;
  }

  getCardDeck() {
    return this.http.get(this.deckofCardApiUrl + 'new/shuffle/?deck_count=1')
      .subscribe((res: any) => {
        this.deckId = res.deck_id;

        this.drawCard(52).subscribe((data) => {
          if (data) {
            for (var cnt = 0; cnt < data.cards.length; cnt++) {
              var playingCard: PlayingCard = {
                isAce: data.cards[cnt].value == 'ACE' ? true : false,
                code: data.cards[cnt].code,
                suit: data.cards[cnt].suit,
                value: (
                  data.cards[cnt].value == "KING" ||
                    data.cards[cnt].value == "QUEEN" ||
                    data.cards[cnt].value == "JACK" ? 10 : +data.cards[cnt].value),
                image: data.cards[cnt].image
              };
              this.cardDeck.push(playingCard);
            }
          }
          this.router.navigate(['/game']);
        });
      });
  }

  drawCard(cardCount: number): Observable<any> {
    return this.http.get(this.deckofCardApiUrl + this.deckId + '/draw/?count=' + cardCount);
  }


  dealHand(dealer: Player): void {
    this.playerHighestPoints = 0;

    this.dealer = dealer;
    this.dealer.cards = [];
    this.dealer.bust = false;
    this.dealer.blackjack = false;
    this.dealer.naturalBlackjack = false;
    this.dealer.winnerOfRound = false;


    this.player.cards = [];
    this.player.bust = false;
    this.player.blackjack = false;
    this.player.naturalBlackjack = false;
    this.player.winnerOfRound = false;
    this.player.points = 0;

    //deal 2 cards for each player
    if (this.player.bankroll > 0 || this.player.currentBetValue > 0) {
      this.dealCard(this.player, false);
      this.dealCard(this.player, false);
    }

    //at the end, deal 1 card for the dealer
    this.dealCard(this.dealer, true);
  }

  //this method is called also from the player componenet when the player clicks on deal card
  dealCard(player: Player, isForDealer: boolean): void {
    player.cards.push(this.extractCardFromPack());
    this.computePoints(player, isForDealer);
  }

  private extractCardFromPack(): PlayingCard {
    
    let randomCardIndex = Math.floor(Math.random() * (this.cardDeck.length + 1)) + 0;
    let cardToReturn = this.cardDeck[randomCardIndex];
    if (cardToReturn === undefined)
    {
      cardToReturn = this.extractCardFromPack();
    }
    
    this.cardDeck.splice(randomCardIndex, 1);
    return cardToReturn;
  }

  //this is executed when the player stands
  playerStands(player: Player): void {
    player.standing = true;
    this.dealerAutomaticPlay();
  }


  dealerAutomaticPlay(): void {
    let dealerHasToPlay: boolean = false;
    if (!this.player.bust && this.player.points < 22) {
      if (this.player.points > this.playerHighestPoints) {
        this.playerHighestPoints = this.player.points;
      }
    }
    //if this player can still play, then the dealer has to wait
    if (!this.player.bust && !this.player.standing &&
      !this.player.blackjack && (this.player.bankroll > 0 || this.player.currentBetValue > 0)) {
      dealerHasToPlay = false;
    }

    dealerHasToPlay = true;

    if (dealerHasToPlay) {      
      this.dealCard(this.dealer, true);
      
      this.dealerAutomaticPlayAI();      
      
      this.findWinners();
    }
  }
  
  private dealerAutomaticPlayAI(): void {
    if (this.dealer.bust || this.dealer.blackjack) {
      return;
    }
    if (this.dealer.points > this.playerHighestPoints) {
      this.dealer.winnerOfRound = true;
    }
    else {
      this.dealCard(this.dealer, true);
    }
  }

  
  private findWinners(): void {

    if(this.player.bust){
      this.player.winnerOfRound = false;      
      this.player.bankroll -= this.player.currentBetValue;
    }
    else if (this.player.naturalBlackjack && !this.dealer.naturalBlackjack) {
      this.player.winnerOfRound = true;
      this.player.amountWon = (this.player.currentBetValue * 2) + (this.player.currentBetValue / 2)
      this.player.bankroll += this.player.amountWon;
    }
    else if (this.player.blackjack && this.dealer.blackjack) {
      this.player.bankroll += this.player.currentBetValue;
      this.player.amountWon = this.player.currentBetValue;
      this.player.winnerOfRound = true;
    }
    else if (this.player.points < this.playerHighestPoints) {
      this.player.bust = true;
    }

    else if (this.player.points > this.dealer.points) {      
      this.player.winnerOfRound = true
      this.player.amountWon = this.player.currentBetValue * 2;
      this.player.bankroll += this.player.amountWon;

    }

    else if (this.dealer.bust) {      
      this.player.winnerOfRound = true;
      this.player.amountWon = this.player.currentBetValue * 2;
      this.player.bankroll += this.player.amountWon;
    }

    else if (this.player.points < this.dealer.points) {
      //lost
      this.player.bust = true;
    }

    else if (this.player.points === this.dealer.points) {      
      this.player.bankroll += this.player.currentBetValue;
      this.player.amountWon = this.player.currentBetValue;
      this.player.winnerOfRound = true;
    }

    
    this.resultTracker.push(this.player.winnerOfRound ? this.player.name : 'Dealer');        
  }

  private computePoints(player: Player, isForDealer: boolean): void {
    let tempAces: PlayingCard[] = [];
    player.points = 0;
    for (let card of player.cards) {
      if (card.isAce) {
        tempAces.push(card);
      }
      else if (card.value) {
        player.points += card.value;
      }
    }
    if (tempAces.length && player.points < 21) {
      for (let aceCard of tempAces) {
        //try first with value 11
        player.points += 11;
        if (player.points > 21) {
          //make the ace = 1;
          player.points -= 10;
        }
        if (player.points > 21) {
          break;
        }
      }
    }
    if (player.points > 21) {
      player.bust = true;
      if (!isForDealer) {
        this.dealerAutomaticPlay();
      }
    }
    else if (player.points === 21) {
      if (player.cards.length == 2) {
        player.naturalBlackjack = true;
      }
      player.blackjack = true;
      if (!isForDealer) {
        this.dealerAutomaticPlay();
      }
    }
  }
}
