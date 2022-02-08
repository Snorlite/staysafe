import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { User } from '@app/_models';
import { UserService } from '@app/_services';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
    loading = false;
    submitted = false;
    returnUrl: string;
    error = '';
    //users: User[];
    currentUser: User;

    constructor(
        private userService: UserService,
        private route: ActivatedRoute,
        private router: Router) { }

    ngOnInit() {        
        this.loading = true;
        /*  this.userService.getAll().pipe(first()).subscribe(users => {
            this.loading = false;
            this.users = users;
        }); */
        this.userService.getCurrentUser().pipe(first()).subscribe(user => {
            this.loading = false;
            this.currentUser = user;
        });
    }
}