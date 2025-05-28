import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5186/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; motpasse: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode(token); console.log('Token décodé :', decoded);
      return decoded;
     

    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    const roleClaimKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

    if (roleClaimKey in user) {
      return user[roleClaimKey];
    }

    return null;
  }
  getUserUniteId(): string | null {
    const user = this.getCurrentUser();
    if (!user) return null;
  
    // Utilise la clé exacte utilisée dans le backend si c'est un claim personnalisé
    const uniteClaimKey = 'idunite'; // ou par exemple : 'http://schemas.myapp.com/claims/idunite'
  
    if (uniteClaimKey in user) {
      console.log('ID Unité récupéré depuis le token :', user[uniteClaimKey]);
      return user[uniteClaimKey];
    }
  
    console.warn('Clé idunite non trouvée dans le token.');
    return null;
  }
  

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'Admin IT';
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  saveUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  getUser(): any | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
  
}
