import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ValidatorFn } from '@angular/forms';

import { User, Desk, Reservation } from '@app/_models';
import { AuthenticationService, DesksService, ReservationsService } from '@app/_services';

@Component({ selector: 'dashboard-user', templateUrl: 'dashboard-user.component.html' })
export class DashboardUserComponent {
    firstStepForm: FormGroup;
    secondStepForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    error = '';
    dates: string[] = new Array(7).fill(new Date())
    .map((dt, i) => {
        let date = new Date(dt.getTime() + 1000 * 60 * 60 * 24 * i)
        return date.getFullYear()  + "-" + (date.getMonth() < 9 ? "0" : "") +(date.getMonth() + 1)+ "-" + (date.getDate() < 10 ? "0" : "")+ date.getDate()
    })
    desksData: Desk[] = [];
    reservedDesks: Desk[]= [];
    ownerDesk: Desk;
    personalReservations: Reservation[] = [];
    numEmployees = [];
    //users: User[];
    currentUser: User;
    selectedDate;
    selectedDesk;
    currentStep = 1;

    constructor(
        private authenticationService: AuthenticationService,
        private desksService : DesksService,
        private reservationsService : ReservationsService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router) { }

    ngOnInit() {
        this.currentUser = this.authenticationService.currentUserValue;

        this.desksService.getDesk(this.currentUser.idDesk)
        .subscribe(
            data => {
                this.ownerDesk = data;
            }
        )

        this.reservationsService.getPersonalReservations()
        .subscribe(
            data => {
                this.personalReservations = data;
            }
        )

        this.firstStepForm = this.formBuilder.group({
            "date": [null, Validators.required]
        }); 
        
        this.secondStepForm = this.formBuilder.group({
            "desk": [null, Validators.required]
        });     
    }

    // convenience getter for easy access to form fields
    get f() { return this.firstStepForm.controls; }

    get secondStepF() { return this.secondStepForm.controls; }

    firstStepSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.firstStepForm.invalid) {
            return;
        }

        this.loading = true;

        this.desksService.getReservableDesks(this.f.date.value)
        .subscribe(
            data => {
                this.loading = false;
                this.currentStep = 2;
                this.desksData = data;
                this.selectedDate = this.f.date.value;

                this.desksService.getReservedDesks(this.f.date.value)
                .subscribe(
                    data => {
                        this.reservedDesks = data; 
                    }
                )

                this.reservationsService.getNumEmployeesByJobAndDeskArea(this.f.date.value)
                .subscribe(
                    data => {
                        this.numEmployees = data; 
                    }
                )
            },
            error => {
                this.error = error;
                this.loading = false;
            }
        )
    }

    secondStepSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.secondStepForm.invalid) {
            return;
        }

        this.loading = true;
        this.reservationsService.insertReservation(this.secondStepF.desk.value, this.selectedDate).subscribe(
            data => {
                this.loading = false;
                this.currentStep = 1;
                this.router.navigate(['/']);
            },
            error => {
                this.error = error;
                this.loading = false;
            }
        );
    }
}