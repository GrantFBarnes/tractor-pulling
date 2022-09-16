import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoadingComponent } from './shared/components/loading/loading.component';
import { DropdownFilterComponent } from './shared/components/dropdown-filter/dropdown-filter.component';
import { ExcelUploadComponent } from './pages/manage/excel-upload/excel-upload.component';
import { ExcelDownloadComponent } from 'src/app/shared/components/excel-download/excel-download.component';
import { YoutubePullComponent } from './shared/components/youtube-pull/youtube-pull.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';

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
import { SelectFieldComponent } from './shared/components/select-field/select-field.component';

@NgModule({
  declarations: [
    AppComponent,

    LoadingComponent,
    DropdownFilterComponent,
    ExcelUploadComponent,
    ExcelDownloadComponent,
    YoutubePullComponent,
    PageNotFoundComponent,
    UnauthorizedComponent,

    HomeComponent,
    ResultsComponent,
    WinsComponent,
    PointsComponent,
    AttendanceComponent,
    PercentilesComponent,
    DistancesComponent,
    RivalsComponent,
    WinningsComponent,
    ChartResultsComponent,
    ChartPullersComponent,
    PredictComponent,
    ManageComponent,
    SelectFieldComponent,
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
