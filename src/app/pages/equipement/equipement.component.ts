import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../pfefront/src/environments/environment';
import { Equipement, CreateEquipement, UpdateEquipement, EquipementFilter } from '../../models/equipement.model';
import { TypeEqpt } from '../../../../../pfefront/src/app/models/typeeq.model';
import { Marque } from '../../../../../pfefront/src/app/models/marque.model';
import { EquipementService } from '../../../../../pfefront/src/app/services/equipement.service';
import { Caracteristique } from '../../../../../pfefront/src/app/models/caracteristique.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TypeService } from '../../../../../pfefront/src/app/services/typeeq.service';
import { CategorieService } from '../../../../../pfefront/src/app/services/categorie.service';
import { MarqueService } from '../../../../../pfefront/src/app/services/marque.service';
import { UniteService } from '../../../../../pfefront/src/app/services/unite.service';
import { CaracteristiqueService } from '../../../../../pfefront/src/app/services/caracteristique.service';
import { OrganeService } from '../../../../../pfefront/src/app/services/organe.service';
import { RouterModule } from '@angular/router';
import { CreateOrganeEquipement } from '../../models/organe.model';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../pfefront/src/app/services/auth.service';

interface AffectationRequest {
    ideqpt: number;
    idunite: number;
    dateaffec: string;
    num_decision_affectation: string;
    num_ordre: string;
}

interface Category {
    idcategorie: number;
    design: string;
}

interface GroupeIdentique {
    id: number;
    codeGrp: string;
    marqueNom: string;
    typeEquipNom: string;
    idType: number;
    idMarque: number;
}

@Component({
    selector: 'app-equipement',
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule, 
        ReactiveFormsModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule
    ],
    templateUrl: './equipement.component.html',
    styleUrls: ['./equipement.component.scss']
})
export class EquipementComponent implements OnInit {
    equipements: Equipement[] = [];
    filteredEquipements: Equipement[] = [];
    searchTerm = '';
    sortBy = 'codeEqp';
    ascending = true;
    selectedEquipement: Equipement | null = null;
    showForm = false;
    design_input = '';
    etat_input = '';
    idType_input: number | null = null;
    idCat_input: number | null = null;
    idMarq_input: number | null = null;
    dateMiseService_input = '';
    anneeFabrication_input: number | null = null;
    dateAcquisition_input = '';
    valeurAcquisition_input: number | null = null;
    types: TypeEqpt[] = [];
    categories: Category[] = [];
    marques: Marque[] = [];
    isLoading = false;
    showDeleteConfirm = false;
    equipementToDelete: Equipement | null = null;
    profileOpen = false;
    username = 'Utilisateur';
    caracteristiques: (Caracteristique & { checked?: boolean, valeur?: string })[] = [];
    organes: { 
        id_organe: number, 
        libelle_organe: string, 
        checked?: boolean, 
        numserie?: string 
    }[] = [];
    showAffectModal = false;
    affectEquipement: Equipement | null = null;
    affectUnite: number | null = null;
    affectDate: string = '';
    affectDecision: string = 'INCONNU';
    affectOrdre: string = 'INCONNU';
    unites: any[] = [];
    form!: FormGroup;
    isEditMode = false;
    selectedId: number | null = null;
    groupesIdentiques: GroupeIdentique[] = [];
    selectedGroupe: GroupeIdentique | null = null;
    
  user: any = {};
  role: string | null = null;
  showLogoutConfirm = false;
  idunite:any={};

    private equipementService = inject(EquipementService);
    private http = inject(HttpClient);
    private fb = inject(FormBuilder);
    private snackBar = inject(MatSnackBar);
    private typeService = inject(TypeService);
    private categorieService = inject(CategorieService);
    private marqueService = inject(MarqueService);
    private uniteService = inject(UniteService);
    private caracteristiqueService = inject(CaracteristiqueService);
    private organeService = inject(OrganeService);
     
    constructor(private router: Router,
    private authService: AuthService
  ) {}

