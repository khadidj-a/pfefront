import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReaffectationService } from '../../services/reaffectation.service';
import { Reaffectation, CreateReaffectationDTO } from '../../models/reaffectation.model';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-reaffectation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reaffectation-management.component.html',
  styleUrls: ['./reaffectation-management.component.scss']
})
export class ReaffectationComponent implements OnInit {
  reaffectations: Reaffectation[] = [];
  reaffectationCount: number = 0;
  newReaffectation: CreateReaffectationDTO = { idEquipement: 0, idUniteDestination: 0, date: '', motif: '' };


  equipements: { idEqpt: number; design: string; position_physique?: string;idunite?: number | null}[] = [];
  allEquipements: { idEqpt: number; design: string; codeEqp?: string; position_physique?: string }[] = [];
  positionPhysique: string | null = null;
  selectedReaffectation: Reaffectation | null = null;
  showForm = false;
  searchTerm: string = '';
  sortBy: string = 'equipement'; 
  order: string = 'asc';
  profileOpen = false;
  isDropdownOpen = false;
  username = 'Admin';
  currentUser: any;
  showLogoutConfirm = false;
  user: any = {};
  role: string | null = null;
  uniteActuelle: { idunite: number; designation: string } | null = null;

  idunite:any={};
unites: { idunite: number; designation: string }[] = [];
  constructor(private reaffectationService: ReaffectationService,private router: Router,private dialog: MatDialog,
    private authService: AuthService) {}
  

