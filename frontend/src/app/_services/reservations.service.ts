import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, mergeMap } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Reservation } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class ReservationsService {
    constructor(private http: HttpClient) { }

    getReservations() {
        return this.http.get<Reservation[]>(`${environment.apiUrl}/reservations`);
    }

    getPersonalReservations() {
        return this.http.get<Reservation[]>(`${environment.apiUrl}/reservations/employee`);
    }

    getNumEmployeesByJobAndDeskArea(date) {
        return this.http.get<Reservation[]>(`${environment.apiUrl}/reservations/job/${date}`);
    }

    insertReservation(id, date) {
        return this.http.post<Reservation[]>(`${environment.apiUrl}/reservations`, {
            "id_desk": id,
            "reservation_date": date
        });
    }

}