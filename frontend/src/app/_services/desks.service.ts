import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { Desk } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class DesksService {
    constructor(private http: HttpClient) { }

    getDesks() {
        return this.http.get<Desk[]>(`${environment.apiUrl}/desks`);
    }

    getDesk(id) {
        return this.http.get<Desk>(`${environment.apiUrl}/desks/${id}`);
    }

    getReservableDesks(date) {
        return this.http.get<Desk[]>(`${environment.apiUrl}/desks/reservable/${date}`);
    }

    getOwnableDesks() {
        return this.http.get<Desk[]>(`${environment.apiUrl}/desks/ownables`);
    }
    
    getReservedDesks(date) {
        return this.http.get<Desk[]>(`${environment.apiUrl}/desks/reserved/${date}`);
    }

}