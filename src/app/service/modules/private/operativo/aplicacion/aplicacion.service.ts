import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { buildPageableParams } from '../../../../commons/http-request-handler.service';
import { AplicacionSearch } from '../../../../../apis/model/module/private/operativo/aplicacion/request/aplicacion-search';
import { AplicacionRequest } from '../../../../../apis/model/module/private/operativo/aplicacion/request/aplicacion-request';
import { AplicacionResponse } from '../../../../../apis/model/module/private/operativo/aplicacion/response/aplicacion.response';
import { AplicacionEntornoSearch } from '../../../../../apis/model/module/private/operativo/aplicacion/response/aplicacion-entorno-search';
import { AplicacionEntornoResponse } from '../../../../../apis/model/module/private/operativo/aplicacion/response/aplicacion-entorno-response';
import { AplicacionEntornoRequest } from '../../../../../apis/model/module/private/operativo/aplicacion/request/aplicacion-entorno-request';

@Injectable({
  providedIn: 'root'
})
export class AplicacionService {
private readonly urlAplicacion = environment.url.base + '/plataforma/aplicacion';
private readonly urlAplicacionEntorno = environment.url.base + '/aplicacion-entorno';

  constructor(private readonly http: HttpClient,
              private readonly authService: AuthService) { }

  getAplicacionesPage(page: number,
                      estadoRegistro: string | undefined,
                      cantReg: number): Observable<any> {

    let aplicacionSearch: AplicacionSearch = { 
                      estadoRegistro: estadoRegistro ?? ""
        };

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

  getAplicacion(codigo: string | null): Observable<AplicacionResponse> {
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

  getAllAplicaciones(): Observable<AplicacionResponse[]> {

    const url = `${this.urlAplicacion}/list-all-aplicaciones`;

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

  getAplicacionEntorno(codigoAplicacion: string): Observable<AplicacionEntornoResponse> {
    let aplicacionEntorno: AplicacionEntornoSearch = new AplicacionEntornoSearch();
    aplicacionEntorno.codigoAplicacion = codigoAplicacion;

    const url = `${this.urlAplicacionEntorno}/list-aplicacion-entorno`;

    return this.http.post<any>(url, aplicacionEntorno).pipe(
      map((response: any) => response as AplicacionEntornoResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  vincularEntornos(aplicacionEntorno: AplicacionEntornoRequest): Observable<AplicacionResponse> {

    const url = `${this.urlAplicacionEntorno}/vincular-aplicacion-entorno`;

    return this.http.post<any>(url, aplicacionEntorno).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  desvincularEntornos(aplicacionEntorno: AplicacionEntornoRequest): Observable<AplicacionResponse> {

    const url = `${this.urlAplicacionEntorno}/desvincular-aplicacion-entorno`;

    return this.http.post<any>(url, aplicacionEntorno).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }
}