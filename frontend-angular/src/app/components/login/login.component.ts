import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
//import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true, // <--- Verifica que esto diga true
  imports: [ReactiveFormsModule, CommonModule], // <--- ¡ESTA ES LA CLAVE!
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
  if (this.loginForm.valid) {
    this.authService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
      next: (res) => {
        console.log('Login exitoso, redirigiendo...');
        this.router.navigate(['/escanear']); // Verifica que el nombre coincida con app.routes.ts
      },
      error: (err) => {
        this.error = 'Credenciales inválidas';
      }
    });
  }
}
}