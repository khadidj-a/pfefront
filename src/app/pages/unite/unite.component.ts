import { Component, OnInit,HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniteService } from '../../services/unite.service';
import { Unite, Region, Wilaya } from '../../models/unite.model';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unite.component.html',
  styleUrls: ['./unite.component.scss']
})
export class UniteComponent implements OnInit {
  unites: Unite[] = [];
  wilayas: Wilaya[] = [];
  regions: Region[] = [];
  uniteCount: number = 0;
  selectedUnite: Unite | null = null;
  searchTerm = '';
  sortBy = 'codeunite';
  user: any = {};
  ascending = true;
  showForm = false;
  profileOpen = false;
  isDropdownOpen = false;
  username = 'Admin';
  showDeleteConfirm = false;
uniteToDelete: Unite | null = null;
 showDeleteConfirmUnite: boolean = false;
showLogoutConfirm = false;
codeunite_input = '';
codeError = '';
designationError = '';
role: string | null = null;

  // Champs du formulaire
  designation_input = '';
  selectedWilaya: number | null = null;
  selectedRegion: number | null = null;

  constructor(private uniteService: UniteService, private router: Router,
    private authService: AuthService,private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadUnites();
    this.loadWilayas();
    this.loadRegions();
    this.getUniteCount();
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

  @HostListener('document:click', ['$event']) // Ajoutez ce décorateur
  closeDropdownOnClickOutside(event: MouseEvent): void {
    const dropdown = document.querySelector('.dropdown') as HTMLElement;
    const dropdownContent = document.querySelector('.dropdown-content') as HTMLElement;

    if (dropdown && !dropdown.contains(event.target as HTMLElement)) {
      this.isDropdownOpen = false;
    }
  }
  loadUnites() {
    this.uniteService.getUnites(this.searchTerm, this.sortBy, this.ascending)
      .subscribe(data => {
        console.log(data);  // Ajouter un log pour vérifier les données
        this.unites = data;
        
        this.uniteCount = data.length;
       
      });
      
}
  
  getUniteCount() {
    this.uniteService.getUniteCount().subscribe(count => {
    this.uniteCount = count;
  });
}

  loadWilayas() {
    this.uniteService.getWilayas().subscribe(data => this.wilayas = data);
  }

  loadRegions() {
    this.uniteService.getRegions().subscribe(data => this.regions = data);
  }

  

  search() {
    this.loadUnites();
  }

  toggleSort(column: string) {
    if (this.sortBy === column) {
      this.ascending = !this.ascending;
    } else {
      this.sortBy = column;
      this.ascending = true;
    }
    this.loadUnites();
  }

  openForm(unite?: any) {
    this.selectedUnite = unite || null;
    this.codeunite_input = unite ? unite.codeunite : '';
    this.designation_input = unite ? unite.designation : '';
    this.selectedWilaya = unite ? unite.idwilaya : null;
    this.selectedRegion = unite ? unite.idregion : null;
    this.codeError = '';
    this.showForm = true;
  }
  
  

  closeForm() {
    this.selectedUnite = null;
    this.codeunite_input = '';
    this.designation_input = '';
    this.selectedWilaya = null;
    this.selectedRegion = null;
    this.showForm = false;
  }
  saveUnite() {
    this.codeError = '';
  
    // Validation : tous les champs + codeunite de 2 caractères
    if (
      !this.codeunite_input || this.codeunite_input.length !== 2 ||
      !this.designation_input || !this.selectedWilaya || !this.selectedRegion
    ) {
      alert("Veuillez remplir tous les champs obligatoires. Le code doit avoir exactement 2 caractères.");
      return;
    }
  
    const dto = {
      codeunite: this.codeunite_input,
      designation: this.designation_input,
      idwilaya: this.selectedWilaya,
      idregion: this.selectedRegion
    };
  
    let request$;
    if (this.selectedUnite) {
      // Mode modification
      request$ = this.uniteService.updateUnite(this.selectedUnite.idunite, dto);
    } else {
      // Mode création
      request$ = this.uniteService.createUnite(dto);
    }
  
    request$.subscribe({
      next: () => {
        this.loadUnites();
        this.closeForm();
      },
      error: (error) => {
        if (error.status === 409) {
          if (error.error?.message?.toLowerCase().includes("code unité")) {
            this.codeError = "Ce code est déjà utilisé.";
          } else if (error.error?.message?.toLowerCase().includes("désignation")) {
            this.codeError = "Cette désignation existe déjà.";
          }
        } else {
          alert("Erreur lors de l'enregistrement de l’unité : " + (error.error?.message || "Erreur inconnue"));
        }
      }
    });
  }
  
 
 
  deleteUnite(unite: Unite) {
    this.uniteService.canDelete(unite.idunite).subscribe(can => {
      if (!can) {
        alert("Impossible de supprimer cette unité, elle est utilisée.");
        return;
      }
      this.uniteToDelete = unite;
      this.showDeleteConfirmUnite = true;  // Assurez-vous que cette variable est bien définie pour contrôler l'affichage
    });
}

confirmDeleteUnite() {
  if (this.uniteToDelete) {
    this.uniteService.deleteUnite(this.uniteToDelete.idunite).subscribe(() => {
      this.loadUnites();
      this.uniteToDelete = null;
      this.showDeleteConfirmUnite = false;  // Fermer la modale après la suppression
    });
  }
}

cancelDeleteUnite() {
  this.uniteToDelete = null;
  this.showDeleteConfirmUnite = false;  // Fermer la modale si l'utilisateur annule
}

 
  logout() {
    this.showLogoutConfirm = true;
  }
  
  confirmLogout() {
    this.showLogoutConfirm = false;
    // redirige vers login 
    window.location.href = "/login";
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
