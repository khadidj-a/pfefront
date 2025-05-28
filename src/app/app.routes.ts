import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { AdminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { FicheEquipementComponent } from './pages/fiche-equipement/fiche-equipement.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'user-management',
    component: UserManagementComponent,
    canActivate: [authGuard, AdminGuard],
  },

  {
    path: 'movements',
    loadComponent: () =>
      import('./components/movement-management/movement-management.component').then(
        m => m.MovementManagementComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'movements/pret',
    loadComponent: () =>
      import('./components/pret-management/pret-management.component').then(
        m => m.PretManagementComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'equipment',
    loadComponent: () =>
      import('./pages/equipement/equipement.component').then(
        m => m.EquipementComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'fiche-equipement',
    component: FicheEquipementComponent
  },
  {
    path: 'fiche-equipement/:id',
    component: FicheEquipementComponent
  },
  {
    path: 'codification',
    loadComponent: () =>
      import('./components/codification-management/codification-management.component').then(
        m => m.CodificationManagementComponent
      ),
    canActivate: [authGuard],
  },

  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./components/unauthorized/unauthorized.component').then(
        m => m.UnauthorizedComponent
      ),
  },

  // Codification pages (protected)
  {
    path: 'marque',
    loadComponent: () =>
      import('./pages/marque/marque.component').then(
        m => m.MarqueComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'typeeq',
    loadComponent: () =>
      import('./pages/typeeq/typeeq.component').then(
        m => m.TypeEqptComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'unite',
    loadComponent: () =>
      import('./pages/unite/unite.component').then(
        m => m.UniteComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'caracteristique',
    loadComponent: () =>
      import('./pages/caracteristique/caracteristique.component').then(
        m => m.CaracteristiqueComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'organe',
    loadComponent: () =>
      import('./pages/organe/organe.component').then(
        m => m.OrganeComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'categorie',
    loadComponent: () =>
      import('./pages/categorie/categorie.component').then(
        m => m.CategorieComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'groupeidentique',
    loadComponent: () =>
      import('./pages/groupe-identique/groupe-identique.component').then(
        m => m.GroupeIdentiqueComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'reforme',
    loadComponent: () =>
      import('./components/reforme-management/reforme-management.component').then(
        m => m.ReformeComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'reaffectation',
    loadComponent: () =>
      import('./components/reaffectation-management/reaffectation-management.component').then(
        m => m.ReaffectationComponent
      ),
    canActivate: [authGuard],
  },

  { path: '**', redirectTo: '/login' },
];