    ngOnInit(): void {
      console.log('✅ Composant Reaffectation initialisé');
    const userData = localStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData); // 👈 on charge nom + prénom
      }
      this.user = this.authService.getUser();
      this.role = this.authService.getUserRole();
      
    this.idunite = this.authService.getUserUniteId();
    console.log('Rôle utilisateur :', this.role);
    console.log('ID unité utilisateur :', this.idunite);
      this.loadReaffectations();
      this.loadEquipements();
      this.loadAllEquipements();
      this.loadUnites();
      this.loadReaffectationCount();
    
      
    }
    
  
  loadReaffectations(): void {
    if (this.isResponsableUnite) {
    

      this.reaffectationService.getByUnite(this.idunite, this.searchTerm, this.sortBy, this.order).subscribe({
        next: (data) => this.reaffectations = data,
        error: (err) => console.error('Erreur chargement prêts unité', err)
      });
    } else {
    this.reaffectationService.getAllReaffectations(this.searchTerm, this.sortBy, this.order).subscribe(
      (data) => {
        this.reaffectations = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des réaffectations', error);
      }
    );}
  }
 
  loadUnites(): void {
    console.log('⏳ Chargement des unités...');
    this.reaffectationService.getAllUnites().subscribe(
      (data) => {
        console.log('✅ Unités chargées :', data);
        this.unites = data;
      },
      (error) => {
        console.error('❌ Erreur lors du chargement des unités', error);
      }
    );
  }
  
  

 
  
  loadEquipements(): void {
    this.reaffectationService.getEquipementsNonReformes().subscribe({
      next: (data) => {
        this.equipements = data;
        console.log('📥 Équipements non réformés récupérés :', this.equipements);
      },
      error: (err) => console.error('❌ Erreur chargement équipements non réformés', err)
    });
  }
  
  loadAllEquipements(): void {
    this.reaffectationService.getAllEquipements().subscribe({
      next: (data) => {
        this.allEquipements = data;
        console.log('📥 Tous les équipements récupérés :', this.allEquipements);
      },
      error: (err) => console.error('❌ Erreur chargement tous équipements', err)
    });
  }
  
  
  loadReaffectationCount(): void {
    if (this.isResponsableUnite) {
      this.reaffectationService.getRefCountByUnite(this.idunite).subscribe(count => {
        this.reaffectationCount = count;
        console.log('🔢 Nombre de réformes pour l’unité :', count);
      });
    } else {
    this.reaffectationService.getReaffectationCount().subscribe(
      (data) => {
        this.reaffectationCount = data;
      },
      (error) => {
        console.error('Erreur lors du chargement du nombre de réaffectations', error);
      }
    ); }
  }

 
  addReaffectation(): void {
    if (
      this.newReaffectation.idEquipement &&
      this.newReaffectation.idUniteDestination &&
      this.newReaffectation.date 
    ) {
      this.reaffectationService.getEtatEquipement(this.newReaffectation.idEquipement).subscribe({
        next: (etat: string) => {
          console.log("✅ État récupéré :", etat);
  
          if (etat.toLowerCase() === 'reforme' ) {
            alert("Cet équipement est déjà en état 'réformé'.");
            return;
          }
  
          this.reaffectationService.addReaffectation(this.newReaffectation).subscribe(
            (response) => {
              console.log('Réaffectation ajoutée :', response);
              this.loadReaffectations();
              this.newReaffectation = { idEquipement: 0, idUniteDestination: 0, date: '', motif: '' };
              this.showForm = false;
            },
            (error) => {
              console.error('Erreur lors de l\'ajout de la réaffectation', error);
              alert(error.error || 'Erreur inconnue lors de l’ajout');
            }
          );
        },
        error: (err: any) => {
          console.error("❌ Erreur lors de la récupération de l'état :", err);
          alert("Erreur : Impossible de vérifier l'état de l'équipement.");
        }
      });
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }
  
  
  openForm(reaffectation?: Reaffectation): void {
    this.selectedReaffectation = reaffectation || null;
    this.newReaffectation = {
      idEquipement: reaffectation ? reaffectation.ideqpt : 0,
      idUniteDestination: reaffectation ? reaffectation.idunitedest : 0,
      date: reaffectation ? reaffectation.datereaf.substring(0, 10) : new Date().toISOString().substring(0, 10),
      motif: reaffectation ? reaffectation.motifreaf : ''
    };
  
    this.uniteActuelle = null;
    this.showForm = true;
   
  }
  
  closeForm(): void {
    this.selectedReaffectation = null;
    this.newReaffectation = { idEquipement: 0, idUniteDestination: 0, date: '', motif: '' };
    this.showForm = false;
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
  getDesignation(id: number): string {
    if (!this.allEquipements || this.allEquipements.length === 0) return '';
    const eqpt = this.allEquipements.find(e => e.idEqpt === id);
    if (!eqpt) {
      console.error(`❌ Équipement introuvable pour id = ${id}`);
      return 'Équipement introuvable';
    }
    return eqpt.design;
  }
  

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
  navigateToUserManagement(): void {
    this.router.navigate(['/user-management']);
  } 
   getUniteName(idunitedest: number): string {
    if (!this.unites || this.unites.length === 0) return '';
    const eqpt = this.unites.find(e => e.idunite=== idunitedest);
    if (!eqpt) {
      console.error(`Unite introuvable pour id = ${idunitedest}`);
      return 'Unite introuvable';
    }
    return eqpt.designation;
  }
  getUniteEmissionName(iduniteemt: number): string {
    if (!this.unites || this.unites.length === 0) {
      console.warn('⚠️ Liste des unités vide ou non chargée.');
      return '';
    }
  
    const unite = this.unites.find(u => u.idunite === iduniteemt);
    if (!unite) {
      console.error(`❌ Unité d'émission introuvable pour id = ${iduniteemt}`);
      return 'Unité d’émission introuvable';
    }
  
    return unite.designation;
  }
  toggleSort() {
    this.order = this.order === 'asc' ? 'desc' : 'asc';
    this.search(); // relance la recherche avec le nouvel ordre
  }
  search(): void {
  if (this.isResponsableUnite) {
    this.reaffectationService.getByUnite(this.idunite, this.searchTerm, this.sortBy, this.order).subscribe((data: any[]) =>{
      this.reaffectations = data;
      this.reaffectationCount = data.length;
    });
  } else {
    this.reaffectationService.getAll(this.searchTerm, this.sortBy, this.order).subscribe((data: any[]) => {
      this.reaffectations = data;
      this.reaffectationCount = data.length;
    });
  }
  }
 
  onEquipementChange(): void {
    const ideqpt = +this.newReaffectation.idEquipement;
    console.log('🔄 Équipement sélectionné :', ideqpt);
  
    // 1. Recherche de l’équipement sélectionné
    let equipementSelectionne = this.equipements.find(eq => eq.idEqpt === ideqpt)
      || this.allEquipements.find(eq => eq.idEqpt === ideqpt);
  
    if (!equipementSelectionne) {
      console.warn('⚠️ Équipement non trouvé');
      this.positionPhysique = null;
      this.uniteActuelle = null;
      return;
    }
  
    // 2. Récupération de la position physique
    this.positionPhysique = equipementSelectionne.position_physique?.trim() || null;
    console.log('📍 Position physique récupérée :', this.positionPhysique);
  
    // 3. Récupération de l’unité actuelle
    const idunite = (equipementSelectionne as any).idunite;
  
    if (idunite != null) {
      const unite = this.unites.find(u => u.idunite === idunite);
      this.uniteActuelle = unite || null;
      console.log('🏷️ Unité actuelle trouvée :', this.uniteActuelle);
    } else {
      console.warn('⚠️ ID unité non trouvé dans l’équipement');
      this.uniteActuelle = null;
    }
  }
  
  
  loadUniteActuellePourEquipement(idEquipement: number): void {
    console.log('📡 Requête API pour l’unité actuelle de l’équipement :', idEquipement);
  
    this.reaffectationService.getUniteByEquipementId(idEquipement).subscribe({
      next: (unite) => {
        console.log('✅ Unité actuelle récupérée depuis l’API :', unite);
        this.uniteActuelle = unite;
      },
      error: (error) => {
        console.error('❌ Erreur lors de la récupération de l’unité actuelle :', error);
        this.uniteActuelle = null;
      }
    });
  }
  
  getCodeEqp(ideqpt: number): string {
    const eqpt = this.allEquipements.find(e => e.idEqpt === ideqpt);
    return eqpt ? (eqpt.codeEqp ?? '---') : '---';

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
}
