import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { buildPageableParams } from '../../../commons/http-request-handler.service';
import { AplicacionSearch } from '../../../../apis/model/module/private/operativo/aplicacion/request/aplicacion-search';
import { AplicacionRequest } from '../../../../apis/model/module/private/operativo/aplicacion/request/aplicacion-request';
import { AplicacionResponse } from '../../../../apis/model/module/private/operativo/aplicacion/response/aplicacion.response';

@Injectable({
  providedIn: 'root'
})
export class AplicacionService {
private readonly urlAplicacion = environment.url.base + '/plataforma/aplicacion';

  constructor(private readonly http: HttpClient,
              private readonly authService: AuthService) { }

  getAplicacionesPage(page: number,
                      estadoRegistro: string,
                      cantReg: number): Observable<any> {

    let aplicacionSearch: AplicacionSearch = { 
                      estadoRegistro: ""
        };

        aplicacionSearch.estadoRegistro = estadoRegistro;

    const direction: 'ASC' | 'DESC' =  'ASC';
    const pageable = {
      page: page,
      size: cantReg,
      sort: {
          property: "codigo",
          direction: direction
      }
  };

    const url = `${this.urlAplicacion}/list-page-aplicaciones`;

    return this.http.post(url, aplicacionSearch, { params: buildPageableParams(pageable) }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(entorno: AplicacionRequest): Observable<AplicacionResponse> {

    const url = `${this.urlAplicacion}/create-aplicacion`;

    return this.http.put<any>(url, entorno).pipe(
      map((response: any) => response as AplicacionResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  update(entorno: AplicacionRequest): Observable<AplicacionResponse> {

    const url = `${this.urlAplicacion}/update-aplicacion`;

    return this.http.put<any>(url, entorno).pipe(
      map((response: any) => response as AplicacionResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(codigo: string): Observable<AplicacionResponse> {

    let entorno: AplicacionRequest = new AplicacionRequest();
    entorno.codigo = codigo;

    const url = `${this.urlAplicacion}/delete-aplicacion`;

    return this.http.put<any>(url, entorno).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getAplicacion(codigo: string): Observable<AplicacionResponse> {
    const params = [
      `codigo=${codigo}`,
    ].filter(Boolean).join('&');

    const url = `${this.urlAplicacion}/get-aplicacion?${params}`;

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

  /*getAllEntornos(): Observable<AplicacionResponse[]> {

    const url = `${this.urlAplicacion}/list-all-entornos`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }*/
}
