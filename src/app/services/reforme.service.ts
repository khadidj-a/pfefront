import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reforme, CreateReformeDTO } from '../models/reforme.model';

@Injectable({
  providedIn: 'root'
})
export class ReformeService {
  private apiUrl = 'http://localhost:5186/api/Reforme';

  constructor(private http: HttpClient) {}

  getAllReformes(search?: string, sortBy?: string, order: string = 'asc'): Observable<Reforme[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    params = params.set('order', order);
    return this.http.get<Reforme[]>(this.apiUrl, { params});
  }

  getReformeById(id: number): Observable<Reforme> {
    return this.http.get<Reforme>(`${this.apiUrl}/${id}`);
  }
  getEtatEquipement(id: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/equipement/${id}/etat`, { responseType: 'text' });
  }

  getReformeByNumeroDecision(numeroDecision: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${numeroDecision}`);
  }
  
  getByUnite(idunite: number, search?: string, sortBy?: string, order: string = 'asc'): Observable<Reforme[]> {
    let params = new HttpParams().set('idunite', idunite.toString());
    
    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    params = params.set('order', order);
  
    return this.http.get<Reforme[]>(`${this.apiUrl}/byunite`, { params });
  }
  getReformeCountByUnite(idunite: number) {
    return this.http.get<number>(`${this.apiUrl}/count/unite/${idunite}`);
  }
  

  createReforme(dto: CreateReformeDTO): Observable<Reforme> {
    return this.http.post<Reforme>(this.apiUrl, dto);
  }
  getreformeCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }
  getAllEquipements(): Observable<{ idEqpt: number; design: string;uniteDesignation?: string;position_physique?: string  }[]> {
    return this.http.get<{ idEqpt: number; design: string }[]>('http://localhost:5186/api/Equipement');
  }
  getEquipementsNonReformes(): Observable<{ idEqpt: number; design: string;uniteDesignation?: string;position_physique?: string  }[]> {
    return this.http.get<{ idEqpt: number; design: string }[]>(
      'http://localhost:5186/api/Equipement/non-reformes'
    );
  }
  getReformes(search: string = '', sortBy: string = '', order: string = 'asc') {
    let params: any = {};
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (order) params.order = order;
  
    return this.http.get<Reforme[]>(this.apiUrl, { params });
  }
  
}
