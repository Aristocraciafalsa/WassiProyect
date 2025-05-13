import { Component, inject, OnInit } from '@angular/core';

import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../../../services/auth.service';

import { CommonModule } from '@angular/common';

import { Router, RouterModule } from '@angular/router'; // ¡Importamos RouterModule!



type UserRole = 'client' | 'administrator' | 'operator';



@Component({

    standalone: true,

    imports: [ReactiveFormsModule, CommonModule, RouterModule], // ¡Añadimos RouterModule a los imports!

    templateUrl: './register.component.html',

    styleUrls: ['./register.component.css']

})

export class RegisterComponent implements OnInit { // Implementamos OnInit

    private fb = inject(FormBuilder);

    private authService = inject(AuthService);

    private router = inject(Router);



    registerForm = this.fb.group({

        role: ['client' as UserRole, Validators.required],

        email: ['', [Validators.required, Validators.email]],

        password: ['', [Validators.minLength(8)]],

        companyName: [''],

        nit: [''],

        address: [''],

        location: [''],

        phoneNumber: [''],

        contactName: ['']

    });



    get isClient() {

        return this.registerForm.get('role')?.value === 'client';

    }



    ngOnInit(): void { // Usamos ngOnInit para suscribirnos a los cambios

        this.registerForm.get('role')?.valueChanges.subscribe(() => {

            this.onRoleChange();

        });



        // También podemos suscribirnos a los cambios de otros campos si es necesario

        this.registerForm.valueChanges.subscribe(() => {

            // Podemos agregar lógica adicional aquí si queremos reaccionar a otros cambios

        });



        this.onRoleChange(); // Llamada inicial para establecer las validaciones según el rol inicial

    }



    onRoleChange() {

        if (this.isClient) {

            // Habilita todos los campos para cliente

            this.registerForm.get('email')?.enable();

            this.registerForm.get('password')?.enable();



            // Establece validadores requeridos

            const requiredFields = [

                'companyName', 'nit', 'address', 'location',

                'phoneNumber', 'contactName', 'email'

            ];



            requiredFields.forEach(field => {

                this.registerForm.get(field)?.setValidators(Validators.required);

                this.registerForm.get(field)?.updateValueAndValidity();

            });

        } else {

            // Campos requeridos para admin/operador

            this.registerForm.get('email')?.setValidators([Validators.required, Validators.email]);

            this.registerForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);



            // Limpia validadores de campos de cliente

            const clientFields = [

                'companyName', 'nit', 'address',

                'location', 'phoneNumber', 'contactName'

            ];



            clientFields.forEach(field => {

                this.registerForm.get(field)?.clearValidators();

                this.registerForm.get(field)?.updateValueAndValidity();

            });

        }

    }



    onSubmit() {

        if (this.registerForm.invalid) {

            this.markAllAsTouched();

            return;

        }



        const formData = this.prepareFormData();



        this.authService.register(formData).subscribe({

            next: (response) => this.handleSuccess(response, formData),

            error: (err) => this.handleError(err)

        });

    }



    private prepareFormData(): any {

        const value = this.registerForm.value;

        return {

            role: value.role,

            email: value.email,

            ...(this.isClient ? {

                companyName: value.companyName,

                nit: value.nit,

                address: value.address,

                location: value.location,

                phoneNumber: value.phoneNumber,

                contactName: value.contactName

            } : {

                password: value.password

            })

        };

    }



    private handleSuccess(response: any, formData: any): void {

        alert('Usuario registrado exitosamente!');

        if (response.user?.role === 'client') {

            this.router.navigate(['/code-display'], {

                queryParams: {

                    code: response.user.code,

                    formData: JSON.stringify(formData)

                }

            });

        } else {

            this.router.navigate(['/login-admin-operario']);

        }

    }



    private handleError(err: any): void {

        const errorMessage = err.error?.message || err.message || 'Error al registrar usuario';

        alert(errorMessage);

    }



    private markAllAsTouched(): void {

        Object.values(this.registerForm.controls).forEach(control => {

            control.markAsTouched();

        });

    }

}