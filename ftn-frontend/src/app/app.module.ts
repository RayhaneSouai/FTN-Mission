import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { authInterceptor } from './core/interceptors/auth.interceptor';

import { AppComponent } from './app.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { PublicLayoutComponent } from './layout/public/public-layout.component';
import { AdminLayoutComponent } from './layout/admin/admin-layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { ClubListComponent } from './features/clubs/components/club-list/club-list.component';
import { HomeComponent } from './features/home/home.component';
import { SharedModule } from './shared/shared.module';
import { AdminUiModule } from './shared/admin-ui/admin-ui.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AppRoutingModule } from './app-routing.module';

import { HeaderComponent } from './shared/components/header/header.component';
import { MyPerformancesComponent } from './features/my-performance/my-performances.component';
import { RankingComponent } from './features/ranking/ranking.component';
import { ToastContainerComponent } from './features/competitions/components/toast-container/toast-container.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    PublicLayoutComponent,
    AdminLayoutComponent,
    DashboardComponent,
    ClubListComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,

    // Modules & Standalone Components
    SharedModule,
    AdminUiModule,
    DashboardModule,
    HeaderComponent,
    MyPerformancesComponent,
    RankingComponent,
    ToastContainerComponent
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])   // ← Interceptor bien enregistré
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
