import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReformeService } from '../../services/reforme.service';
import { Reforme, CreateReformeDTO } from '../../models/reforme.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reforme',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reforme-management.component.html',
  styleUrls: ['./reforme-management.component.scss']
})
export class ReformeComponent implements OnInit {
  reformes: Reforme[] = [];
  selectedReforme: Reforme | null = null;
  reformeCount: number = 0;
  showForm = false;
  profileOpen = false;
  isDropdownOpen = false;
  username = 'Admin';
  showLogoutConfirm = false;
 user: any = {};
 role: string | null = null;
  ideqpt_input: number | null = null;
  motifref_input = '';
  dateref_input = '';
  numdes_input :number | null = null;
  searchTerm: string = '';
  sortBy: string = 'equipement'; 
  order: string = 'asc';
  equipements: { idEqpt: number; design: string; position_physique?: string;
    uniteDesignation?: string;}[] = [];
  allEquipements: { idEqpt: number; design: string; codeEqp?: string; position_physique?: string ;
    uniteDesignation?: string;}[] = [];
    positionPhysique: string | null = null;
    uniteDesignation :string|null = null;
  newreforme: CreateReformeDTO = {
    ideqpt: 0,
    numdes:0,
    dateref: '',
    motifref: ''
  };
idunite:any={};

unites: { idunite: number; designation: string }[] = [];
uniteActuelle: { idunite: number; designation: string } | null = null;
  constructor(private reformeService: ReformeService,private router: Router ,
    private authService: AuthService,private dialog: MatDialog) {}

