import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategorieService } from '../../services/categorie.service';
import { Categorie } from '../../models/categorie.model';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-categorie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.scss']
})
export class CategorieComponent implements OnInit {
  categories: Categorie[] = [];
  selectedCategorie: Categorie | null = null;
  categorie_input: any = {
    designation: ''
  };
  searchTerm = '';
  sortBy = 'codecategorie';
  ascending = true;
  showForm = false;
  profileOpen = false;
  username = 'Utilisateur';
  isDropdownOpen = false;
  showDeleteConfirm = false;
categorieToDelete: Categorie| null = null;
user: any = {};
role: string | null = null;
showLogoutConfirm = false;
categorieCount: number = 0;
  constructor(private categorieService: CategorieService, private router: Router,
    private authService: AuthService,private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadCategories();
    this.getCategorieCount();
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

  loadCategories() {
    this.categorieService.getAll(this.searchTerm, this.sortBy, this.ascending)
      .subscribe((data: Categorie[]) => {
        this.categories = data;
        this.categorieCount = data.length;
        console.log("Catégories chargées :", data);
      });
  }
  getCategorieCount() {
    this.categorieService.getCategorieCount().subscribe(count => {
    this.categorieCount = count;
  });
}
  search() {
    this.loadCategories();
  }

  openForm(categorie?: Categorie): void {
    this.selectedCategorie = categorie || null;
    this.categorie_input = {
      designation: categorie ? categorie.designation : ''
    };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedCategorie = null;
    this.categorie_input = {
      designation: ''
    };
  }

  saveCategorie(): void {
    if (!this.categorie_input ) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const data: Categorie = {
      idcategorie: this.selectedCategorie?.idcategorie || 0,
      codecategorie: '',
      designation: this.categorie_input.designation
    };

    if (this.selectedCategorie) {
      this.categorieService.update(this.selectedCategorie.idcategorie, data).subscribe(() => {
        this.loadCategories();
        this.closeForm();
      });
    } else {
      this.categorieService.create(data).subscribe(() => {
        this.loadCategories();
        this.closeForm();
      });
    }
  }

  toggleSort(col: string): void {
    if (this.sortBy === col) {
      this.ascending = !this.ascending;
    } else {
      this.sortBy = col;
      this.ascending = true;
    }
    this.search();
  }

  
    deletecategorie(categorie: Categorie) {
      this.categorieService.canDelete(categorie.idcategorie).subscribe(can => {
        if (!can) {
          alert("Impossible de supprimer cette catégorie, elle est utilisée.");
          return;
        }
        this.categorieToDelete = categorie;
        this.showDeleteConfirm = true;
      });
    }
    
    confirmDelete() {
      if (this.categorieToDelete) {
        this.categorieService.delete(this.categorieToDelete.idcategorie).subscribe(() => {
          this.loadCategories();
          this.categorieToDelete = null;
          this.showDeleteConfirm = false;
        });
      }
    }
    
    cancelDelete() {
      this.categorieToDelete = null;
      this.showDeleteConfirm = false;
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
