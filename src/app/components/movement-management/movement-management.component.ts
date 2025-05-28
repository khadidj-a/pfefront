import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import{AuthService}from '../../services/auth.service';
@Component({
  selector: 'app-movement-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movement-management.component.html',
  styleUrls: ['./movement-management.component.scss']
})
export class MovementManagementComponent implements OnInit{
  showLogoutConfirm = false;
  profileOpen = false;
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
  
    navigateTo(path: string): void {
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
