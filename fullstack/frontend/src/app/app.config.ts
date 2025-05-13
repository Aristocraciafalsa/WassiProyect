import { ApplicationConfig, importProvidersFrom } from '@angular/core';

import { provideRouter, Routes, withComponentInputBinding } from '@angular/router';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { provideClientHydration } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';



// Importa tus componentes CRUD existentes

import { CreateComponent } from './pages/create/create.component';

import { EditComponent } from './pages/edit/edit.component';

import { ShowComponent } from './pages/show/show.component';



// Componentes de autenticación

import { ClienteLoginComponent } from './pages/auth/cliente-login/cliente-login.component';

import { AdminOperarioLoginComponent } from './pages/auth/admin-operario-login/admin-operario-login.component';

import { RegisterComponent } from './pages/auth/register/register.component';

import { CodeDisplayComponent } from './pages/auth/code-display/code-display.component';

import { ClientDashboardComponent } from './pages/auth/client-dashboard/client-dashboard.component';

import { ConfirmacionPedidoComponent } from './pages/auth/confirmacion-pedido/confirmacion-pedido.component';

import { AdminDashboardComponent } from './pages/auth/admin-dashboard/admin-dashboard.component';

import { OperarioDashboardComponent } from './pages/auth/operario-dashboard/operario-dashboard.component';

import { DetallePedidoComponent } from './detalle-pedido/detalle-pedido.component'; // Importa el componente de detalle de pedido



// Guardia de autenticación

import { AuthGuard } from './guards/auth.guard';

import { authInterceptor } from './interceptors/auth.interceptor';



const routes: Routes = [

    // Rutas públicas

    { path: 'login-cliente', component: ClienteLoginComponent },

    { path: 'login-admin-operario', component: AdminOperarioLoginComponent },

    { path: 'register', component: RegisterComponent },

    { path: 'code-display', component: CodeDisplayComponent },



    // Rutas protegidas - ¡ORDEN IMPORTANTE!

    {

        path: 'admin-dashboard/pedido/:id',

        loadComponent: () => import('./detalle-pedido/detalle-pedido.component').then(m => m.DetallePedidoComponent),

        canActivate: [AuthGuard],

        data: { roles: ['administrator'] }

    },

    {

        path: 'admin-dashboard',

        loadComponent: () => import('./pages/auth/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),

        canActivate: [AuthGuard],

        data: { roles: ['administrator'] }

    },

    {

        path: 'operario-dashboard',

        loadComponent: () => import('./pages/auth/operario-dashboard/operario-dashboard.component').then(m => m.OperarioDashboardComponent),

        canActivate: [AuthGuard],

        data: { roles: ['operator'] }

    },

    {

        path: 'client-dashboard',

        loadComponent: () => import('./pages/auth/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),

        canActivate: [AuthGuard],

        data: { roles: ['client'] }

    },

    {

        path: 'confirmacion-pedido',

        loadComponent: () => import('./pages/auth/confirmacion-pedido/confirmacion-pedido.component').then(m => m.ConfirmacionPedidoComponent),

        canActivate: [AuthGuard],

        data: { roles: ['client'] }

    },

    {

        path: '',

        component: ShowComponent,

        canActivate: [AuthGuard],

        data: { roles: ['administrator', 'operator'] }

    },

    {

        path: 'create',

        loadComponent: () => import('./pages/create/create.component').then(m => m.CreateComponent),

        canActivate: [AuthGuard],

        data: { roles: ['administrator'] }

    },

    {

        path: 'update/:id',

        loadComponent: () => import('./pages/edit/edit.component').then(m => m.EditComponent),

        canActivate: [AuthGuard],

        data: { roles: ['administrator'] }

    },



    // Redirecciones

    { path: '**', redirectTo: 'login-cliente' }

];



export const appConfig: ApplicationConfig = {

    providers: [

        provideRouter(routes, withComponentInputBinding()),

        provideClientHydration(),

        provideHttpClient(

            withFetch(),

            withInterceptors([authInterceptor]) // Usa la función interceptor

        ),

        importProvidersFrom(FormsModule),

        AuthGuard

    ]

};