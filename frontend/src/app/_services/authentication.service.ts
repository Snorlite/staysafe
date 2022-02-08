import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/auth`, { user_email: email, user_password: password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    register(name: string,
        surname: string,
        gender: string,
        birthdate: string,
        email: string,
        job: string,
        password: string,
        role: string,
        desk: number) {
        return this.http.post<any>(`${environment.apiUrl}/users/register`, { 
            user_name: name,
            user_surname: surname,
            user_gender: gender,
            user_birthDate: birthdate,
            user_email: email,
            user_job: job,
            user_password: password,
            user_role: role,
            user_desk: desk
        })
        .pipe(mergeMap(data => this.login(email, password)));
    }
}