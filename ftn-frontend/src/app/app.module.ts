import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { PublicLayoutComponent } from './layout/public/public-layout.component';
import { AdminLayoutComponent } from './layout/admin/admin-layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { ClubListComponent } from './features/clubs/components/club-list/club-list.component';
import { HomeComponent } from './features/home/home.component';
import { SharedModule } from './shared/shared.module';

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
    AppRoutingModule,
    FormsModule,
    SharedModule
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
