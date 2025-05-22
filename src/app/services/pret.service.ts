import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pret, CreatePretDTO } from '../models/pret.model';

@Injectable({
  providedIn: 'root'
})
export class PretService {
  private apiUrl = 'http://localhost:5186/api/Pret'; 

  constructor(private http: HttpClient) {}

  getAll(search?: string, sortBy?: string, order: string = 'asc'): Observable<Pret[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    params = params.set('order', order);

    return this.http.get<Pret[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Pret> {
    return this.http.get<Pret>(`${this.apiUrl}/${id}`);
  }
  getByUnite(idunite: number, search?: string, sortBy?: string, order: string = 'asc'): Observable<Pret[]> {
    let params = new HttpParams().set('idunite', idunite.toString());
    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    params = params.set('order', order);
  
    return this.http.get<Pret[]>(`${this.apiUrl}/byunite`, { params });
  }
  
  getpretCountByUnite(idunite: number) {
    return this.http.get<number>(`${this.apiUrl}/count/unite/${idunite}`);
  }
  
  getPretCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  getEtatEquipement(id: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/equipement/${id}/etat`, { responseType: 'text' });
  }

  createPret(dto: CreatePretDTO): Observable<Pret> {
    return this.http.post<Pret>(this.apiUrl, dto);
  }
  getAllEquipements(): Observable<{ idEqpt: number; design: string;position_physique?: string  }[]> {
    return this.http.get<{ idEqpt: number; design: string }[]>(`http://localhost:5186/api/Equipement`);
  }
  getEquipementsNonReformes(): Observable<{ idEqpt: number; design: string;position_physique?: string  }[]> {
    return this.http.get<{ idEqpt: number; design: string }[]>(
      'http://localhost:5186/api/Equipement/non-reformes'
    );
  }
  getAllUnites(): Observable<{ idunite: number; designation: string }[]> {
    return this.http.get<{ idunite: number; designation: string }[]>('http://localhost:5186/api/unite');
  }

  getPrets(params: { search?: string; sortBy?: string; order?: string; idUnite?: number }) {
    let queryParams = new HttpParams();
  
    if (params.search) queryParams = queryParams.set('search', params.search);
    if (params.sortBy) queryParams = queryParams.set('sortBy', params.sortBy);
    if (params.order) queryParams = queryParams.set('order', params.order);
    if (params.idUnite !== undefined) queryParams = queryParams.set('idUnite', params.idUnite.toString());
  
    return this.http.get<any[]>(this.apiUrl, { params: queryParams });
  }
  
}
