import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    registerForm!: FormGroup;
    loading = false;
    error = '';
    success = '';
    step = 1;

    cvFile: File | null = null;
    diplomeFile: File | null = null;
    lettreFile: File | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        if (this.authService.isLoggedIn) {
            this.router.navigate(['/dashboard']);
            return;
        }

        this.registerForm = this.fb.group({
            // Step 1: Personal Info
            nom: ['', [Validators.required, Validators.minLength(2)]],
            prenom: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            telephone: [''],

            // Step 2: Credentials
            matricule: ['', [Validators.required, Validators.minLength(4)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, {
            validators: this.passwordMatchValidator
        });
    }

    get f() {
        return this.registerForm.controls;
    }

    passwordMatchValidator(form: FormGroup) {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
        } else {
            confirmPassword?.setErrors(null);
        }
        return null;
    }

    nextStep(): void {
        if (this.step === 1) {
            if (this.f['nom'].valid && this.f['prenom'].valid && this.f['email'].valid) {
                this.step = 2;
            }
        } else if (this.step === 2) {
            if (this.f['matricule'].valid && this.f['password'].valid && this.f['confirmPassword'].valid) {
                this.step = 3;
            }
        }
    }

    prevStep(): void {
        if (this.step > 1) {
            this.step--;
        }
    }

    onFileChange(event: any, type: string): void {
        const file = event.target.files[0];
        if (file) {
            switch (type) {
                case 'cv':
                    this.cvFile = file;
                    break;
                case 'diplome':
                    this.diplomeFile = file;
                    break;
                case 'lettre':
                    this.lettreFile = file;
                    break;
            }
        }
    }

    onSubmit(): void {
        if (this.registerForm.invalid || !this.cvFile || !this.diplomeFile) {
            this.error = 'Veuillez remplir tous les champs obligatoires et télécharger les documents requis.';
            return;
        }

        this.loading = true;
        this.error = '';

        const request = {
            matricule: this.f['matricule'].value,
            password: this.f['password'].value,
            email: this.f['email'].value,
            nom: this.f['nom'].value,
            prenom: this.f['prenom'].value,
            telephone: this.f['telephone'].value
        };

        this.authService.registerWithFiles(request, this.cvFile, this.diplomeFile, this.lettreFile ?? undefined).subscribe({
            next: (response) => {
                this.success = 'Inscription réussie ! Votre candidature est en cours de traitement.';
                this.loading = false;
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 3000);
            },
            error: (err) => {
                this.error = err.error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
                this.loading = false;
            }
        });
    }
}
