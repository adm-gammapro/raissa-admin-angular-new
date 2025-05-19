import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ModuloSearch } from '../../../../../apis/model/module/private/administrativo/modulo/request/modulo-search';
import { buildPageableParams } from '../../../../commons/http-request-handler.service';
import { ModuloRequest } from '../../../../../apis/model/module/private/administrativo/modulo/request/modulo-request';
import { ModuloResponse } from '../../../../../apis/model/module/private/administrativo/modulo/response/modulo-response';

@Injectable({
  providedIn: 'root'
})
export class ModuloService {
  private readonly urlModulo = environment.url.base + '/modulo';

  constructor(private readonly http: HttpClient,
    private readonly authService: AuthService) { }

  getModulosPage(page: number,
    estadoRegistro: string | undefined,
    nombremodulo: string| undefined,
    cantReg: number): Observable<any> {

    let moduloSearch: ModuloSearch = {
      estadoRegistro: estadoRegistro ?? "", // Asignar "" si estadoRegistro es undefined
      nombreModulo: nombremodulo ?? ""     // Asignar "" si nombremodulo es undefined
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

    const url = `${this.urlModulo}/list-page-modulos`;

    return this.http.post<any>(url, moduloSearch, { params: buildPageableParams(pageable) }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(modulo: ModuloRequest): Observable<ModuloResponse> {
    const url = `${this.urlModulo}/create-modulo`;

    return this.http.put<any>(url, modulo).pipe(
      map((response: any) => response as ModuloResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  update(modulo: ModuloRequest): Observable<ModuloResponse> {

    const url = `${this.urlModulo}/update-modulo`;

    return this.http.put<any>(url, modulo).pipe(
      map((response: any) => response as ModuloResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(codigo: number): Observable<ModuloResponse> {

    let modulo: ModuloRequest = new ModuloRequest();
    modulo.codigo = codigo;

    const url = `${this.urlModulo}/delete-modulo`;

    return this.http.put<any>(url, modulo).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getModulo(codigo: number): Observable<ModuloResponse> {
    const params = [
      `codigoModulo=${codigo}`,
    ].filter(Boolean).join('&');

    const url = `${this.urlModulo}/get-modulo?${params}`;

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
