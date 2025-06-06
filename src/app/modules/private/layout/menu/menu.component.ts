import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { MenuUsuario } from '../../../../apis/model/module/private/administrativo/opcion/response/menu-usuario';
import { environment } from '../../../../../environments/environment';
import { Modulo } from '../../../../apis/model/module/private/administrativo/modulo/response/modulo';
import { Menu } from '../../../../apis/model/module/private/administrativo/opcion/response/menu';
import { MenuService } from '../../../../service/modules/private/administrativo/usuario/menu.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule,
    RouterModule,
    ...PRIME_NG_MODULES],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MenuService],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit {
  items: MenuItem[] = []; 
  public nombreEmpresa?: string;
  listaModulos: Modulo[]= [];
  listaPadres: Menu[] = []
  listaOpciones: Menu[] = [];

  constructor(private readonly menuService: MenuService) {
    if(typeof window !== 'undefined'  && typeof window.sessionStorage !== 'undefined') {
      if (sessionStorage.getItem(environment.session.NOMBRE_EMPRESA) != undefined) {
        this.nombreEmpresa = sessionStorage.getItem(environment.session.NOMBRE_EMPRESA)!;
      } 
    } else {
      this.nombreEmpresa = "Administrador";
    }
  }

  ngOnInit() {
    if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
      const user = sessionStorage.getItem(environment.session.USERNAME);
      const menuItemsString = sessionStorage.getItem(environment.session.MENU_ITEMS);
  
      if (menuItemsString) {
        this.items = JSON.parse(menuItemsString) as MenuItem[];
      } else if (user) {
        this.menuService.getMenuUsuarios(user).subscribe(response => {
          const menuUsuario = response as MenuUsuario;
          this.items = this.cargarMenu(menuUsuario);
        });
      }
    }
  }

  cargarMenu(menuUsuario: MenuUsuario): MenuItem[] {
    this.listaModulos = menuUsuario.listModulo;
    this.listaPadres = menuUsuario.listOpcionPadres;
    this.listaOpciones = menuUsuario.listOpcionBase;

    return this.convertirModulosAMenuItems(this.listaModulos);

  }

  convertirModulosAMenuItems(modulos: Modulo[]): MenuItem[] {

    let menuItems = modulos.map(modulo => {
        return {
            key: modulo.codigo.toString(), // Asignar codigo a key como string
            label: modulo.nombreModulo,    // Asignar nombreModulo a label
            icon: modulo.icono,            // Asignar icono a icon
            items: this.convertirOpcionesPadreAMenuItems(this.listaPadres, modulo.codigo)
        };
    });
    return menuItems;
  }

  convertirOpcionesPadreAMenuItems(opcionesPadre: Menu[], codigoModulo: number): MenuItem[] {
    let menuItems = opcionesPadre
          .filter(menu => menu.modulo.codigo === codigoModulo)
          .map(menu => {
              return {
                key: menu.codigo.toString(), // Asignar codigo a key como string
                label: menu.descripcionOpcion,    // Asignar nombreModulo a label
                icon: menu.icono,            // Asignar icono a icon
                items: this.convertirOpcionesAMenuItems(this.listaOpciones, menu.codigo)
              };
            }
          );
    return menuItems;
  }

  convertirOpcionesAMenuItems(opciones: Menu[], codigoPadre: number): MenuItem[] {
    let menuItems = opciones
          .filter(menu => menu.opcionPadre === codigoPadre)
          .map(menu => {
              return {
                key: menu.codigo.toString(), // Asignar codigo a key como string
                label: menu.descripcionOpcion,    // Asignar nombreModulo a label
                icon: menu.icono,            // Asignar icono a icon
                route: menu.rutaOpcion
              };
            }
          );
    return menuItems;
  }
}