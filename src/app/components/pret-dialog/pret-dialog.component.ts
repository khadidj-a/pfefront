import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PretService } from '../../services/pret.service';

@Component({
  selector: 'app-pret-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pret-dialog.component.html',
  styleUrls: ['./pret-dialog.component.scss']
})
export class PretDialogComponent implements OnInit {
  pret: any = {
    ideqpt: 0,
    idunite: 0,
    duree: 0,
    datepret: ''
  };
  mode: 'add' | 'edit';

  constructor(
    public dialogRef: MatDialogRef<PretDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private pretService: PretService
  ) {
    this.mode = data.mode;
    if (data.pret) {
      this.pret = { ...data.pret };
    }
  }

  ngOnInit(): void {}

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close(this.pret);
  }
}
