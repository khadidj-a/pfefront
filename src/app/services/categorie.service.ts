import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categorie {
  idcategorie: number;
  categorie_principale: string;
  codecategorie: string;
  designation: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private baseUrl = 'http://localhost:5186/api/Categorie'; // adapte si ton port change

  constructor(private http: HttpClient) {}

  getAll(searchTerm = '', sortBy = 'idcategorie', ascending = true): Observable<Categorie[]> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('sortBy', sortBy)
      .set('ascending', ascending.toString());

    return this.http.get<Categorie[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.baseUrl}/${id}`);
  }

  create(categorie: {  designation: string }): Observable<Categorie> {
    return this.http.post<Categorie>(this.baseUrl, categorie);
  }

  update(id: number, categorie: { designation: string }): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.baseUrl}/${id}`, categorie);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  canDelete(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/canDelete/${id}`);
  }
  getCategorieCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }
}
