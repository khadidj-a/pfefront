import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupeIdentiqueDTO, UpdateGroupeIdentiqueDTO } from '../../models/groupe-identique.model';
import { GroupeIdentiqueService } from '../../services/groupe-identique.service';
import { Router } from '@angular/router';
import { Caracteristique } from '../../models/caracteristique.model';
import { Organee } from '../../models/organe.model';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-groupe-identique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './groupe-identique.component.html',
  styleUrls: ['./groupe-identique.component.scss']
})
export class GroupeIdentiqueComponent implements OnInit {
  groupes: GroupeIdentiqueDTO[] = [];
  searchTerm = '';
  sortBy = 'codeGrp';
  ascending = true;
  showForm = false;
  profileOpen = false;
  user: any = {};
  isDropdownOpen = false;
  groupeCount: number = 0;
  username = 'Admin';
  selectedGroupeId: number = 0;
  showLogoutConfirm = false;

  groupe = {
    codeGrp: '',
    idType: 0,
    idMarque: 0,
    marqueNom:'',
    typeEquipNom:'',
    caracteristiques: [] as number[],
    organes: [] as number[]
  };
  marques: any[] = [];
  types: any[] = [];
  caracteristiques: Caracteristique[] = [];
organes: Organee[] = [];
  showDeleteConfirm = false;
  groupeToDelete: GroupeIdentiqueDTO | null = null;
  role: string | null = null;

  constructor(private service: GroupeIdentiqueService, private router: Router,private authService: AuthService,private dialog: MatDialog) {}
  ngOnInit(): void {
    this.loadData();
    this.getGroupeCount();
    const userData = localStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData); 
      }
      this.user = this.authService.getUser();
      this.role = this.authService.getUserRole();
  }
  

  @HostListener('document:click', ['$event'])
  closeDropdownOnClickOutside(event: MouseEvent): void {
    const dropdown = document.querySelector('.dropdown') as HTMLElement;
    if (dropdown && !dropdown.contains(event.target as HTMLElement)) {
      this.isDropdownOpen = false;
    }
  }
  getGroupeCount() {
    this.service.getGroupeCount().subscribe(count => {
    this.groupeCount = count;
  });
}
loadData(): void {
  this.service.GetAll(this.searchTerm, this.sortBy, this.ascending).subscribe({
    next: (data) => {
      this.groupes = data;
      // Si tu voulais compter les groupes :
      this.groupeCount = data.length;
    },
    error: (err) => console.error('Erreur de chargement', err)
  });
}

  loadCaracteristiques(typeId: number, marqueId: number): void {
    if (!typeId || !marqueId) {
      console.warn("Type ou Marque manquant - caractéristiques annulé", { typeId, marqueId });
      return;
    }
    this.service.getCaracteristiquesByTypeAndMarque(typeId, marqueId).subscribe({
      next: (data) => {
        this.caracteristiques = data;
        console.log("Caractéristiques chargées:", data);
      },
      error: (err) => console.error("Erreur caractéristiques", err)
    });
  }
  
  loadOrganes(typeId: number, marqueId: number): void {
    if (!typeId || !marqueId) {
      console.warn("Type ou Marque manquant - organes annulé", { typeId, marqueId });
      return;
    }
    this.service.getOrganesByTypeAndMarque(typeId, marqueId).subscribe({
      next: (data) => {
        this.organes = data;
        console.log("Organes chargés:", data);
      },
      error: (err) => console.error("Erreur organes", err)
    });
  }
  
  
  

  onSearch(): void {
    this.loadData();
  }

  toggleSort(column: string): void {
    if (this.sortBy === column) {
      this.ascending = !this.ascending;
    } else {
      this.sortBy = column;
      this.ascending = true;
    }
    this.loadData();
  }

  edit(id: number): void {
    const groupe = this.groupes.find(g => g.id === id);
    if (!groupe) return;
  
    console.log(" Groupe trouvé :", groupe);
    this.selectedGroupeId = id;
    this.groupe.codeGrp = groupe.codeGrp;
    this.groupe.typeEquipNom = groupe.typeEquipNom;
    this.groupe.marqueNom = groupe.marqueNom;
  
    // Appel à l'API pour obtenir les bons idType/idMarque + ids caractéristiques/organes
    this.service.getById(id).subscribe((data) => {
      console.log(" Données complètes du groupe:", data);
  
      // S'assurer que idType et idMarque sont bien présents dans la réponse
      if (!data.idType || !data.idMarque) {
        console.warn(" idType ou idMarque manquant dans la réponse", data);
        return;
      }
  
      // Remplir tous les champs nécessaires
      this.groupe.idType = data.idType;
      this.groupe.idMarque = data.idMarque;
      this.groupe.caracteristiques = data.caracteristiquesIds ?? [];
      this.groupe.organes = data.organesIds ?? [];
  
      // Chargement des listes liées au type/marque
      this.loadCaracteristiques(this.groupe.idType, this.groupe.idMarque);
      this.loadOrganes(this.groupe.idType, this.groupe.idMarque);
  
      this.showForm = true;
    }, error => {
      console.error("Erreur getById:", error);
    });
  }
  
  

  
  save(): void {
    const dto: UpdateGroupeIdentiqueDTO = {
      id_organes: this.groupe.organes,
      id_caracteristiques: this.groupe.caracteristiques
    };
  
    this.service.update(this.selectedGroupeId, dto).subscribe({
      next: () => {
        this.loadData();
        this.closeForm(); // ← ferme bien la modale après update
      },
      error: (err) => console.error("Erreur de mise à jour", err)
    });
    
  }
  
  openForm(): void {
    console.log('Ouverture du formulaire');
    this.showForm = true;
  }
  


  closeForm(): void {
    this.showForm = false;
  }
  
  deleteGroupe(groupe: GroupeIdentiqueDTO): void {
    this.service.canDelete(groupe.id).subscribe(can => {
      if (!can) {
        alert("Impossible de supprimer ce groupe, il est utilisé.");
        return;
      }
      this.groupeToDelete = groupe;
      this.showDeleteConfirm = true;
    });
  }

  confirmDelete(): void {
    if (this.groupeToDelete) {
      this.service.delete(this.groupeToDelete.id).subscribe(() => {
        this.loadData();
        this.groupeToDelete = null;
        this.showDeleteConfirm = false;
      });
    }
  }

  cancelDelete(): void {
    this.groupeToDelete = null;
    this.showDeleteConfirm = false;
  }

  logout(): void {
    this.showLogoutConfirm = true;
  }

  confirmLogout(): void {
    this.showLogoutConfirm = false;
    window.location.href = "/login";
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  onCheckOrgane(id: number, event: any): void {
    if (event.target.checked) {
      if (!this.groupe.organes.includes(id)) this.groupe.organes.push(id);
    } else {
      this.groupe.organes = this.groupe.organes.filter(i => i !== id);
    }
  }
  
  onCheckCarac(id: number, event: any): void {
    if (event.target.checked) {
      if (!this.groupe.caracteristiques.includes(id)) this.groupe.caracteristiques.push(id);
    } else {
      this.groupe.caracteristiques = this.groupe.caracteristiques.filter(i => i !== id);
    }
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
