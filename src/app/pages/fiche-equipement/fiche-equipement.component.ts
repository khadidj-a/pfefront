import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Equipement } from '../../models/equipement.model';
import { Affectation } from '../../models/affectation.model';
import { OrganeEquipement } from '../../../../../pfefront/src/app/models/organe.model';
import { CaracteristiqueEquipement } from '../../../../../pfefront/src/app/models/caracteristique.model';
import { EquipementService } from '../../../../../pfefront/src/app/services/equipement.service';
import { AffectationService } from '../../../../../pfefront/src/app/services/affectation.service';
import { OrganeService } from '../../../../../pfefront/src/app/services/organe.service';
import { CaracteristiqueService } from '../../../../../pfefront/src/app/services/caracteristique.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../pfefront/src/app/services/auth.service';
@Component({
  selector: 'app-fiche-equipement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './fiche-equipement.component.html',
  styleUrls: ['./fiche-equipement.component.scss']
})
export class FicheEquipementComponent implements OnInit {
  equipements: Equipement[] = [];
  displayedEquipements: Equipement[] = [];
  filteredEquipements: Equipement[] = [];
  equipement: Equipement | null = null;
  affectation: Affectation | null = null;
  organes: OrganeEquipement[] = [];
  caracteristiques: CaracteristiqueEquipement[] = [];
  isLoading = false;
  profileOpen = false;
  username = 'Utilisateur';
  selectedEquipementId: number | null = null;
  searchTerm: string = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 1;
  user: any = {};
  role: string | null = null;
  showLogoutConfirm = false;
  idunite:any={};

  constructor(
    private route: ActivatedRoute,
    private equipementService: EquipementService,
    private affectationService: AffectationService,
    private organeService: OrganeService,
    private caracteristiqueService: CaracteristiqueService,
    private snackBar: MatSnackBar,private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const userData = localStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData); // 👈 on charge nom + prénom
      }
      this.user = this.authService.getUser();
      this.role = this.authService.getUserRole();
      
    this.idunite = this.authService.getUserUniteId();
    console.log('Rôle utilisateur :', this.role);
    console.log('ID unité utilisateur :', this.idunite);
    this.loadEquipements();
    
    // Load specific equipment if ID is in URL
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.selectEquipement(params['id']);
      }
    });
  }

loadEquipements() {
  this.isLoading = true;

  const obs$ = this.isResponsableUnite && this.idunite
    ? this.equipementService.getByUnite(this.idunite)
    : this.equipementService.getAll();

  obs$.subscribe({
    next: (data) => {
      this.equipements = data;
      this.filteredEquipements = data;
      this.totalItems = data.length;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      this.updateDisplayedEquipements();
      this.isLoading = false;

      // Auto-select first equipment if none is selected
      if (!this.selectedEquipementId && this.displayedEquipements.length > 0) {
        this.selectEquipement(this.displayedEquipements[0].idEqpt);
      }
    },
    error: (error) => {
      console.error('Erreur lors du chargement des équipements:', error);
      this.snackBar.open('Erreur lors du chargement des équipements', 'Fermer', { duration: 3000 });
      this.isLoading = false;
    }
  });
}


  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredEquipements = this.equipements;
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredEquipements = this.equipements.filter(item => 
        (item.uniteDesignation?.toLowerCase().includes(searchLower) || false) ||
        (item.design?.toLowerCase().includes(searchLower) || false) ||
        (item.codeEqp?.toLowerCase().includes(searchLower) || false)
      );
    }
    
    this.totalItems = this.filteredEquipements.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.currentPage = 1;
    this.updateDisplayedEquipements();
    
    // Auto-select first equipment in filtered results if none is selected
    if (!this.selectedEquipementId && this.displayedEquipements.length > 0) {
      this.selectEquipement(this.displayedEquipements[0].idEqpt);
    }
  }

  updateDisplayedEquipements() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedEquipements = this.filteredEquipements.slice(start, end);
    console.log('Updated displayed equipements:', this.displayedEquipements);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedEquipements();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectEquipement(id: number) {
    if (this.selectedEquipementId === id) return;
    
    this.selectedEquipementId = id;
    this.isLoading = true;
    console.log('Selecting equipment with ID:', id);

    forkJoin({
      equipment: this.equipementService.getById(id),
      affectation: this.affectationService.getByEquipementId(id),
      organes: this.organeService.getByEquipementId(id),
      caracteristiques: this.caracteristiqueService.getByEquipementId(id)
    }).subscribe({
      next: (data) => {
        console.log('Received equipment data:', data.equipment);
        console.log('Received affectation data:', data.affectation);
        console.log('Received organes data:', data.organes);
        console.log('Received caracteristiques data:', data.caracteristiques);
        
        this.equipement = data.equipment;
        this.affectation = data.affectation;
        this.organes = data.organes || [];
        this.caracteristiques = data.caracteristiques || [];
        
        // Add detailed logging for organes
        console.log('Assigned organes array:', this.organes);
        if (this.organes.length > 0) {
          console.log('First organe details:', {
            idorg: this.organes[0].idorg,
            ideqpt: this.organes[0].ideqpt,
            numserie: this.organes[0].numserie,
            nomOrgane: this.organes[0].nomOrgane
          });
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        if (error.error && this.equipement) {
          this.affectation = null;
          this.organes = [];
          this.caracteristiques = [];
          this.isLoading = false;
        } else {
          this.snackBar.open('Erreur lors du chargement des données', 'Fermer', { duration: 3000 });
          this.isLoading = false;
        }
      }
    });
  }

  getStatusClass(etat: string | undefined): string {
    if (!etat) return '';
    
    switch (etat.toLowerCase()) {
      case 'operationnel':
        return 'status-operational';
      case 'en panne':
        return 'status-panne';
      case 'reforme':
        return 'status-reforme';
      case 'pre_reforme':
        return 'status-pre-reforme';
      default:
        return '';
    }
  }

    get isAdminIT(): boolean {
    return this.role === 'Admin IT';
  }

  get isAdminMetier(): boolean {
    return this.role === 'Admin Métier';
  }
  get isResponsableUnite(): boolean { 
    return this.role === 'Responsable Unité';
   
  }
    logout() {
    this.showLogoutConfirm = true;
  }

  confirmLogout() {
    this.showLogoutConfirm = false;
    window.location.href = "/login";
  }

  cancelLogout() {
    this.showLogoutConfirm = false;
  }
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
  navigateToUserManagement(): void {
    this.router.navigate(['/user-management']);
  } 
} 