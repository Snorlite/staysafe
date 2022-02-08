import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { first } from 'rxjs/operators';

import { Desk } from '@app/_models';

import { AuthenticationService, DesksService } from '@app/_services';

@Component({ templateUrl: 'register.component.html' })
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    jobsData: string[] = [];
    desksData: Desk[] = [];
    error = '';
    role = '';

    genders = [
        {id: "male", label: "Maschio"},
        {id: "female", label: "Femmina"},
        {id: "other", label: "Altro"}
    ];

    jobs = [
        {id: "Software_Developer", label: "Sviluppatore Software"},
        {id: "Project_Manager", label: "Project Manager"}
    ];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private desksService: DesksService
    ) { 
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) { 
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {


        this.registerForm = this.formBuilder.group({
            name: ['', Validators.required],
            surname: ['', Validators.required],
            gender: [null, Validators.required],
            birthdate: ['', Validators.required],
            email: ['', Validators.required],
            job: [null, Validators.required],
            desk: [null, Validators.required],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required]
        });


        this.desksService.getOwnableDesks()
        .pipe(first())
        .subscribe(
            data => {
                data.forEach(d => {
                    this.desksData.push(d)
                });
            },
            error => {
                this.error = error;
                this.loading = false;
        });

        // go to home
        this.returnUrl = '/';
    }

    // convenience getter for easy access to form fields
    get f() { return this.registerForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }
        
        this.route.data.subscribe(data => {
            this.loading = true;
            this.authenticationService.register(
                this.f.name.value,
                this.f.surname.value,
                this.f.gender.value,
                this.f.birthdate.value,
                this.f.email.value,
                this.f.job.value,
                this.f.password.value,
                data.role,
                this.f.desk.value)
                .pipe(first())
                .subscribe(
                    data => {
                        this.router.navigate([this.returnUrl]);
                    },
                    error => {
                        this.error = error;
                        this.loading = false;
                    });
        })
    }
}