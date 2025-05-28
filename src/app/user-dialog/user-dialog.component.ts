import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
  user: any;
  mode: 'add' | 'edit';
  unites: any[] = [];

  // ✅ Regex HTML-compatible pour attribut [pattern]
  emailPattern: string = "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,4}";
  numTelPattern: string = "[0-9]{10}";

  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService
  ) {
    this.user = { ...data.user };
    this.mode = data.mode;
  }

  ngOnInit(): void {
    this.loadUnites();
  }

  loadUnites() {
    this.userService.getUnites().subscribe({
      next: (data) => this.unites = data,
      error: () => console.error('Erreur de chargement des unités')
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close(this.user);
  }
}
