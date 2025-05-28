import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { NgIf } from "@angular/common"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-unauthorized",
  standalone: true,
  imports: [NgIf],
  templateUrl: "./unauthorized.component.html",
  styleUrls: ["./unauthorized.component.css"],
})
export class UnauthorizedComponent {
  userRole = ""

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      this.userRole = currentUser.role
    }
  }

  goBack(): void {
    this.router.navigate(["/"])
  }
}
