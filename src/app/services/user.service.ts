import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Unite } from '../models/unite.model'; // ✅ Import placé correctement

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5186/api/utilisateur';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, { headers: this.getHeaders() });
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, user, { headers: this.getHeaders() });
  }

  updateUser(iduser: number, user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${iduser}`, user, { headers: this.getHeaders() });
  }

  toggleUserStatus(iduser: number, actif: string): Observable<any> {
    const action = actif === '1' ? 'activate' : 'deactivate';
    return this.http.patch<any>(`${this.apiUrl}/${iduser}/${action}`, {}, { headers: this.getHeaders() });
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists?email=${encodeURIComponent(email)}`);
  }
  

  getUnites(): Observable<Unite[]> {
    return this.http.get<Unite[]>(`http://localhost:5186/api/Unite`, {
      headers: this.getHeaders()
    });
  }
  getutilisateurCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }
}
