import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ResultsComponent } from './pages/results/results.component';
import { WinsComponent } from './pages/wins/wins.component';
import { PointsComponent } from './pages/points/points.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { PercentilesComponent } from './pages/percentiles/percentiles.component';
import { DistancesComponent } from './pages/distances/distances.component';
import { RivalsComponent } from './pages/rivals/rivals.component';
import { WinningsComponent } from './pages/winnings/winnings.component';
import { ChartResultsComponent } from './pages/chart-results/chart-results.component';
import { ChartPullersComponent } from './pages/chart-pullers/chart-pullers.component';
import { PredictComponent } from './pages/predict/predict.component';
import { ManageComponent } from './pages/manage/manage.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: 'pulling/home', component: HomeComponent },
  { path: 'pulling/results', component: ResultsComponent },
  { path: 'pulling/wins', component: WinsComponent },
  { path: 'pulling/points', component: PointsComponent },
  { path: 'pulling/attendance', component: AttendanceComponent },
  { path: 'pulling/percentiles', component: PercentilesComponent },
  { path: 'pulling/distances', component: DistancesComponent },
  { path: 'pulling/rivals', component: RivalsComponent },
  { path: 'pulling/winnings', component: WinningsComponent },
  { path: 'pulling/charts/results', component: ChartResultsComponent },
  { path: 'pulling/charts/pullers', component: ChartPullersComponent },
  { path: 'pulling/predict', component: PredictComponent },
  { path: 'pulling/manage', component: ManageComponent },
  { path: 'pulling', redirectTo: '/pulling/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
