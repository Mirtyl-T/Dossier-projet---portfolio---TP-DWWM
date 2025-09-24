import { Component } from '@angular/core';
import { BurgerMenuComponent } from '../../shared/burger-menu/burger-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [BurgerMenuComponent], // Ajoutez cette ligne
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

}
