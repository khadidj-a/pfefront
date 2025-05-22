import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reaffectation, CreateReaffectationDTO } from '../models/reaffectation.model';

@Injectable({
  providedIn: 'root'
})
export class ReaffectationService {
  private apiUrl = 'http://localhost:5186/api/reaffectation'; // Assurez-vous que l'URL est correcte

  constructor(private http: HttpClient) {}

  getAllReaffectations(search?: string, sortBy?: string, order: string = 'asc'): Observable<Reaffectation[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    params = params.set('order', order);

    return this.http.get<Reaffectation[]>(this.apiUrl, { params });
  }
  getRefCountByUnite(idunite: number) {
    return this.http.get<number>(`${this.apiUrl}/count/unite/${idunite}`);
  }
  
  getReaffectationCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  addReaffectation(data: CreateReaffectationDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }


  getAllEquipements(): Observable<{ idEqpt: number; design: string ;position_physique?: string }[]> {
    return this.http.get<{ idEqpt: number; design: string }[]>(`http://localhost:5186/api/Equipement`);
  }
  getEquipementsNonReformes(): Observable<{ idEqpt: number; design: string ;position_physique?: string }[]> {
    return this.http.get<{ idEqpt: number; design: string }[]>(
      'http://localhost:5186/api/Equipement/non-reformes'
    );
  }
  getAllUnites(): Observable<{ idunite: number; designation: string }[]> {
    return this.http.get<{ idunite: number; designation: string }[]>('http://localhost:5186/api/unite');
  }
  getEtatEquipement(id: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/equipement/${id}/etat`, { responseType: 'text' });
  }
  getAll(search?: string, sortBy?: string, order?: string): Observable<Reaffectation[]> {
    let params: any = {};
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (order) params.order = order;
  
    return this.http.get<Reaffectation[]>(this.apiUrl, { params });
  }
  getUniteByEquipementId(id: number) {
    return this.http.get<{ idunite: number; designation: string }>(`http://localhost:5186/api/reaffectation/equipements/${id}/unite`);
  }
  getUniteById(id: number) {
    return this.http.get<{ idunite: number, designation: string }>(`http://localhost:5186/api/unite/${id}`);
  }
  getByUnite(idunite: number, search?: string, sortBy?: string, order: string = 'asc'): Observable<Reaffectation[]> {
    let params = new HttpParams().set('idunite', idunite.toString());
  
    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (order) params = params.set('order', order); // ✅ corriger ici
  
    return this.http.get<Reaffectation[]>(`${this.apiUrl}/byunite`, { params });
  }
  
  
}
