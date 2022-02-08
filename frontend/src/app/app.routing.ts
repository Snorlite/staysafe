import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { ReservationsDashboardComponent } from './reservations-dashboard';
import { AuthGuard } from './_helpers';

const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard]},
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent, data : {
        "role" : "user"
    } },
    { path: 'reservations', component: ReservationsDashboardComponent, data : {
        "role" : "admin"
    } },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' });