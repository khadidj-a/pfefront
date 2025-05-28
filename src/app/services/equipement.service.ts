import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { environment } from '../../../../pfefront/src/environments/environment';
import { Equipement, CreateEquipement, UpdateEquipement, EquipementFilter } from '../../../../pfefront/src/app/models/equipement.model';
import { Caracteristique } from '../models/caracteristique.model';
import { OrganeEquipement } from '../models/organe.model';

interface AffectationRequest {
    ideqpt: number;
    idunite: number;
    dateaffec: string;
    num_decision_affectation: string;
    num_ordre: string;
}

@Injectable({
    providedIn: 'root'
})
export class EquipementService {
    private baseUrl = `${environment.apiUrl}/Equipement`;
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    constructor() { }

    getAll(filter: EquipementFilter = {}): Observable<Equipement[]> {
        let params = new HttpParams();
        
        if (filter.searchTerm) {
            params = params.set('searchTerm', filter.searchTerm);
        }
        if (filter.sortBy) {
            params = params.set('sortBy', filter.sortBy);
        }
        if (filter.ascending !== undefined) {
            params = params.set('ascending', filter.ascending.toString());
        }
        if (filter.idCat) {
            params = params.set('idCat', filter.idCat.toString());
        }
        if (filter.etat) {
            params = params.set('etat', filter.etat);
        }
        if (filter.idMarq) {
            params = params.set('idMarq', filter.idMarq.toString());
        }
        if (filter.idType) {
            params = params.set('idType', filter.idType.toString());
        }
        if (filter.idGrpIdq) {
            params = params.set('idGrpIdq', filter.idGrpIdq.toString());
        }
        if (filter.numserie) {
            params = params.set('numserie', filter.numserie);
        }
        if (filter.position_physique) {
            params = params.set('position_physique', filter.position_physique);
        }
        if (filter.dateMiseService) {
            params = params.set('dateMiseService', filter.dateMiseService.toString());
        }
        if (filter.anneeFabrication) {
            params = params.set('anneeFabrication', filter.anneeFabrication.toString());
        }
        if (filter.dateAcquisition) {
            params = params.set('dateAcquisition', filter.dateAcquisition.toString());
        }
        if (filter.valeurAcquisition) {
            params = params.set('valeurAcquisition', filter.valeurAcquisition.toString());
        }

        return this.http.get<Equipement[]>(this.baseUrl, { params });
    }
getByUnite(idUnite: number, filter: EquipementFilter = {}): Observable<Equipement[]> {
    let params = new HttpParams();

    if (filter.searchTerm) {
        params = params.set('searchTerm', filter.searchTerm);
    }
    if (filter.sortBy) {
        params = params.set('sortBy', filter.sortBy);
    }
    if (filter.ascending !== undefined) {
        params = params.set('ascending', filter.ascending.toString());
    }
    if (filter.idCat) {
        params = params.set('idCat', filter.idCat.toString());
    }
    if (filter.etat) {
        params = params.set('etat', filter.etat);
    }
    if (filter.idMarq) {
        params = params.set('idMarq', filter.idMarq.toString());
    }
    if (filter.idType) {
        params = params.set('idType', filter.idType.toString());
    }
    if (filter.idGrpIdq) {
        params = params.set('idGrpIdq', filter.idGrpIdq.toString());
    }
    if (filter.numserie) {
        params = params.set('numserie', filter.numserie);
    }
    if (filter.position_physique) {
        params = params.set('position_physique', filter.position_physique);
    }
    if (filter.dateMiseService) {
        params = params.set('dateMiseService', filter.dateMiseService.toString());
    }
    if (filter.anneeFabrication) {
        params = params.set('anneeFabrication', filter.anneeFabrication.toString());
    }
    if (filter.dateAcquisition) {
        params = params.set('dateAcquisition', filter.dateAcquisition.toString());
    }
    if (filter.valeurAcquisition) {
        params = params.set('valeurAcquisition', filter.valeurAcquisition.toString());
    }

    return this.http.get<Equipement[]>(`${this.baseUrl}/by-unite/${idUnite}`, { params });
}


    getById(id: number): Observable<Equipement> {
        return this.http.get<Equipement>(`${this.baseUrl}/${id}`);
    }

    getByCode(code: string): Observable<Equipement> {
        return this.http.get<Equipement>(`${this.baseUrl}/code/${code}`);
    }

    create(equipement: CreateEquipement): Observable<Equipement> {
        return this.http.post<Equipement>(this.baseUrl, equipement);
    }

