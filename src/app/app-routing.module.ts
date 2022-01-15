import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ResultsComponent } from './pages/results/results.component';
import { WinsComponent } from './pages/wins/wins.component';
import { PointsComponent } from './pages/points/points.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: 'pulling/home', component: HomeComponent },
  { path: 'pulling/results', component: ResultsComponent },
  { path: 'pulling/wins', component: WinsComponent },
  { path: 'pulling/points', component: PointsComponent },
  { path: 'pulling', redirectTo: '/pulling/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
