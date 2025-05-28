import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GroupeIdentiqueDTO, UpdateGroupeIdentiqueDTO } from '../models/groupe-identique.model';
import { Observable } from 'rxjs';
import { Organe } from '../models/organe.model';
import { Caracteristique } from '../models/caracteristique.model';


@Injectable({ providedIn: 'root' })
export class GroupeIdentiqueService {
  private baseUrl = 'http://localhost:5186/api/GroupeIdentique';

  constructor(private http: HttpClient) {}

  GetAll(searchTerm = '', sortBy = 'id', ascending = true): Observable<GroupeIdentiqueDTO[]> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('sortBy', sortBy)
      .set('ascending', ascending);

    return this.http.get<GroupeIdentiqueDTO[]>(this.baseUrl, { params });
  }
  update(id: number, dto: UpdateGroupeIdentiqueDTO) {
    return this.http.put<void>(`${this.baseUrl}/${id}`, dto);
  }
  
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }
  
  getCaracteristiquesByTypeAndMarque(typeId: number, marqueId: number) {
    return this.http.get<Caracteristique[]>(`http://localhost:5186/api/caracteristique/type/${typeId}/marque/${marqueId}`);
  }
  
  getOrganesByTypeAndMarque(typeId: number, marqueId: number) {
    return this.http.get<Organe[]>(`http://localhost:5186/api/organe/type/${typeId}/marque/${marqueId}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  canDelete(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/canDelete/${id}`);
  }
  getGroupeCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }
  
}