    update(id: number, equipement: UpdateEquipement): Observable<Equipement> {
        return this.http.put<Equipement>(`${this.baseUrl}/${id}`, equipement);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    getCount(): Observable<number> {
        return this.http.get<number>(`${this.baseUrl}/count`);
    }

    getCaracteristiquesByTypeAndMarque(typeId: number, marqueId: number) {
        return this.http.get<Caracteristique[]>(`${environment.apiUrl}/Caracteristique/type/${typeId}/marque/${marqueId}`);
    }

    bulkCreateCaracteristiqueEquipement(dto: { ideqpt: number, caracteristiques: { idcarac: number, valeur: string }[] }) {
        console.log('=== SENDING CHARACTERISTICS ===');
        console.log('Endpoint:', `${environment.apiUrl}/CaracteristiqueEquipement/bulk`);
        console.log('DTO received:', dto);
        console.log('Caracteristiques to send:', dto.caracteristiques);
        return this.http.post(`${environment.apiUrl}/CaracteristiqueEquipement/bulk`, dto).pipe(
            tap(response => console.log('API Response for characteristics:', response)),
            catchError(error => {
                console.error('API Error for characteristics:', error);
                return throwError(() => error);
            })
        );
    }

    getOrganesByTypeAndMarque(typeId: number, marqueId: number) {
        return this.http.get<any[]>(`${environment.apiUrl}/Organe/type/${typeId}/marque/${marqueId}`);
    }

    postOrganeEquipement(dto: { ideqpt: number, organes: OrganeEquipement[] }) {
        console.log('=== SENDING ORGANS ===');
        console.log('Endpoint:', `${environment.apiUrl}/OrganeEquipement`);
        console.log('Full payload:', JSON.stringify(dto, null, 2));
        console.log('Organs array:', dto.organes);
        console.log('First organ example:', dto.organes[0]);
        
        return this.http.post<any>(`${environment.apiUrl}/OrganeEquipement`, dto).pipe(
            tap(response => {
                console.log('API Response for organs:', response);
            }),
            catchError(error => {
                console.error('=== ORGAN API ERROR DETAILS ===');
                console.error('Error status:', error.status);
                console.error('Error message:', error.message);
                console.error('Error details:', error.error);
                console.error('Request URL:', error.url);
                console.error('Request payload:', dto);
                console.error('Full error object:', error);
                return throwError(() => error);
            })
        );
    }

    getOrganesForEquipement(ideqpt: number) {
        return this.http.get<any[]>(`${environment.apiUrl}/OrganeEquipement/equipement/${ideqpt}`);
    }

    getCaracteristiquesForEquipement(ideqpt: number) {
        return this.http.get<any[]>(`${environment.apiUrl}/CaracteristiqueEquipement/equipement/${ideqpt}?showValue=true`);
    }

    postAffectation(affectation: AffectationRequest): Observable<any> {
        const headers = {
            'Content-Type': 'application/json'
        };
        return this.http.post(`${this.apiUrl}/Affectation`, affectation, { headers }).pipe(
            catchError(error => {
                console.error('Affectation error:', error);
                return throwError(() => error);
            })
        );
    }

    // Add new methods for managing caracteristiques and organes
    addCaracteristiqueToEquipement(dto: { ideqpt: number, idcarac: number, valeur: string }) {
        return this.http.post(`${environment.apiUrl}/CaracteristiqueEquipement/add`, dto);
    }

    deleteCaracteristiqueFromEquipement(dto: { ideqpt: number, idcarac: number }) {
        return this.http.delete(`${environment.apiUrl}/CaracteristiqueEquipement/delete`, { body: dto });
    }

    modifyCaracteristiqueEquipement(dto: { ideqpt: number, idcarac: number, valeur: string }) {
        return this.http.put(`${environment.apiUrl}/CaracteristiqueEquipement/modify`, dto);
    }

    addOrganeToEquipement(dto: { ideqpt: number, idorg: number, numsérie: string }) {
        return this.http.post(`${environment.apiUrl}/OrganeEquipement/add`, dto);
    }

    deleteOrganeFromEquipement(dto: { ideqpt: number, idorg: number, numsérie?: string }) {
        return this.http.delete(`${environment.apiUrl}/OrganeEquipement/delete`, { body: dto });
    }

    modifyOrganeEquipement(dto: { ideqpt: number, idorg: number, numsérie: string }) {
        return this.http.put(`${environment.apiUrl}/OrganeEquipement/modify`, dto);
    }
} 