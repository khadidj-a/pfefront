import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from '@angular/router';


@Component({
  selector: "app-equipment-management",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <header class="page-header">
        <div class="header-content">
          <h1>Gestion des Équipements</h1>
          <button class="back-button" (click)="goBack()">Retour au tableau de bord</button>
        </div>
      </header>
      
      <div class="content">
        <div class="placeholder">
          <h2>Fonctionnalité en cours de développement</h2>
          <p>La gestion des équipements sera bientôt disponible.</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .page-header {
      background-color: #ffffff;
      padding: 15px 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-header h1 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }
    
    .back-button {
      padding: 8px 16px;
      background-color: #f0f0f0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .back-button:hover {
      background-color: #e0e0e0;
    }
    
    .content {
      flex: 1;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    
    .placeholder {
      background-color: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    
    .placeholder h2 {
      margin-top: 0;
      color: #333;
    }
    
    .placeholder p {
      color: #666;
    }
  `,
  ],
})
export class EquipmentManagementComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(["/dashboard"])
  }
}
