import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCirclePlus, faPen, faTrash} from '@fortawesome/free-solid-svg-icons';
import { Product } from '../../models/product.model';
import { CrudService } from '../../services/crud.service';
import { NgFor } from '@angular/common'; 
import { AlertifyService } from '../../services/alertify.service';

@Component({
  selector: 'app-show',
  standalone: true,
  imports: [RouterLink, FaIconComponent,NgFor], // <-- Añade NgFor aquí
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.css']
})
export class ShowComponent implements OnInit {
  faCirclePlus = faCirclePlus
  faPen = faPen
  faTrash = faTrash
  products: Product[] = [];

  constructor(
    private crudService: CrudService,
    private   alertifyService:AlertifyService
  ) {}

  ngOnInit(): void {
    this.crudService.getProducts().subscribe((res: Product[]) => {
      this.products = res;
    })
  }
  delete(id:any, index:any){

    this.alertifyService.confirm({
      message:"Are you sure to delete the Product?",
      callback_delete: ()=>{
        this.crudService.deleteProduct(id).subscribe((res)=>{
          this.products.splice(index,1)
        });

      },
    });
  }
}