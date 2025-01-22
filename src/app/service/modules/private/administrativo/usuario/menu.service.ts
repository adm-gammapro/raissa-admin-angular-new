import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from '../../../../authorization/auth.service';
import { MenuItem } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItems: MenuItem[] | null = null;
  private readonly url : string = environment.url.base + '/opcion-usuario';

  constructor(private readonly http: HttpClient,
              private readonly authService: AuthService) { }

  getMenuUsuarios(user: string):  Observable<any> {

    const params = [
      `usuario=${user}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.url}/list-opciones-usuario?${params}`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
          this.authService.isNoAutorizado(e);
          return throwError(() => e);
      })
    );
  }

  setMenuItems(items: MenuItem[]): void {
    this.menuItems = items;
    sessionStorage.setItem(environment.session.MENU_ITEMS, JSON.stringify(items));
  }

  getMenuItems(): MenuItem[] | null {
    if (!this.menuItems) {
      const storedItems = sessionStorage.getItem('menuItems');
      this.menuItems = storedItems ? JSON.parse(storedItems) : null;
    }
    return this.menuItems;
  }
}
