import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CrudService } from './services/crud.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FontAwesomeModule], // Elimina HttpClientModule
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(private crudService: CrudService) {}

  ngOnInit(): void {
    this.crudService.getProducts().subscribe((res) => {
      console.log(res);
    });
  }
}