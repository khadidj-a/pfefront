import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Caracteristique } from '../models/caracteristique.model';
import { Observable } from 'rxjs';
import { CaracteristiqueEquipement } from '../models/caracteristique.model';


@Injectable({
  providedIn: 'root'
})
export class CaracteristiqueService {
  private apiUrl = 'http://localhost:5186/api/caracteristique';
  private equipementUrl = 'http://localhost:5186/api/CaracteristiqueEquipement';

  constructor(private http: HttpClient) {}

  getAll(searchTerm: string = '', sortBy: string = 'id_caracteristique', ascending = true): Observable<Caracteristique[]> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('sortBy', sortBy)
      .set('ascending', ascending.toString());

    return this.http.get<Caracteristique[]>(this.apiUrl, { params });
  }

  add(car: Caracteristique): Observable<any> {
    return this.http.post(this.apiUrl, car);
  }

  update(id: number, car: Caracteristique): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, car);
  }

  canDelete(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/canDelete/${id}`);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  getCaracteristiqueCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }
  getByEquipementId(equipementId: number): Observable<CaracteristiqueEquipement[]> {
    return this.http.get<CaracteristiqueEquipement[]>(`${this.equipementUrl}/equipement/${equipementId}?showValue=true`);
  }
}
