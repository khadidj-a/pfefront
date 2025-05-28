import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  isAdminIT: boolean = false; 
  user: any = {};
  profileOpen = false;
showLogoutConfirm = false;
isAdminMetier: boolean = false;
isResponsableUnite: boolean = false;
  constructor( private authService: AuthService,private dialog: MatDialog ,private router: Router) {}

  ngOnInit(): void {
    
    
    const userRole = this.authService.getUserRole();
    this.isAdminIT = userRole === 'Admin IT'; 
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData); // 👈 on charge nom + prénom
    }
    this.user = this.authService.getUser();
    this.currentUser = this.authService.getUser(); // ✅ Info complète depuis localStorage

    const role = this.authService.getUserRole();

    this.isAdminIT = role === 'Admin IT';
    this.isAdminMetier = role === 'Admin Métier';
    this.isResponsableUnite = role === 'Responsable Unité';
    
  }

  

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  navigateToUserManagement(): void {
    this.router.navigate(['/user-management']);
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
}
