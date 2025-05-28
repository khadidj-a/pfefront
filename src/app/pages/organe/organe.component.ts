import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganeService } from '../../services/organe.service';
import { Organe, Marque, Caracteristique } from '../../models/organe.model';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-organe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organe.component.html',
  styleUrls: ['./organe.component.scss']
})
export class OrganeComponent implements OnInit {
  organes: Organe[] = [];
  selectedOrgane: Organe | null = null;
  marques: Marque[] = [];
  caracteristiques: (Caracteristique & { checked?: boolean, valeur?: string })[] = [];
  user: any = {};
  selectedMarqueId: number | null = null;
  searchTerm = '';
  sortBy = 'codeorgane';
  ascending = true;
  showForm = false;
  profileOpen = false;
  isDropdownOpen = false;
  username = 'Admin';

  code_input = '';
  libelle_input = '';
  selectedMarque: number | null = null;
  showDeleteConfirm = false;
organeToDelete: Organe | null = null;
modele_input = '';
organeCount: number = 0;
showLogoutConfirm = false;
role: string | null = null;

  constructor(private organeService: OrganeService, private router: Router,
    private authService: AuthService,private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadOrganes();
    this.loadMarques();
    this.loadCaracteristiques();
    this.getOrganeCount();
    const userData = localStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData); 
      }
      this.user = this.authService.getUser();
      this.role = this.authService.getUserRole();
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
  getOrganeCount() {
    this.organeService.getOrganeCount().subscribe(count => {
    this.organeCount = count;
  });
}

loadOrganes() {
  this.organeService.getOrganes(this.searchTerm, this.sortBy, this.ascending)
    .subscribe({
      next: data => {
        this.organes = data;
        this.organeCount = data.length;
      },
      error: err => console.error("Erreur chargement organes :", err)
    });
}

  loadMarques() {
    this.organeService.getMarques().subscribe({
      next: data => {
        console.log("Marques chargées :", data);
        this.marques = data;
      },
      error: err => console.error("Erreur chargement marques :", err)
    });
  }
  
  loadCaracteristiques() {
    this.organeService.getCaracteristiques().subscribe({
      next: data => {
        console.log("Caractéristiques chargées :", data);
        this.caracteristiques = data.map(carac => ({
          ...carac,
          checked: false,
          valeur: ''
        }));
      },
      error: err => console.error("Erreur chargement caractéristiques :", err)
    });
  }
  

  search() {
    this.loadOrganes();
  }

  toggleSort(column: string) {
    if (this.sortBy === column) {
      this.ascending = !this.ascending;
    } else {
      this.sortBy = column;
      this.ascending = true;
    }
    this.loadOrganes();
  }
 
  openForm(organe?: Organe) {
    this.selectedOrgane = organe ?? null; // <==== ajoute cette ligne !
    this.libelle_input = organe?.libelle_organe || '';
    this.selectedMarque = organe?.id_marque || null;
    this.modele_input = organe?.modele || '';


    // Reset toutes les caractéristiques
    this.caracteristiques.forEach(carac => {
      carac.checked = false;
      carac.valeur = '';
    });

    if (organe?.caracteristiques) {
      for (const c of organe.caracteristiques) {
        const found = this.caracteristiques.find(carac => carac.id_caracteristique === c.idcaracteristique);
        if (found) {
          found.checked = true;
          found.valeur = c.valeur;
        }
      }
    }

    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.selectedOrgane = null; // <==== ajoute ça !
  }

  saveOrgane() {
    if (!this.caracteristiques || !this.libelle_input || !this.selectedMarque || !this.modele_input) {
      alert('Veuillez remplir tous les champs requis.');
      return;
    }
    const modeleExiste = this.organes.some(o =>
      o.modele.toLowerCase() === this.modele_input.trim().toLowerCase() &&
      (!this.selectedOrgane || o.id_organe !== this.selectedOrgane.id_organe)
    );
    
    if (modeleExiste) {
      alert("Le modèle existe déjà !");
      return;
    }
    
    const selectedCaracteristiques = this.caracteristiques
      .filter(c => c.checked)
      .map(c => ({
        id_caracteristique: c.id_caracteristique,
        valeur: c.valeur || ''
      }));

    const organeData = {
      libelle_organe: this.libelle_input,
      id_marque: this.selectedMarque,
      modele: this.modele_input,
      caracteristiques: selectedCaracteristiques
    };

    if (this.selectedOrgane) {
      // Modifier
      this.organeService.updateOrgane(this.selectedOrgane.id_organe, organeData)
        .subscribe(() => {
          this.loadOrganes();
          this.closeForm();
        });
    } else {
      // Créer
      this.organeService.createOrgane(organeData)
        .subscribe(() => {
          this.loadOrganes();
          this.closeForm();
        });
    }
  }

    deleteorgane(organe: Organe) {
      this.organeService.canDelete(organe.id_organe).subscribe(can => {
        if (!can) {
          alert("Impossible de supprimer ce organe, il est utilisée.");
          return;
        }
        this.organeToDelete = organe;
        this.showDeleteConfirm = true;
      });
    }
    
    confirmDelete() {
      if (this.organeToDelete) {
        this.organeService.deleteOrgane(this.organeToDelete.id_organe).subscribe(() => {
          this.loadOrganes();
          this.organeToDelete = null;
          this.showDeleteConfirm = false;
        });
      }
    }
    
    cancelDelete() {
      this.organeToDelete = null;
      this.showDeleteConfirm = false;
    }
    
  onCheckboxChange(carac: Caracteristique & { checked?: boolean, valeur?: string }) {
    if (!carac.checked) {
      carac.valeur = '';
    }
  }

 
  logout() {
    this.showLogoutConfirm = true;
  }
  
  confirmLogout() {
    this.showLogoutConfirm = false;
    // redirige vers login ou autre action
    window.location.href = "/login"; // ou un appel à AuthService.logout()
  }
  
  cancelLogout() {
    this.showLogoutConfirm = false;
  }
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
  get isAdminIT(): boolean {
    return this.role === 'Admin IT';
  }

  get isAdminMetier(): boolean {
    return this.role === 'Admin Métier';
  }
}
