import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthenticationService, ReservationsService } from '@app/_services';
import { Reservation } from '@app/_models';

@Component({ templateUrl: 'reservations-dashboard.component.html' })
export class ReservationsDashboardComponent implements OnInit {
    returnUrl: string;
    error = '';
    reservations: Reservation[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private reservationsService: ReservationsService
    ) { 
        // redirect to home if not admin
        if (this.authenticationService.currentUserValue && this.authenticationService.currentUserValue.role != "admin") { 
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.reservationsService.getReservations()
            .pipe(first())
            .subscribe(
                data => {
                    this.reservations = data;
                },
                error => {
                    this.error = error;
                });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    onSubmit() {
        return;
    }

}
