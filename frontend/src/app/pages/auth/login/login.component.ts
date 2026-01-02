import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    loading = false;
    error = '';
    returnUrl = '/dashboard';
    showPassword = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        // Redirect if already logged in
        if (this.authService.isLoggedIn) {
            this.router.navigate(['/dashboard']);
            return;
        }

        this.loginForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(3)]]
        });

        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    }

    get f() {
        return this.loginForm.controls;
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.error = '';

        this.authService.login({
            username: this.f['username'].value,
            password: this.f['password'].value
        }).subscribe({
            next: () => {
                this.router.navigate([this.returnUrl]);
            },
            error: (err) => {
                this.error = err.error?.message || 'Identifiants incorrects';
                this.loading = false;
            }
        });
    }

    togglePassword(): void {
        this.showPassword = !this.showPassword;
    }
}
