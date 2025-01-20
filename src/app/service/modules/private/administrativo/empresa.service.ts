import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../../authorization/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  //private readonly url : string = environment.url.base + '/seguridad';

  constructor(private readonly http: HttpClient, 
              private readonly authService: AuthService) { }

  /*getempresas(user: string):  Observable<any> {
    const params = [
      `usuario=${user}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.url}/listarEmpresasUsuario?${params}`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {          
        return response.body;
      }),
      catchError(e => {
          this.authService.isNoAutorizado(e);
          return throwError(() => e);
      })
    );
  }

  getempresasXUsuario(idUsuario: number):  Observable<any> {
    const params = [
      `idUsuario=${idUsuario}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.url}/listarEmpresasVinculadoUsuario?${params}`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {          
        return response.body;
      }),
      catchError(e => {
          this.authService.isNoAutorizado(e);
          return throwError(() => e);
      })
    );
  }*/
}
