import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegistrationPayload } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/register/`;

  constructor(private http: HttpClient) {}

  register(data: RegistrationPayload) {
    return this.http.post(this.baseUrl, data);
  }

  deleteByNumber(number: string) {
    return this.http.delete(`${this.baseUrl}${number}/delete/`);
  }

  getAll() {
    return this.http.get<{ count: number; data: any[] }>(`${environment.apiUrl}/registrations/`);
  }
}
