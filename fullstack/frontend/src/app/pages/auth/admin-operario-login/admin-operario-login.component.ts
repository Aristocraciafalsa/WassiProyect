import { Component, OnInit, inject } from '@angular/core';

import { FormsModule, NgForm } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { AuthService } from '../../../services/auth.service';

import { Router, RouterModule } from '@angular/router'; // ¡Importamos RouterModule!



@Component({

 standalone: true,

imports: [FormsModule, CommonModule, RouterModule], // ¡Añadimos RouterModule a los imports!
templateUrl: './admin-operario-login.component.html',
 styleUrls: ['./admin-operario-login.component.css']

})

export class AdminOperarioLoginComponent implements OnInit {

 email: string = '';

 password: string = '';

 error: string = '';

loading: boolean = false;

submitted: boolean = false;



 private authService = inject(AuthService);

 private router = inject(Router);



constructor() { }



 ngOnInit(): void {

}



 login(form: NgForm) {
 this.submitted = true;



if (form.invalid) {

this.error = 'Por favor complete todos los campos';
return;

 }


 this.loading = true;

 this.error = '';



 this.authService.loginAdminOperario(this.email, this.password).subscribe({

 next: (response: any) => {
 console.log('Respuesta del login:', response);

 this.authService.handleAuthResponse(response);



 console.log('Datos de autenticación guardados:', this.authService.getAuthData());

console.log('Token guardado en localStorage:', localStorage.getItem('auth_data'));


if (response && response.user && response.user.role) {
const redirect = response.user.role === 'administrator'

? '/admin-dashboard'

 : '/operario-dashboard';

 console.log('Redireccionando a:', redirect);

 this.router.navigate([redirect]);

} else {

console.error('Error: No se recibió el rol del usuario en la respuesta.', response);

 this.error = 'Error al iniciar sesión. No se pudo determinar el rol del usuario.';

}

this.loading = false;

 },

 error: (err) => {

this.error = err.message || 'Error en el inicio de sesión';

this.loading = false;

}

 });

 }

}