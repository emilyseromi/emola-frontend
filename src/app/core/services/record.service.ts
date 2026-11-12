import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse, RecordItem } from '../../shared/models';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class RecordService {
  private http = inject(HttpClient);

  // url is used for Next/Previous pages, which DRF already builds for us
  list(url?: string): Observable<PaginatedResponse<RecordItem>> {
    return this.http.get<PaginatedResponse<RecordItem>>(url ?? `${API_BASE}/registrations/`);
  }

  delete(number: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE}/register/${number}/delete/`);
  }
}
