import { Component, OnInit,HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeService } from '../../services/typeeq.service';
import { TypeEqpt } from '../../models/typeeq.model';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-typeeqpt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './typeeq.component.html',
  styleUrls: ['./typeeq.component.scss']
})
export class TypeEqptComponent implements OnInit {
  types: TypeEqpt[] = [];
  selectedType: TypeEqpt | null = null;
  designation_input = '';
  searchTerm = '';
  sortBy = 'codetype';
  ascending = true;
  showForm = false;
  user: any = {};
  profileOpen = false;
  isDropdownOpen = false;
  username = 'Admin';
  showDeleteConfirm = false;
  typeToDelete: TypeEqpt | null = null;
  
 typeCount: number = 0;
  showLogoutConfirm = false;
  role: string | null = null;
  
  constructor(private typeService: TypeService, private router: Router,
    private authService: AuthService,private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadTypes();
    this.getTypeCount();
    const userData = localStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData); 
      }
      this.user = this.authService.getUser();
      this.role = this.authService.getUserRole();
  }
  getTypeCount() {
    this.typeService.getTypeCount().subscribe(count => {
    this.typeCount = count;
  });
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

  loadTypes() {
    this.typeService.getAllTypes(this.searchTerm, this.sortBy, this.ascending)
      .subscribe(data =>{ this.types = data;
        
        this.typeCount = data.length;
      });
  }

  search() {
    this.loadTypes();
  }

  toggleSort(column: string) {
    if (this.sortBy === column) {
      this.ascending = !this.ascending;
    } else {
      this.sortBy = column;
      this.ascending = true;
    }
    this.loadTypes();
  }

  openForm(type?: TypeEqpt) {
    this.selectedType = type || null;
    this.designation_input = type?.designation || '';
    this.showForm = true;
  }

  closeForm() {
    this.selectedType = null;
    this.designation_input = '';
    this.showForm = false;
  }

  saveType() {
    if (!this.designation_input) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (this.selectedType) {
      this.typeService.updateType({
        idtypequip: this.selectedType.idtypequip,
        codetype: this.selectedType.codetype,
        designation: this.designation_input
      }).subscribe(() => {
        this.loadTypes();
        this.closeForm();
      });
    } else {
      this.typeService.createType({ designation: this.designation_input })
        .subscribe(() => {
          this.loadTypes();
          this.closeForm();
        });
    }
  }


  deletetype(type: TypeEqpt) {
    this.typeService.canDelete(type.idtypequip).subscribe(can => {
      if (!can) {
        alert("Impossible de supprimer ce Type, elle est utilisée.");
        return;
      }
      console.log('Boîte de confirmation doit s’afficher'); // debug
      this.typeToDelete = type;
      this.showDeleteConfirm = true;
    });
  }
  
    
    confirmDelete() {
      if (this.typeToDelete) {
        this.typeService.deleteType(this.typeToDelete.idtypequip).subscribe(() => {
          this.loadTypes();
          this.typeToDelete = null;
          this.showDeleteConfirm = false;
        });
      }
    }
    
    cancelDelete() {
      this.typeToDelete = null;
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
