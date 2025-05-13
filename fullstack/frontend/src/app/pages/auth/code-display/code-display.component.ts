import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-code-display',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './code-display.component.html',
    styleUrls: ['./code-display.component.css']
})
export class CodeDisplayComponent implements OnInit {
    code: string | null = null;
    companyName: string | null = null;
    nit: string | null = null;
    address: string | null = null;
    location: string | null = null;
    phoneNumber: string | null = null;
    email: string | null = null;
    contactName: string | null = null;

    private route = inject(ActivatedRoute);
    private router = inject(Router);

    constructor() { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.code = params['code'];
            this.companyName = params['companyName'];
            this.nit = params['nit'];
            this.address = params['address'];
            this.location = params['location'];
            this.phoneNumber = params['phoneNumber'];
            this.email = params['email'];
            this.contactName = params['contactName'];
        });
    }

    navigateToLoginCliente() {
        this.router.navigate(['/login-cliente']);
    }
}