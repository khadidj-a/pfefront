import { Component } from '@angular/core';
import { Router } from '@angular/router';
import{AuthService}from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-codification-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './codification-management.component.html',
  styleUrls: ['./codification-management.component.scss']
})

export class CodificationManagementComponent {
  showLogoutConfirm = false;
  profileOpen = false;
  username = 'Utilisateur';
 isDropdownOpen = false;
 user: any = {};
 role: string | null = null;
  constructor(private router: Router,private dialog: MatDialog,
      private authService: AuthService) {}

      ngOnInit(): void {
        const userData = localStorage.getItem('user');
        if (userData) {
          this.user = JSON.parse(userData); // 👈 on charge nom + prénom
        }
        this.user = this.authService.getUser();
        this.role = this.authService.getUserRole();
      }
    
  navigateTo(path: string) {
    this.router.navigate([path]);
  }
  
  
  logout() {
    this.showLogoutConfirm = true;
  }
  
  confirmLogout() {
    this.showLogoutConfirm = false;
    this.authService.logout();
  }
  
  cancelLogout() {
    this.showLogoutConfirm = false;
  }
  get isAdminIT(): boolean {
    return this.role === 'Admin IT';
  }

  get isAdminMetier(): boolean {
    return this.role === 'Admin Métier';
  }
}
