import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';

import { HeaderComponent } from './shared/components/header/header.component';

import { MyPerformancesComponent } from './features/my-performance/my-performances.component';

import { RankingComponent } from './features/ranking/ranking.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,

    HeaderComponent,
    MyPerformancesComponent,
    RankingComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
