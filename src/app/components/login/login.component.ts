import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from './../../services/user.service';
import { RequestsAuthService } from './../../services/requests/requests-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
        <h2>Login</h2>
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            [(ngModel)]="loginData.email" 
            required 
            email
            #email="ngModel">
          <div *ngIf="email.invalid && (email.dirty || email.touched)" class="error-message">
            Please enter a valid email address
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            [(ngModel)]="loginData.password" 
            required
            #password="ngModel">
          <div *ngIf="password.invalid && (password.dirty || password.touched)" class="error-message">
            Password is required
          </div>
        </div>

        <button type="submit" [disabled]="loginForm.invalid">Login</button>
      </form>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    form {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #666;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    input:focus {
      outline: none;
      border-color: #007bff;
    }

    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
  `]
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };

  constructor(
    private userService: UserService,
    private authService: RequestsAuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.loginData.email && this.loginData.password) {
      this.authService.login(this.loginData).subscribe({
        next: async(response) => {
          await this.userService.setUserFromDatabase();
          this.router.navigate(['/admin']);
        },
        error: (error) => {
          console.error('Login failed:', error);
        }
      });
    }
  }
} 