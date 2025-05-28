import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Marque } from '../models/marque.model';

@Injectable({
  providedIn: 'root'
})
export class MarqueService {
  private baseUrl = 'http://localhost:5186/api/Marque'; // à adapter selon ton backend

  constructor(private http: HttpClient) {}

  getAll(searchTerm = '', sortBy = 'idmarque', ascending = true): Observable<Marque[]> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('sortBy', sortBy)
      .set('ascending', ascending.toString());
    return this.http.get<Marque[]>(this.baseUrl, { params });
  }

  create(marque: { nom_fabriquant: string }): Observable<Marque> {
    return this.http.post<Marque>(this.baseUrl, marque);
  }

  update(id: number, marque: { nom_fabriquant: string }): Observable<Marque> {
    return this.http.put<Marque>(`${this.baseUrl}/${id}`, marque);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  canDelete(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/CanDelete/${id}`);
  }
  getMarqueCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }
}


