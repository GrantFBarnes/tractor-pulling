import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoadingComponent } from './shared/components/loading/loading.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';

import { HomeComponent } from './pages/home/home.component';
import { ResultsComponent } from './pages/results/results.component';
import { WinsComponent } from './pages/wins/wins.component';
import { PointsComponent } from './pages/points/points.component';
import { PercentilesComponent } from './pages/percentiles/percentiles.component';
import { DistancesComponent } from './pages/distances/distances.component';
import { RivalsComponent } from './pages/rivals/rivals.component';
import { ChartResultsComponent } from './pages/chart-results/chart-results.component';
import { ChartPullersComponent } from './pages/chart-pullers/chart-pullers.component';
import { ManageComponent } from './pages/manage/manage.component';
import { ManageSelectFieldComponent } from './pages/manage/manage-select-field/manage-select-field.component';
import { ManageFilterComponent } from './pages/manage/manage-filter/manage-filter.component';

@NgModule({
  declarations: [
    AppComponent,

    LoadingComponent,
    PageNotFoundComponent,
    UnauthorizedComponent,

    HomeComponent,
    ResultsComponent,
    WinsComponent,
    PointsComponent,
    PercentilesComponent,
    DistancesComponent,
    RivalsComponent,
    ChartResultsComponent,
    ChartPullersComponent,
    ManageComponent,
    ManageSelectFieldComponent,
    ManageFilterComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    NgChartsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
