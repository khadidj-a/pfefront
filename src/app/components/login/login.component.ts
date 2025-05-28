import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  email = '';
  motpasse = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, motpasse: this.motpasse }).subscribe({
      next: (response: any) => {
        this.authService.saveToken(response.token);
        this.authService.saveUser(response.user); // ✅ Ajoute ceci

        const role = this.authService.getUserRole();
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        console.error('Login error:', err);

        if (err.status === 0) {
          this.errorMessage = 'Erreur réseau. Vérifiez la connexion.';
        } else if (err.status === 401) {
          if (typeof err.error === 'string') {
            this.errorMessage = err.error;
          } else {
            this.errorMessage = 'Email ou mot de passe incorrect.';
          }
        } else {
          this.errorMessage = 'Erreur inconnue. Veuillez réessayer.';
        }

        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
