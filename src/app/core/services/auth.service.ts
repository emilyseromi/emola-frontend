import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse, RefreshResponse } from '../../shared/models';
import { authStorage } from '../../shared/auth.storage';
import { environment } from '../../../environments/environment';

export const API_URL = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/login/`, credentials);
  }

  logout(refresh: string): Observable<void> {
    return this.http.post<void>(`${API_URL}/logout/`, { refresh });
  }

  refresh(refresh: string): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${API_URL}/refresh/`, { refresh });
  }

  // ---- session storage ----
  saveSession(res: LoginResponse): void {
    authStorage.setTokens(res.access, res.refresh);
    authStorage.setUser(res.user);
  }

  saveTokens(access: string, refresh?: string): void {
    authStorage.setTokens(access, refresh);
  }

  clearSession(): void {
    authStorage.clear();
  }

  get accessToken(): string | null {
    return authStorage.getAccess();
  }

  get refreshToken(): string | null {
    return authStorage.getRefresh();
  }
}
