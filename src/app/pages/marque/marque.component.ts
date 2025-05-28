import { Component, OnInit,HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarqueService } from '../../services/marque.service';
import { Marque } from '../../models/marque.model';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-marque',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marque.component.html',
  styleUrls: ['./marque.component.scss']
})
export class MarqueComponent implements OnInit {
  marques: Marque[] = [];
  searchTerm = '';
  sortBy = 'codemarque';
  ascending = true;
  selectedMarque: Marque | null = null;
  showForm = false;
  nom_fabriquant_input = '';
  user: any = {};
  profileOpen = false;
  username = 'Utilisateur';
 isDropdownOpen = false;
 showDeleteConfirm = false;
marqueToDelete: Marque | null = null;
showLogoutConfirm = false;
marqueCount: number = 0;
role: string | null = null;

  constructor(private marqueService: MarqueService, private router: Router,
    private authService: AuthService,private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadMarques();
    this.getMarqueCount();
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
  loadMarques() {
    this.marqueService.getAll(this.searchTerm, this.sortBy, this.ascending)
      .subscribe(data => {
        this.marques = data;
        this.marqueCount = data.length;
      });
  }
  
  getMarqueCount() {
    this.marqueService.getMarqueCount().subscribe(count => {
    this.marqueCount = count;
  });
}

  search() {
    this.loadMarques();
  }

  toggleSort(column: string) {
    if (this.sortBy === column) {
      this.ascending = !this.ascending;
    } else {
      this.sortBy = column;
      this.ascending = true;
    }
    this.loadMarques();
  }

  openForm(marque?: Marque) {
    this.selectedMarque = marque || null;
    this.nom_fabriquant_input = marque?.nom_fabriquant || '';
    this.showForm = true;
  }

  closeForm() {
    this.selectedMarque = null;
    this.nom_fabriquant_input = '';
    this.showForm = false;
  }

  saveMarque() {
    if (!this.nom_fabriquant_input ) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (this.selectedMarque) {
      this.marqueService.update(this.selectedMarque.idmarque, {
        nom_fabriquant: this.nom_fabriquant_input
      }).subscribe(() => {
        this.loadMarques();
        this.closeForm();
      });
    } else {
      this.marqueService.create({
        nom_fabriquant: this.nom_fabriquant_input
      }).subscribe(() => {
        this.loadMarques();
        this.closeForm();
      });
    }
  }

  deleteMarque(marque: Marque) {
    this.marqueService.canDelete(marque.idmarque).subscribe(can => {
      if (!can) {
        alert("Impossible de supprimer cette marque, elle est utilisée.");
        return;
      }
      this.marqueToDelete = marque;
      this.showDeleteConfirm = true;
    });
  }
  
  confirmDelete() {
    if (this.marqueToDelete) {
      this.marqueService.delete(this.marqueToDelete.idmarque).subscribe(() => {
        this.loadMarques();
        this.marqueToDelete = null;
        this.showDeleteConfirm = false;
      });
    }
  }
  
  cancelDelete() {
    this.marqueToDelete = null;
    this.showDeleteConfirm = false;
  }
  

 // toggleProfileMenu() {
 //   this.profileOpen = !this.profileOpen;
 // }

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
