import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoClienteService {
  private readonly url:string = environment.url.base + '/plataforma/general';

  constructor(private readonly http: HttpClient, 
              private readonly authService: AuthService) { }

  getAllTipoClientes():  Observable<any> {

    const url = `${this.url}/list-tipo-cliente`;

    return this.http.get(url).pipe(
      map((response: any) => {          
        return response;
      }),
      catchError(e => {
          this.authService.isNoAutorizado(e);
          return throwError(() => e);
      })
    );
  }
}
