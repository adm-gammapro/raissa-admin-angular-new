import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from '../authorization/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TipoDocService {
  private readonly url:string = environment.url.base + '/plataforma/general';

  constructor(private readonly http: HttpClient, 
              private readonly authService: AuthService) { }

  getAllTipoDocumentos():  Observable<any> {
    const params = [
      `estadoRegistro=S`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.url}/list-TipoDocumento?${params}`;

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
}
