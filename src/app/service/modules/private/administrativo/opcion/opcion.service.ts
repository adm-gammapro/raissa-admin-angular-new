import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { OpcionSearch } from '../../../../../apis/model/module/private/administrativo/opcion/request/opcion-search';
import { buildPageableParams } from '../../../../commons/http-request-handler.service';
import { OpcionResponse } from '../../../../../apis/model/module/private/administrativo/opcion/response/opcion-response';
import { OpcionRequest } from '../../../../../apis/model/module/private/administrativo/opcion/request/opcion-request';

@Injectable({
  providedIn: 'root'
})
export class OpcionService {
private readonly urlModulo = environment.url.base + '/opcion';

  constructor(private readonly http: HttpClient,
    private readonly authService: AuthService) { }

  getModulosPage(page: number,
                estadoRegistro: string | undefined,
                descripcionSearch: string| undefined,
                cantReg: number): Observable<any> {

    let opcionSearch: OpcionSearch = {
      estadoRegistro: estadoRegistro ?? "",
      descripcionOpcion: descripcionSearch ?? "" 
    };

    const direction: 'ASC' | 'DESC' = 'ASC';

    const pageable = {
      page: page,
      size: cantReg,
      sort: {
        property: "codigo",
        direction: direction
      }
    };

    const url = `${this.urlModulo}/list-page-opcion`;

    return this.http.post<any>(url, opcionSearch, { params: buildPageableParams(pageable) }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(modulo: OpcionRequest): Observable<OpcionResponse> {
    const url = `${this.urlModulo}/create-opcion`;

    return this.http.put<any>(url, modulo).pipe(
      map((response: any) => response as OpcionResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  update(modulo: OpcionRequest): Observable<OpcionResponse> {

    const url = `${this.urlModulo}/update-opcion`;

    return this.http.put<any>(url, modulo).pipe(
      map((response: any) => response as OpcionResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(codigo: number): Observable<OpcionResponse> {

    let modulo: OpcionRequest = new OpcionRequest();
    modulo.codigo = codigo;

    const url = `${this.urlModulo}/delete-opcion`;

    return this.http.put<any>(url, modulo).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getOpcion(codigo: number): Observable<OpcionResponse> {
    const params = [
      `codigoOpcion=${codigo}`,
    ].filter(Boolean).join('&');

    const url = `${this.urlModulo}/get-opcion?${params}`;

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