    ngOnInit(): void {
        const userData = localStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData); // 👈 on charge nom + prénom
      }
      this.user = this.authService.getUser();
      this.role = this.authService.getUserRole();
      
    this.idunite = this.authService.getUserUniteId();
    console.log('Rôle utilisateur :', this.role);
    console.log('ID unité utilisateur :', this.idunite);
        this.initializeForm();
        this.form.get('anneeFabrication')?.valueChanges.subscribe(value => {
            if (value === '') {
                this.form.get('anneeFabrication')?.setValue(null);
            }
        });
        console.log('Form controls initialized:', this.form.controls);
        this.loadEquipements();
        this.loadTypes();
        this.loadCategories();
        this.loadMarques();
        this.loadGroupesIdentiques();
        this.loadUnites();
    }

    private initializeForm() {
        this.form = this.fb.group({
            design: ['', Validators.required],
            etat: ['', Validators.required],
            numserie: ['', Validators.required],
            position_physique: ['', Validators.required],
            idType: ['', Validators.required],
            idCat: ['', Validators.required],
            idMarq: ['', Validators.required],
            dateMiseService: ['', Validators.required],
            anneeFabrication: [null, Validators.required],
            dateAcquisition: ['', Validators.required],
            valeurAcquisition: ['', Validators.required],
            idGrpIdq: [''],
            // Affectation fields
            idunite: [''],
            dateaffec: [''],
            num_decision_affectation: [''],
            num_ordre: [''],
            // Observation field - now optional
            observation: ['']
        });

        // Add value change subscriptions for type and marque
        this.form.get('idType')?.valueChanges.subscribe(() => this.onTypeOrMarqueChange());
        this.form.get('idMarq')?.valueChanges.subscribe(() => this.onTypeOrMarqueChange());
    }

    loadEquipements() {
    this.isLoading = true;

    const filter: EquipementFilter = {
        searchTerm: this.searchTerm || undefined,
        sortBy: this.sortBy,
        ascending: this.ascending
        // Tu peux ajouter ici d'autres champs comme idCat, idType, etc.
    };

    const obs$ = this.isResponsableUnite && this.idunite
        ? this.equipementService.getByUnite(this.idunite, filter)
        : this.equipementService.getAll(filter);

    obs$.subscribe({
        next: (data) => {
            this.equipements = data;
            this.filteredEquipements = data;

            this.equipements.forEach(eq => {
                this.equipementService.getOrganesForEquipement(eq.idEqpt).subscribe({
                    next: (orgs) => { eq.organes = orgs; },
                    error: () => { eq.organes = []; }
                });
                this.equipementService.getCaracteristiquesForEquipement(eq.idEqpt).subscribe({
                    next: (caracs) => { eq.caracteristiques = caracs; },
                    error: () => { eq.caracteristiques = []; }
                });
            });

            this.isLoading = false;
        },
        error: (error) => {
            console.error('Erreur lors du chargement des équipements', error);
            this.snackBar.open('Erreur lors du chargement des équipements', 'Fermer', { duration: 3000 });
            this.isLoading = false;
        }
    });
}


    search() {
        if (!this.searchTerm.trim()) {
            this.filteredEquipements = this.equipements;
        } else {
            const searchLower = this.searchTerm.toLowerCase().trim();
            this.filteredEquipements = this.equipements.filter(eq => 
                (eq.design?.toLowerCase().includes(searchLower)) ||
                (eq.codeEqp?.toLowerCase().includes(searchLower)) ||
                (eq.uniteDesignation?.toLowerCase().includes(searchLower)) ||
                (eq.marqueNom?.toLowerCase().includes(searchLower)) ||
                (eq.typeDesignation?.toLowerCase().includes(searchLower)) ||
                (eq.numserie?.toLowerCase().includes(searchLower)) ||
                (eq.etat?.toLowerCase().includes(searchLower))
            );
        }
    }

    toggleSort(column: string) {
        if (this.sortBy === column) {
            this.ascending = !this.ascending;
        } else {
            this.sortBy = column;
            this.ascending = true;
        }
        this.loadEquipements();
    }

    loadTypes() {
        this.typeService.getAllTypes().subscribe({
            next: (data: TypeEqpt[]) => {
                this.types = data;
            },
            error: (error: any) => {
                console.error('Error loading types:', error);
                this.types = [];
                this.snackBar.open('Erreur lors du chargement des types', 'Fermer', { duration: 3000 });
            }
        });
    }

    loadCategories() {
        this.categorieService.getAll().subscribe({
            next: (data: any[]) => {
                console.log('Raw Categories data:', data);
                this.categories = data.map(cat => ({
                    idcategorie: cat.idcategorie,
                    design: cat.design || cat.designation // handle both possible property names
                }));
                console.log('Processed categories:', this.categories);
            },
            error: (error: any) => {
                console.error('Error loading categories:', error);
                this.categories = [];
                this.snackBar.open('Erreur lors du chargement des catégories', 'Fermer', { duration: 3000 });
            }
        });
    }

    loadMarques() {
        this.marqueService.getAll().subscribe({
            next: (data: any[]) => {
                this.marques = data as Marque[];
            },
            error: (error: any) => {
                console.error('Error loading marques:', error);
                this.marques = [];
                this.snackBar.open('Erreur lors du chargement des marques', 'Fermer', { duration: 3000 });
            }
        });
    }

    openForm(equipement?: Equipement) {
        this.selectedEquipement = equipement || null;
        this.showForm = true;
        this.caracteristiques = [];
        this.organes = [];
        this.loadUnites();

        if (equipement) {
            // Load existing equipment data
            this.equipementService.getById(equipement.idEqpt).subscribe({
                next: (data) => {
                    // Format dates for the form
                    const formatDate = (date: Date | string | null | undefined) => {
                        if (!date) return '';
                        const d = new Date(date);
                        return d.toISOString().split('T')[0];
                    };

                    console.log('Loading equipment data:', data);
                    
                    // First set the type and marque
                    this.form.patchValue({
                        idType: data.idType,
                        idMarq: data.idMarq
                    });

                    // Wait a bit for the type and marque to be set
                    setTimeout(() => {
                        // Then set the rest of the form values
                        this.form.patchValue({
                            design: data.design,
                            etat: data.etat,
                            numserie: data.numserie || '',
                            position_physique: data.position_physique || '',
                            idCat: data.idCat,
                            dateMiseService: formatDate(data.dateMiseService),
                            anneeFabrication: data.anneeFabrication,
                            dateAcquisition: formatDate(data.dateAcquisition),
                            valeurAcquisition: data.valeurAcquisition,
                            idGrpIdq: data.idGrpIdq,
                            observation: data.observation || ''
                        });

                        console.log('Form values after patch:', this.form.value);

                        // Load current characteristics
                        this.http.get<any[]>(`${environment.apiUrl}/CaracteristiqueEquipement/equipement/${data.idEqpt}?showValue=true`).subscribe({
                            next: (caracs) => {
                                console.log('Loaded current characteristics:', caracs);
                                // First get all possible characteristics for this type/marque
                                this.http.get<any[]>(`${environment.apiUrl}/Caracteristique/type/${data.idType}/marque/${data.idMarq}`).subscribe({
                                    next: (allCaracs) => {
                                        // Map the current characteristics with their full data
                                        this.caracteristiques = caracs.map(c => {
                                            const fullCarac = allCaracs.find(ac => ac.id_caracteristique === c.idcarac);
                                            return {
                                                ...c,
                                                checked: true,
                                                valeur: c.valeur || '',
                                                id_caracteristique: c.idcarac,
                                                libelle: fullCarac?.libelle || c.libelle || ''
                                            };
                                        });
                                        console.log('Processed characteristics:', this.caracteristiques);
                                    },
                                    error: (error) => {
                                        console.error('Error loading all characteristics:', error);
                                        this.caracteristiques = caracs.map(c => ({
                                            ...c,
                                            checked: true,
                                            valeur: c.valeur || '',
                                            id_caracteristique: c.idcarac
                                        }));
                                    }
                                });
                            },
                            error: (error) => {
                                console.error('Error loading characteristics:', error);
                                this.caracteristiques = [];
                            }
                        });

                        // Load current organs
                        this.http.get<any[]>(`${environment.apiUrl}/OrganeEquipement/equipement/${data.idEqpt}`).subscribe({
                            next: (orgs) => {
                                console.log('Loaded current organs:', orgs);
                                // First get all possible organs for this type/marque
                                this.http.get<any[]>(`${environment.apiUrl}/Organe/type/${data.idType}/marque/${data.idMarq}`).subscribe({
                                    next: (allOrgs) => {
                                        // Map the current organs with their full data
                                        this.organes = orgs.map(o => {
                                            const fullOrg = allOrgs.find(ao => ao.id_organe === o.idorg);
                                            return {
                                                ...o,
                                                checked: true,
                                                numserie: o.numserie || '',
                                                id_organe: o.idorg,
                                                libelle_organe: fullOrg?.libelle_organe || o.libelle_organe || ''
                                            };
                                        });
                                        console.log('Processed organs:', this.organes);
                                    },
                                    error: (error) => {
                                        console.error('Error loading all organs:', error);
                                        this.organes = orgs.map(o => ({
                                            ...o,
                                            checked: true,
                                            numserie: o.numserie || '',
                                            id_organe: o.idorg
                                        }));
                                    }
                                });
                            },
                            error: (error) => {
                                console.error('Error loading organs:', error);
                                this.organes = [];
                            }
                        });
                    }, 100);

                    this.isEditMode = true;
                    this.selectedId = data.idEqpt;
                },
                error: (error) => {
                    console.error('Error loading equipment:', error);
                    this.snackBar.open('Erreur lors du chargement de l\'équipement', 'Fermer', { duration: 3000 });
                }
            });
        } else {
            this.form.reset({
                design: '',
                etat: '',
                numserie: '',
                position_physique: '',
                idType: '',
                idCat: '',
                idMarq: '',
                dateMiseService: '',
                anneeFabrication: '',
                dateAcquisition: '',
                valeurAcquisition: '',
                idGrpIdq: '',
                observation: ''
            });
            this.isEditMode = false;
            this.selectedId = null;
        }
    }

    closeForm() {
        this.selectedEquipement = null;
        this.showForm = false;
        this.form.reset({
            design: '',
            etat: '',
            numserie: '',
            position_physique: '',
            idType: '',
            idCat: '',
            idMarq: '',
            dateMiseService: '',
            anneeFabrication: '',
            dateAcquisition: '',
            valeurAcquisition: '',
            idGrpIdq: '',
            idunite: '',
            dateaffec: '',
            num_decision_affectation: '',
            num_ordre: '',
            observation: ''
        });
        this.isEditMode = false;
        this.selectedId = null;
        this.caracteristiques = [];
        this.organes = [];
    }

    onTypeOrMarqueChange() {
        const typeId = this.form.get('idType')?.value;
        const marqueId = this.form.get('idMarq')?.value;
        console.log('Type ID:', typeId, 'Marque ID:', marqueId);

        if (typeId && marqueId) {
            const url = `${environment.apiUrl}/GroupeIdentique/byTypeAndMarque?typeId=${typeId}&marqueId=${marqueId}`;
            console.log('Calling API:', url);

            this.http.get<any[]>(url).subscribe({
                next: (data: any[]) => {
                    console.log('API Response:', data);
                    if (data && data.length > 0) {
                        this.selectedGroupe = data[0];
                        console.log('Selected Groupe:', this.selectedGroupe);
                        this.form.patchValue({
                            idGrpIdq: this.selectedGroupe?.id
                        });
                    } else {
                        console.log('No groupe found');
                        this.selectedGroupe = null;
                        this.form.patchValue({
                            idGrpIdq: null
                        });
                    }
                },
                error: (error: any) => {
                    console.error('Error loading groupe identique:', error);
                    this.selectedGroupe = null;
                    this.form.patchValue({
                        idGrpIdq: null
                    });
                }
            });

            // Continue with loading characteristics and organs
            console.log('Loading characteristics and organs for type and marque...');
            
            // Store currently checked items
            const checkedCaracs = this.caracteristiques.filter(c => c.checked);
            const checkedOrgs = this.organes.filter(o => o.checked);
            
            // Load characteristics
            this.http.get<any[]>(`${environment.apiUrl}/Caracteristique/type/${typeId}/marque/${marqueId}`).subscribe({
                next: (caracs) => {
                    console.log('Received characteristics for type/marque:', caracs);
                    if (caracs && caracs.length > 0) {
                        // Map new characteristics, preserving checked status for existing ones
                        this.caracteristiques = caracs.map(carac => {
                            const existingCarac = checkedCaracs.find(c => c.id_caracteristique === carac.id_caracteristique);
                            if (existingCarac) {
                                // If it exists and was checked, keep it checked and preserve its value
                                return {
                                    ...carac,
                                    checked: true,
                                    valeur: existingCarac.valeur || ''
                                };
                            }
                            // New characteristic, unchecked by default
                            return {
                                ...carac,
                                checked: false,
                                valeur: ''
                            };
                        });
                    } else {
                        // If no characteristics found, load all characteristics
                        console.log('No characteristics found for type/marque, loading all...');
                        this.http.get<any[]>(`${environment.apiUrl}/Caracteristique`).subscribe({
                            next: (allCaracs) => {
                                this.caracteristiques = allCaracs.map(carac => {
                                    const existingCarac = checkedCaracs.find(c => c.id_caracteristique === carac.id_caracteristique);
                                    if (existingCarac) {
                                        return {
                                            ...carac,
                                            checked: true,
                                            valeur: existingCarac.valeur || ''
                                        };
                                    }
                                    return {
                                        ...carac,
                                        checked: false,
                                        valeur: ''
                                    };
                                });
                            }
                        });
                    }
                },
                error: (err) => {
                    console.error('Error loading characteristics:', err);
                    this.caracteristiques = [];
                }
            });

            // Load organs
            this.http.get<any[]>(`${environment.apiUrl}/Organe/type/${typeId}/marque/${marqueId}`).subscribe({
                next: (orgs) => {
                    console.log('Received organs for type/marque:', orgs);
                    if (orgs && orgs.length > 0) {
                        // Map new organs, preserving checked status for existing ones
                        this.organes = orgs.map(org => {
                            const existingOrg = checkedOrgs.find(o => o.id_organe === org.id_organe);
                            if (existingOrg) {
                                // If it exists and was checked, keep it checked and preserve its numserie
                                return {
                                    ...org,
                                    checked: true,
                                    numserie: existingOrg.numserie || ''
                                };
                            }
                            // New organ, unchecked by default
                            return {
                                ...org,
                                checked: false,
                                numserie: ''
                            };
                        });
                    } else {
                        // If no organs found, load all organs
                        console.log('No organs found for type/marque, loading all...');
                        this.http.get<any[]>(`${environment.apiUrl}/Organe?ascending=true`).subscribe({
                            next: (allOrgs) => {
                                this.organes = allOrgs.map(org => {
                                    const existingOrg = checkedOrgs.find(o => o.id_organe === org.id_organe);
                                    if (existingOrg) {
                                        return {
                                            ...org,
                                            checked: true,
                                            numserie: existingOrg.numserie || ''
                                        };
                                    }
                                    return {
                                        ...org,
                                        checked: false,
                                        numserie: ''
                                    };
                                });
                            }
                        });
                    }
                },
                error: (err) => {
                    console.error('Error loading organs:', err);
                    this.organes = [];
                }
            });
        } else {
            console.log('Clearing characteristics and organs as type or marque is missing');
            this.caracteristiques = [];
            this.organes = [];
            this.selectedGroupe = null;
            this.form.patchValue({
                idGrpIdq: null
            });
        }
    }

    loadCaracteristiques(typeId: number, marqueId: number) {
        this.http.get<any[]>(`${environment.apiUrl}/Caracteristique/type/${typeId}/marque/${marqueId}`).subscribe({
            next: (data: any[]) => {
                this.caracteristiques = data.map(carac => ({ ...carac, checked: false, valeur: '' }));
            },
            error: (err: any) => {
                this.caracteristiques = [];
            }
        });
    }

    loadOrganes(typeId: number, marqueId: number) {
        this.http.get<any[]>(`${environment.apiUrl}/Organe/type/${typeId}/marque/${marqueId}`).subscribe({
            next: (data: any[]) => {
                this.organes = data.map(org => ({ ...org, checked: false, numserie: org.numserie || '' }));
            },
            error: (err: any) => {
                this.organes = [];
            }
        });
    }

    saveEquipement() {
        const validEtats = ["En Service", "En panne", "En stock", "Réformé", "Prêt"];
        
        // Get form values
        const formValue = this.form.getRawValue();
        
        if (!formValue.design || !formValue.etat || !formValue.idType || !formValue.idCat || !formValue.idMarq) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        if (!validEtats.includes(formValue.etat)) {
            alert('L\'état doit être l\'une des valeurs suivantes : ' + validEtats.join(', '));
            return;
        }
        this.isLoading = true;

        // Create equipementData
        const equipementData: CreateEquipement = {
            design: formValue.design,
            etat: formValue.etat,
            idType: Number(formValue.idType),
            idCat: Number(formValue.idCat),
            idMarq: Number(formValue.idMarq),
            dateMiseService: formValue.dateMiseService ? new Date(formValue.dateMiseService) : undefined,
            anneeFabrication: formValue.anneeFabrication || undefined,
            dateAcquisition: formValue.dateAcquisition ? new Date(formValue.dateAcquisition) : undefined,
            valeurAcquisition: formValue.valeurAcquisition || undefined,
            idGrpIdq: formValue.idGrpIdq || undefined, // This will be handled by the backend
            idunite: undefined,
            numserie: formValue.numserie || 'INCONNU',
            position_physique: formValue.position_physique || 'INCONNU',
            observation: formValue.observation || 'INCONNU'
        };

        console.log('Données préparées pour l\'API:', equipementData);

        // Create equipment first
        this.equipementService.create(equipementData).subscribe({
            next: (createdEquipement) => {
                console.log('Équipement créé avec succès:', createdEquipement);
                
                // Handle characteristics
                const selectedCaracteristiques = this.caracteristiques
                    .filter(c => c.checked)
                    .map(c => ({ 
                        idcarac: c.id_caracteristique, 
                        valeur: c.valeur || '',
                        designation: c.libelle || '',
                        nomcarac: c.libelle || ''
                    }));
                
                console.log('Caractéristiques sélectionnées:', selectedCaracteristiques);

                // Handle organs
                console.log('=== PREPARING ORGANS ===');
                console.log('Raw organs data:', this.organes);
                console.log('Checked organs:', this.organes.filter(o => o.checked));
                
                const selectedOrganes = this.organes
                    .filter(o => o.checked)
                    .map(o => ({
                        idorg: o.id_organe,
                        numserie: o.numserie || ''
                    }));
                
                console.log('Final organs array to send:', selectedOrganes);

                // Create a promise chain to handle all operations
                let operationsChain = Promise.resolve();

                // Add characteristics if any are selected
                if (selectedCaracteristiques.length > 0) {
                    console.log('Ajout des caractéristiques...');
                    operationsChain = operationsChain.then(() => 
                        new Promise<void>((resolve, reject) => {
                            this.equipementService.bulkCreateCaracteristiqueEquipement({
                                ideqpt: createdEquipement.idEqpt,
                                caracteristiques: selectedCaracteristiques
                            }).subscribe({
                                next: () => {
                                    console.log('Caractéristiques ajoutées avec succès');
                                    resolve();
                                },
                                error: (error) => {
                                    console.error('Erreur lors de l\'ajout des caractéristiques:', error);
                                    reject(error);
                                }
                            });
                        })
                    );
                }

                // Add organs if any are selected
                if (selectedOrganes.length > 0) {
                    console.log('=== SENDING ORGANS TO API ===');
                    console.log('Equipment ID:', createdEquipement.idEqpt);
                    console.log('Number of organs to send:', selectedOrganes.length);
                    
                    const organeEquipementData: CreateOrganeEquipement = {
                        ideqpt: createdEquipement.idEqpt,
                        organes: selectedOrganes
                    };
                    
                    console.log('Sending data:', organeEquipementData);
                    
                    operationsChain = operationsChain.then(() => 
                        new Promise<void>((resolve, reject) => {
                            this.organeService.addOrganesToEquipement(organeEquipementData).subscribe({
                                next: (response) => {
                                    console.log('Organes ajoutés avec succès:', response);
                                    resolve();
                                },
                                error: (error) => {
                                    console.error('=== ORGAN ERROR IN COMPONENT ===');
                                    console.error('Error details:', error);
                                    console.error('Error status:', error.status);
                                    console.error('Error message:', error.message);
                                    console.error('Error response:', error.error);
                                    reject(error);
                                }
                            });
                        })
                    );
                }

                // Handle the completion of all operations
                operationsChain
                    .then(() => {
                        console.log('Toutes les opérations sont terminées avec succès');
                        this.loadEquipements();
                        this.closeForm();
                        this.isLoading = false;
                        const message = this.isEditMode ? 'Équipement modifié avec succès' : 'Équipement créé avec succès';
                        this.snackBar.open(message, 'Fermer', { duration: 3000 });
                    })
                    .catch((error) => {
                        console.error('Erreur lors des opérations:', error);
                        this.isLoading = false;
                        const errorMessage = this.isEditMode ? 'Erreur lors de la modification de l\'équipement' : 'Erreur lors de la création de l\'équipement';
                        this.snackBar.open(errorMessage, 'Fermer', { duration: 3000 });
                    });
            },
            error: (error) => {
                console.error('Erreur lors de la création de l\'équipement:', error);
                this.isLoading = false;
                this.snackBar.open('Erreur lors de la création de l\'équipement', 'Fermer', { duration: 3000 });
            }
        });
    }

    deleteEquipement(equipement: Equipement) {
        this.equipementToDelete = equipement;
        this.showDeleteConfirm = true;
    }

    confirmDelete() {
        if (this.equipementToDelete) {
            this.isLoading = true;
            this.equipementService.delete(this.equipementToDelete.idEqpt)
                .subscribe({
                    next: () => {
                        this.loadEquipements();
                        this.equipementToDelete = null;
                        this.showDeleteConfirm = false;
                        this.isLoading = false;
                    },
                    error: (error) => {
                        console.error('Error deleting equipement:', error);
                        this.isLoading = false;
                        this.snackBar.open('Erreur lors de la suppression de l\'équipement', 'Fermer', { duration: 3000 });
                    }
                });
        }
    }

    cancelDelete() {
        this.equipementToDelete = null;
        this.showDeleteConfirm = false;
    }

    onTypeChange() {
        // Optionally handle type change logic here
    }

    

    openAffectModal(eq: Equipement) {
        this.affectEquipement = eq;
        this.affectUnite = null;
        this.affectDate = '';
        this.affectDecision = 'INCONNU';
        this.affectOrdre = 'INCONNU';
        this.showAffectModal = true;
        this.loadUnites();
    }

    closeAffectModal() {
        this.showAffectModal = false;
        this.affectEquipement = null;
        this.affectUnite = null;
        this.affectDate = '';
        this.affectDecision = 'INCONNU';
        this.affectOrdre = 'INCONNU';
    }

    loadUnites() {
        this.http.get<any[]>(`${environment.apiUrl}/Unite?ascending=true`).subscribe({
            next: (data: any[]) => {
                this.unites = data;
                console.log('Loaded unites:', this.unites);
            },
            error: (error: any) => {
                console.error('Error loading unites:', error);
                this.snackBar.open('Erreur lors du chargement des unités', 'Fermer', { duration: 3000 });
            }
        });
    }

    submitAffectation() {
        if (!this.affectEquipement || !this.affectUnite || !this.affectDate) {
            this.snackBar.open('Veuillez remplir tous les champs obligatoires.', 'Fermer', { duration: 3000 });
            return;
        }
        this.isLoading = true;
        const affectationRequest: AffectationRequest = {
            ideqpt: this.affectEquipement.idEqpt,
            idunite: this.affectUnite,
            dateaffec: new Date(this.affectDate).toISOString().split('T')[0],
            num_decision_affectation: this.affectDecision || 'INCONNU',
            num_ordre: this.affectOrdre || 'INCONNU'
        };
        
        console.log('Sending affectation request:', affectationRequest);
        
        // First, try to verify the backend is accessible
        this.http.options(`${environment.apiUrl}/Affectation`).subscribe({
            next: () => {
                // If OPTIONS request succeeds, proceed with POST
                this.equipementService.postAffectation(affectationRequest).subscribe({
                    next: (response) => {
                        console.log('Affectation success:', response);
                        this.loadEquipements();
                        this.closeAffectModal();
                        this.isLoading = false;
                        this.snackBar.open('Affectation réussie', 'Fermer', { duration: 3000 });
                    },
                    error: (error) => {
                        console.error('Error during affectation:', error);
                        this.isLoading = false;
                        let errorMessage = 'Erreur lors de l\'affectation: ';
                        if (error.error?.message) {
                            errorMessage += error.error.message;
                        } else if (error.status === 0) {
                            errorMessage += 'Impossible de contacter le serveur';
                        } else {
                            errorMessage += 'Erreur inconnue';
                        }
                        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
                    }
                });
            },
            error: (error) => {
                console.error('CORS pre-flight check failed:', error);
                this.isLoading = false;
                this.snackBar.open('Erreur de connexion au serveur (CORS)', 'Fermer', { duration: 5000 });
            }
        });
    }

    loadEquipement(id: number) {
        this.equipementService.getById(id).subscribe({
            next: (data) => {
                this.form.patchValue({
                    idType: data.idType,
                    idCat: data.idCat,
                    idMarq: data.idMarq,
                    design: data.design,
                    idGrpIdq: data.idGrpIdq,
                    etat: data.etat,
                    numserie: data.numserie,
                    position_physique: data.position_physique,
                    dateMiseService: data.dateMiseService,
                    anneeFabrication: data.anneeFabrication,
                    dateAcquisition: data.dateAcquisition,
                    valeurAcquisition: data.valeurAcquisition,
                    idunite: data.idunite,
                    observation: data.observation
                });
                this.isEditMode = true;
                this.selectedId = id;
            },
            error: (error) => {
                console.error('Error loading equipment:', error);
                this.snackBar.open('Erreur lors du chargement de l\'équipement', 'Fermer', { duration: 3000 });
            }
        });
    }

    onSubmit() {
        if (this.form.valid) {
            this.isLoading = true;
            console.log('Form values:', this.form.value);
            console.log('Form validation status:', this.form.valid);
            console.log('Form errors:', this.getFormValidationErrors());

            // Validate etat
            const validEtats = ['operationnel', 'En panne', 'pre_reforme', 'reforme'];
            if (!validEtats.includes(this.form.get('etat')?.value)) {
                this.snackBar.open('État invalide. Les états valides sont: operationnel, En panne, pre_reforme, reforme', 'Fermer', { duration: 3000 });
                this.isLoading = false;
                return;
            }

            // Format dates
            const formatDate = (date: string | Date | null | undefined): Date | undefined => {
                if (!date) return undefined;
                const d = new Date(date);
                return isNaN(d.getTime()) ? undefined : d;
            };

            // Prepare equipment data
            const equipementData = {
                idType: Number(this.form.get('idType')?.value),
                idCat: Number(this.form.get('idCat')?.value),
                idMarq: Number(this.form.get('idMarq')?.value),
                design: this.form.get('design')?.value,
                observation: this.form.get('observation')?.value,
                idGrpIdq: this.form.get('idGrpIdq')?.value ? Number(this.form.get('idGrpIdq')?.value) : undefined,
                etat: this.form.get('etat')?.value,
                numserie: this.form.get('numserie')?.value,
                position_physique: this.form.get('position_physique')?.value,
                dateMiseService: formatDate(this.form.get('dateMiseService')?.value),
                anneeFabrication: this.form.get('anneeFabrication')?.value ? Number(this.form.get('anneeFabrication')?.value) : undefined,
                dateAcquisition: formatDate(this.form.get('dateAcquisition')?.value),
                valeurAcquisition: this.form.get('valeurAcquisition')?.value ? Number(this.form.get('valeurAcquisition')?.value) : undefined,
                idunite: this.isEditMode ? undefined : (this.form.get('idunite')?.value ? Number(this.form.get('idunite')?.value) : undefined)
            };

            console.log('Données préparées pour l\'API:', equipementData);

            if (this.isEditMode && this.selectedId) {
                // Update existing equipment
                console.log('Updating equipment with ID:', this.selectedId);
                this.equipementService.update(this.selectedId, equipementData).subscribe({
                    next: async (updatedEquipement) => {
                        console.log('Équipement modifié avec succès:', updatedEquipement);
                        
                        try {
                            // Get the original caracteristiques and organes
                            const originalCaracs = await this.equipementService.getCaracteristiquesForEquipement(this.selectedId!).toPromise();
                            const originalOrgs = await this.equipementService.getOrganesForEquipement(this.selectedId!).toPromise();

                            // Handle organes
                            const modifiedOrganes = this.organes.filter(o => o.checked && o.numserie && o.id_organe);
                            console.log('Processing organes:', modifiedOrganes);
                            
                            // Handle organes to add (new ones)
                            const newOrganes = modifiedOrganes.filter(o => 
                                !originalOrgs?.some(orig => orig.idorg === o.id_organe)
                            );
                            
                            // Handle organes to modify (existing ones)
                            const existingOrganes = modifiedOrganes.filter(o => 
                                originalOrgs?.some(orig => orig.idorg === o.id_organe)
                            );
                            
                            // Handle organes to delete (unchecked ones)
                            const organesToDelete = originalOrgs?.filter(orig => 
                                !modifiedOrganes.some(o => o.id_organe === orig.idorg)
                            ) || [];

                            console.log('New organes to add:', newOrganes);
                            console.log('Existing organes to modify:', existingOrganes);
                            console.log('Organes to delete:', organesToDelete);

                            // Delete unchecked organes first
                            for (const org of organesToDelete) {
                                try {
                                    console.log('Deleting organe:', org);
                                    await this.equipementService.deleteOrganeFromEquipement({
                                        ideqpt: this.selectedId!,
                                        idorg: org.idorg
                                    }).toPromise();
                                    console.log('Successfully deleted organe:', org.idorg);
                                } catch (error) {
                                    console.error('Error deleting organe:', org.idorg, error);
                                    throw error;
                                }
                            }

                            // Add new organes
                            for (const org of newOrganes) {
                                if (!org.id_organe) continue;
                                const organeData = {
                                    ideqpt: this.selectedId!,
                                    idorg: org.id_organe,
                                    numsérie: org.numserie!
                                };
                                console.log('Adding new organe:', organeData);
                                await this.equipementService.addOrganeToEquipement(organeData).toPromise();
                            }

                            // Modify existing organes
                            for (const org of existingOrganes) {
                                if (!org.id_organe) continue;
                                const organeData = {
                                    ideqpt: this.selectedId!,
                                    idorg: org.id_organe,
                                    numsérie: org.numserie!
                                };
                                console.log('Modifying organe:', organeData);
                                await this.equipementService.modifyOrganeEquipement(organeData).toPromise();
                            }

                            // Handle caracteristiques
                            const modifiedCaracteristiques = this.caracteristiques.filter(c => c.checked && c.valeur && c.id_caracteristique);
                            console.log('Processing caracteristiques:', modifiedCaracteristiques);
                            
                            // Handle caracteristiques to add (new ones)
                            const newCaracs = modifiedCaracteristiques.filter(c => 
                                !originalCaracs?.some(orig => orig.idcarac === c.id_caracteristique)
                            );
                            
                            // Handle caracteristiques to modify (existing ones)
                            const existingCaracs = modifiedCaracteristiques.filter(c => 
                                originalCaracs?.some(orig => orig.idcarac === c.id_caracteristique)
                            );
                            
                            // Handle caracteristiques to delete (unchecked ones)
                            const caracsToDelete = originalCaracs?.filter(orig => 
                                !modifiedCaracteristiques.some(c => c.id_caracteristique === orig.idcarac)
                            ) || [];

                            console.log('New caracteristiques to add:', newCaracs);
                            console.log('Existing caracteristiques to modify:', existingCaracs);
                            console.log('Caracteristiques to delete:', caracsToDelete);

                            // Delete unchecked caracteristiques first
                            for (const carac of caracsToDelete) {
                                try {
                                    console.log('Deleting caracteristique:', carac);
                                    await this.equipementService.deleteCaracteristiqueFromEquipement({
                                        ideqpt: this.selectedId!,
                                        idcarac: carac.idcarac
                                    }).toPromise();
                                    console.log('Successfully deleted caracteristique:', carac.idcarac);
                                } catch (error) {
                                    console.error('Error deleting caracteristique:', carac.idcarac, error);
                                    throw error;
                                }
                            }

                            // Add new caracteristiques
                            for (const carac of newCaracs) {
                                if (!carac.id_caracteristique) continue;
                                const caracData = {
                                    ideqpt: this.selectedId!,
                                    idcarac: carac.id_caracteristique,
                                    valeur: carac.valeur!
                                };
                                console.log('Adding new caracteristique:', caracData);
                                await this.equipementService.addCaracteristiqueToEquipement(caracData).toPromise();
                            }

                            // Modify existing caracteristiques
                            for (const carac of existingCaracs) {
                                if (!carac.id_caracteristique) continue;
                                const caracData = {
                                    ideqpt: this.selectedId!,
                                    idcarac: carac.id_caracteristique,
                                    valeur: carac.valeur!
                                };
                                console.log('Modifying caracteristique:', caracData);
                                await this.equipementService.modifyCaracteristiqueEquipement(caracData).toPromise();
                            }

                            this.loadEquipements();
                            this.closeForm();
                            this.isLoading = false;
                            this.snackBar.open('Équipement modifié avec succès', 'Fermer', { duration: 3000 });
                        } catch (error) {
                            console.error('Erreur lors des opérations:', error);
                            this.isLoading = false;
                            this.snackBar.open('Erreur lors de la modification de l\'équipement', 'Fermer', { duration: 3000 });
                        }
                    },
                    error: (error) => {
                        console.error('Erreur lors de la modification de l\'équipement:', error);
                        this.isLoading = false;
                        this.snackBar.open('Erreur lors de la modification de l\'équipement', 'Fermer', { duration: 3000 });
                    }
                });
            } else {
                // Create new equipment
                console.log('Creating new equipment');
                this.equipementService.create(equipementData).subscribe({
                    next: (createdEquipement) => {
                        console.log('Équipement créé avec succès:', createdEquipement);
                        
                        // Handle characteristics and organs for new equipment
                        const selectedCaracteristiques = this.caracteristiques
                            .filter(c => c.checked && c.valeur) // Only include if checked and has a value
                            .map(c => ({ 
                                idcarac: c.id_caracteristique, 
                                valeur: c.valeur || '',
                                designation: c.libelle || '',
                                nomcarac: c.libelle || ''
                            }));

                        const selectedOrganes = this.organes
                            .filter(o => o.checked && o.numserie) // Only include if checked and has a numserie
                            .map(o => ({
                                idorg: o.id_organe,
                                numserie: o.numserie || ''
                            }));

                        console.log('Selected caracteristiques to add:', selectedCaracteristiques);
                        console.log('Selected organes to add:', selectedOrganes);

                        // Create a promise chain to handle all operations
                        let operationsChain = Promise.resolve();

                        // Add characteristics if any are selected
                        if (selectedCaracteristiques.length > 0) {
                            operationsChain = operationsChain.then(() => 
                                new Promise<void>((resolve, reject) => {
                                    const caracteristiqueData = {
                                        ideqpt: createdEquipement.idEqpt,
                                        caracteristiques: selectedCaracteristiques
                                    };
                                    console.log('Sending caracteristiques data:', caracteristiqueData);
                                    
                                    this.equipementService.bulkCreateCaracteristiqueEquipement(caracteristiqueData).subscribe({
                                        next: (response) => {
                                            console.log('Caractéristiques ajoutées avec succès:', response);
                                            resolve();
                                        },
                                        error: (error) => {
                                            console.error('Erreur lors de l\'ajout des caractéristiques:', error);
                                            reject(error);
                                        }
                                    });
                                })
                            );
                        }

                        // Add organs if any are selected
                        if (selectedOrganes.length > 0) {
                            operationsChain = operationsChain.then(() => 
                                new Promise<void>((resolve, reject) => {
                                    const organeEquipementData: CreateOrganeEquipement = {
                                        ideqpt: createdEquipement.idEqpt,
                                        organes: selectedOrganes
                                    };
                                    
                                    console.log('Sending organes data:', organeEquipementData);
                                    
                                    this.organeService.addOrganesToEquipement(organeEquipementData).subscribe({
                                        next: (response) => {
                                            console.log('Organes ajoutés avec succès:', response);
                                            resolve();
                                        },
                                        error: (error) => {
                                            console.error('Erreur lors de l\'ajout des organes:', error);
                                            reject(error);
                                        }
                                    });
                                })
                            );
                        }

                        // Handle the completion of all operations
                        operationsChain
                            .then(() => {
                                console.log('Toutes les opérations sont terminées avec succès');
                                this.loadEquipements();
                                this.closeForm();
                                this.isLoading = false;
                                this.snackBar.open('Équipement créé avec succès', 'Fermer', { duration: 3000 });
                            })
                            .catch((error) => {
                                console.error('Erreur lors des opérations:', error);
                                this.isLoading = false;
                                this.snackBar.open('Erreur lors de la création de l\'équipement', 'Fermer', { duration: 3000 });
                            });
                    },
                    error: (error) => {
                        console.error('Erreur lors de la création de l\'équipement:', error);
                        this.isLoading = false;
                        this.snackBar.open('Erreur lors de la création de l\'équipement', 'Fermer', { duration: 3000 });
                    }
                });
            }
        } else {
            console.log('Form validation errors:', this.getFormValidationErrors());
            this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 3000 });
        }
    }

    // Nouvelle méthode pour obtenir les erreurs de validation détaillées
    private getFormValidationErrors() {
        const errors: any = {};
        Object.keys(this.form.controls).forEach(key => {
            const controlErrors = this.form.get(key)?.errors;
            if (controlErrors != null) {
                errors[key] = controlErrors;
            }
        });
        return errors;
    }

    resetForm() {
        this.form.reset();
        this.isEditMode = false;
        this.selectedId = null;
    }

    loadGroupesIdentiques() {
        this.http.get<any[]>(`${environment.apiUrl}/GroupeIdentique`).subscribe({
            next: (data) => {
                this.groupesIdentiques = data;
            },
            error: (error) => {
                console.error('Error loading groupes identiques:', error);
                this.snackBar.open('Erreur lors du chargement des groupes identiques', 'Fermer', { duration: 3000 });
            }
        });
    }

    getStatusClass(etat: string | undefined): string {
        if (!etat) return '';
        
        switch (etat.toLowerCase()) {
            case 'operationnel':
                return 'status-operationnel';
            case 'en panne':
                return 'status-en-panne';
            case 'reforme':
                return 'status-reforme';
            case 'pre_reforme':
                return 'status-pre-reforme';
            default:
                return '';
        }
    }

    getTypeDesignation(typeId: number): string {
        const type = this.types.find(t => t.idtypequip === typeId);
        return type?.designation || '';
    }

    getMarqueNom(marqueId: number): string {
        const marque = this.marques.find(m => m.idmarque === marqueId);
        return marque?.nom_fabriquant || '';
    }

    updateOrganeNumserie(ideqpt: number, idorg: number, numserie: string) {
        console.log(`Updating organe ${idorg} for equipment ${ideqpt} with numserie ${numserie}`);
        return this.http.post(`${environment.apiUrl}/OrganeEquipement`, {
            ideqpt: ideqpt,
            idorg: idorg,
            numserie: numserie
        }).toPromise();
    }

    updateCaracteristiqueValeur(ideqpt: number, idcarac: number, valeur: string) {
        console.log(`Updating caracteristique ${idcarac} for equipment ${ideqpt} with valeur ${valeur}`);
        return this.http.post(`${environment.apiUrl}/CaracteristiqueEquipement`, {
            ideqpt: ideqpt,
            idcarac: idcarac,
            valeur: valeur
        }).toPromise();
    }

    // Add these new methods
    private reloadCaracteristiques(ideqpt: number) {
        return this.equipementService.getCaracteristiquesForEquipement(ideqpt).toPromise()
            .then(caracs => {
                if (caracs) {
                    this.caracteristiques = caracs.map(c => ({
                        ...c,
                        checked: true,
                        valeur: c.valeur || ''
                    }));
                    console.log('Reloaded caracteristiques:', this.caracteristiques);
                } else {
                    console.warn('No caracteristiques returned from API');
                    this.caracteristiques = [];
                }
            })
            .catch(error => {
                console.error('Error reloading caracteristiques:', error);
                this.caracteristiques = [];
            });
    }

    private reloadOrganes(ideqpt: number) {
        return this.equipementService.getOrganesForEquipement(ideqpt).toPromise()
            .then(orgs => {
                if (orgs) {
                    this.organes = orgs.map(o => ({
                        ...o,
                        checked: true,
                        numserie: o.numserie || ''
                    }));
                    console.log('Reloaded organes:', this.organes);
                } else {
                    console.warn('No organes returned from API');
                    this.organes = [];
                }
            })
            .catch(error => {
                console.error('Error reloading organes:', error);
                this.organes = [];
            });
    }
      get isAdminIT(): boolean {
    return this.role === 'Admin IT';
  }

  get isAdminMetier(): boolean {
    return this.role === 'Admin Métier';
  }
  get isResponsableUnite(): boolean { 
    return this.role === 'Responsable Unité';
   
  }
    logout() {
    this.showLogoutConfirm = true;
  }

  confirmLogout() {
    this.showLogoutConfirm = false;
    window.location.href = "/login";
  }

  cancelLogout() {
    this.showLogoutConfirm = false;
  }
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
  navigateToUserManagement(): void {
    this.router.navigate(['/user-management']);
  } 
} 