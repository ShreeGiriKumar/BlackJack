import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from "@angular/forms";

import { AppComponent }  from './app.component';
import { AppRoutingModule } from './app-routing.module';

//services
import { BlackjackService } from './services/blackjack.service';

//blackjack components
import { HomeComponent } from './components/home/home.component';
import { GameComponent } from "./components/game/game.component";
import { HttpClientModule } from '@angular/common/http'; 

//pipes
import { ForNumberPipe } from './pipes/for-number.pipe';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule, //I need FormsModule for 2 way data binding
    AppRoutingModule,
    HttpClientModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    ForNumberPipe,
    GameComponent
  ],
  bootstrap: [AppComponent],
  providers: [BlackjackService]
})
export class AppModule {
}
