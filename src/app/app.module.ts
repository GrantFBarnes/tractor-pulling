import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoadingComponent } from './shared/components/loading/loading.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';

import { HomeComponent } from './pages/home/home.component';
import { ResultsComponent } from './pages/results/results.component';
import { WinsComponent } from './pages/wins/wins.component';
import { PointsComponent } from './pages/points/points.component';
import { PercentilesComponent } from './pages/percentiles/percentiles.component';
import { DistancesComponent } from './pages/distances/distances.component';
import { RivalsComponent } from './pages/rivals/rivals.component';

@NgModule({
  declarations: [
    AppComponent,

    LoadingComponent,
    PageNotFoundComponent,

    HomeComponent,
    ResultsComponent,
    WinsComponent,
    PointsComponent,
    PercentilesComponent,
    DistancesComponent,
    RivalsComponent,
  ],
  imports: [BrowserModule, FormsModule, HttpClientModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