  ngOnInit(): void {
     
   
      const userData = localStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData); // 👈 on charge nom + prénom
      }
      this.user = this.authService.getUser();
      this.role = this.authService.getUserRole();
      
    this.idunite = this.authService.getUserUniteId();
    console.log('Rôle utilisateur :', this.role);
    console.log('ID unité utilisateur :', this.idunite);
     this.getReformeCount();
    this.loadReformes();
      this.loadEquipements(); // pour le formulaire
      this.loadAllEquipements(); // pour l'affichage
      
     
  
  }
  
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  closeDropdownOnClickOutside(event: MouseEvent): void {
    const dropdown = document.querySelector('.dropdown') as HTMLElement;
    if (dropdown && !dropdown.contains(event.target as HTMLElement)) {
      this.isDropdownOpen = false;
    }
  }

  loadReformes() {
    if (this.isResponsableUnite) {
    

      this.reformeService.getByUnite(this.idunite, this.searchTerm, this.sortBy, this.order).subscribe({
        next: (data) => this.reformes = data,
        error: (err) => console.error('Erreur chargement prêts unité', err)
      });
    } else {
    this.reformeService.getAllReformes(this.searchTerm, this.sortBy, this.order).subscribe(data => {
      this.reformes = data;
      console.log('📋 Réformes chargées :', this.reformes);
    });}
  }
  

  getReformeCount() {
    if (this.isResponsableUnite) {
      this.reformeService.getReformeCountByUnite(this.idunite).subscribe(count => {
        this.reformeCount = count;
        console.log('🔢 Nombre de réformes pour l’unité :', count);
      });
    } else {
      this.reformeService.getreformeCount().subscribe(count => {
        this.reformeCount = count;
        console.log('🔢 Nombre total des réformes :', count);
      });
    }
  }
  

  
 getDesignation(id: number): string {
    const eqpt = this.allEquipements.find(e => e.idEqpt === id);
    return eqpt ? eqpt.design : 'Équipement introuvable';
  }
  getUniteEmissionName(iduniteemt: number): string {
    const unite = this.unites.find(u => u.idunite === iduniteemt);
    return unite ? unite.designation : 'Unité d’émission introuvable';
  }
  openForm(reforme?: Reforme) {
    this.selectedReforme = reforme || null;
    this.ideqpt_input = reforme ? reforme.ideqpt : null;
    this.motifref_input = reforme ? reforme.motifref : '';
    this.dateref_input = reforme ? reforme.dateref .substring(0, 10) : new Date().toISOString().substring(0, 10),
    this.numdes_input = reforme ? reforme.numdes : null;
    this.showForm = true;
  }

  closeForm() {
    this.selectedReforme = null;
    this.ideqpt_input = null;
    this.motifref_input = '';
    this.dateref_input = '';
    this.numdes_input  =null;
    this.showForm = false;
  }
  saveReforme(): void {
    if (!this.ideqpt_input || !this.dateref_input|| !this.numdes_input) {
      alert("Veuillez remplir tous les champs.");
      console.log("❗ Champs manquants :", {
        ideqpt_input: this.ideqpt_input,
        motifref_input: this.motifref_input,
        numdes_input: this.numdes_input
      });
      return;
    }
  
    console.log("✅ Tous les champs sont remplis.");
    console.log("🔍 Vérification de l'état de l'équipement ID =", this.ideqpt_input);
  
    this.reformeService.getEtatEquipement(this.ideqpt_input).subscribe({
      next: (etat: string) => {
        console.log("✅ État récupéré :", etat);
  
        if (etat.toLowerCase() === 'reforme' ) {
          alert("Cet équipement est déjà en état 'réformé' .");
          console.log("❌ Équipement non réformable :", etat);
          return;
        }
  
        console.log("🔍 Vérification du numéro de décision :", this.numdes_input);
        this.reformeService.getReformeByNumeroDecision(this.numdes_input!).subscribe({
          next: (existingReforme: boolean) => {
            console.log("🔎 Numéro de décision existe déjà ? =>", existingReforme);
  
            if (existingReforme) {
              alert("Le numéro de décision existe déjà. Veuillez en choisir un autre.");
              return;
            }
  
            const dto: CreateReformeDTO = {
              ideqpt: this.ideqpt_input!,
              motifref: this.motifref_input,
              dateref: new Date(this.dateref_input).toISOString().split('T')[0],
              numdes: Number(this.numdes_input)
            };
  
            console.log("📦 Données envoyées pour la réforme :", dto);
  
            this.reformeService.createReforme(dto).subscribe({
              next: () => {
                console.log('✅ Réforme ajoutée avec succès');
                this.loadReformes();
                this.closeForm();
              },
              error: (error: any) => {
                console.error("❌ Erreur lors de l'enregistrement :", error);
                alert("Erreur lors de l'enregistrement : " + (error.error?.message || error.message || "Inconnue"));
            }
            
            });
          },
          error: (err: any) => {
            console.error("❌ Erreur lors de la vérification du numéro de décision :", err);
            alert("Erreur lors de la vérification du numéro de décision.");
          }
        });
      },
      error: (err: any) => {
        console.error("❌ Erreur lors de la récupération de l'état :", err);
        alert("Erreur : Impossible de vérifier l'état de l'équipement.");
      }
    });
  }
  loadEquipements(): void {
    this.reformeService.getEquipementsNonReformes().subscribe({
      next: (data) => {
        this.equipements = data;
        console.log('📥 Équipements non réformés récupérés :', this.equipements);
      },
      error: (err) => console.error('❌ Erreur chargement équipements non réformés', err)
    });
  }
  
  loadAllEquipements(): void {
    this.reformeService.getAllEquipements().subscribe({
      next: (data) => {
        this.allEquipements = data;
        console.log('📥 Tous les équipements récupérés :', this.allEquipements);
      },
      error: (err) => console.error('❌ Erreur chargement tous équipements', err)
    });
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
  toggleSort(col: string): void {
    if (this.sortBy === col) {
      this.order = this.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = col;
      this.order = 'asc'; // défaut à asc pour nouvelle colonne
    }
    this.search(); // recharge les données avec le tri mis à jour
  }
  
  search(): void {
    if (this.isResponsableUnite) {
      this.reformeService
      .getByUnite(this.idunite, this.searchTerm, this.sortBy, this.order)
      .subscribe((data) => {
        this.reformes = data;
        this.reformeCount = data.length;
      });
    }else{
    this.reformeService
      .getReformes(this.searchTerm, this.sortBy, this.order)
      .subscribe((data) => {
        this.reformes = data;
        
      this.reformeCount = data.length;
      });
  }}
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
  getUniteDesignation(ideqpt: number): string {
    const eqpt = this.allEquipements.find(e => e.idEqpt === ideqpt);
    return eqpt ? eqpt.uniteDesignation ?? 'Unité inconnue' : 'Équipement non trouvé';
  }
  
  onEquipementChange(): void {
    const ideqpt = Number(this.newreforme.ideqpt);
    console.log('🔄 Équipement sélectionné :', ideqpt);
  
    // 1. Recherche de l’équipement sélectionné
    const equipementSelectionne = this.equipements.find(eq => eq.idEqpt === ideqpt)
      || this.allEquipements.find(eq => eq.idEqpt === ideqpt);
  
    if (!equipementSelectionne) {
      console.warn('⚠️ Équipement non trouvé');
      this.positionPhysique = null;
      this.uniteDesignation = null;
      return;
    }
  
    // 2. Récupération de la position physique
    this.positionPhysique = equipementSelectionne.position_physique?.trim() || null;
    console.log('📍 Position physique récupérée :', this.positionPhysique);
  
    // 3. Récupération de l’unité désignation directement depuis l’équipement
    this.uniteDesignation = equipementSelectionne.uniteDesignation?.trim() || null;
    console.log('🏷️ Unité désignation récupérée :', this.uniteDesignation);
  }
  
 
}
