import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';

const routes: Routes = [
  { path: '', component: ProfilePageComponent },
  { path: 'settings', component: SettingsPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
