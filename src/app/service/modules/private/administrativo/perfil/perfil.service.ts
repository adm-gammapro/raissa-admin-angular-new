import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../../authorization/auth.service';
import { PerfilSearch } from '../../../../../apis/model/module/private/administrativo/perfil/request/perfil-search';
import { buildPageableParams } from '../../../../commons/http-request-handler.service';
import { PerfilResponse } from '../../../../../apis/model/module/private/administrativo/perfil/response/perfil-response';
import { PerfilRequest } from '../../../../../apis/model/module/private/administrativo/perfil/request/perfil-request';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private readonly urlPerfil: string = environment.url.base + '/perfil';

  constructor(private readonly http: HttpClient,
              private readonly authService: AuthService) { }

  getPerfilesPage(page: number,
                  estadoRegistro: string | undefined,
                  nombrePerfil: string | undefined,
                  cantReg: number): Observable<any> {

    let perfilSearch: PerfilSearch = {
      estadoRegistro: estadoRegistro ?? "",
      nombrePerfil: nombrePerfil ?? ""
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

    const url = `${this.urlPerfil}/list-page-perfil`;

    return this.http.post<any>(url, perfilSearch, { params: buildPageableParams(pageable) }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(perfil: PerfilRequest): Observable<PerfilResponse> {
    const url = `${this.urlPerfil}/create-perfil`;

    return this.http.put<any>(url, perfil).pipe(
      map((response: any) => response as PerfilResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  update(perfil: PerfilRequest): Observable<PerfilResponse> {
    const url = `${this.urlPerfil}/update-perfil`;

    return this.http.put<any>(url, perfil).pipe(
      map((response: any) => response as PerfilResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(id: number): Observable<PerfilResponse> {
    let perfil: PerfilRequest = new PerfilRequest();
    perfil.codigo = id;

    const url = `${this.urlPerfil}/delete-perfil`;

    return this.http.put<any>(url, perfil).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getPerfil(id: number): Observable<PerfilResponse> {
    const params = [
      `codigoPerfil=${id}`,
    ].filter(Boolean).join('&');

    const url = `${this.urlPerfil}/get-perfil?${params}`;

    return this.http.get<PerfilResponse>(url).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  /*getAllPerfiles(): Observable<any> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlPerfil}/listarAllPerfil`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {
        (response.body.content as Perfil[]).map(perfil => {
          perfil.descripcion = perfil.descripcion.toUpperCase();
          perfil.abreviatura = perfil.abreviatura.toUpperCase();
          perfil.nombreComercial = perfil.nombreComercial.toUpperCase();
          perfil.abreviatura = perfil.abreviatura.toUpperCase();
          if (perfil.estadoRegistro === 'S') {
            perfil.estadoRegistro = 'ACTIVO';
          } else {
            perfil.estadoRegistro = 'INACTIVO';
          }

          return perfil;
        });
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }*/

  /*getPerfilModulos(idPerfil: number): Observable<any> {
    const params = [
      `idPerfil=${idPerfil}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlPerfil}/listarPerfilModulos?${params}`;

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

  getPerfilMenus(idPerfil: number): Observable<any> {
    const params = [
      `idPerfil=${idPerfil}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlPerfil}/listarPerfilMenus?${params}`;

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

  vincularOpcion(moduloRequest: ModuloRequest): Observable<any> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlPerfil}/vincular-opcion-perfil`;

    return this.http.put<any>(url, moduloRequest, { headers: headers }).pipe(
      map((response: any) => response.body as Perfil),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  desvincularOpcion(moduloRequest: ModuloRequest): Observable<any> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlPerfil}/desvincular-opcion-perfil`;

    return this.http.put<any>(url, moduloRequest, { headers: headers }).pipe(
      map((response: any) => response.body as Perfil),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getPerfilesEstadoRegistro(idEmpresa: string, idUsuario: string): Observable<any> {
    const params = [
      `estadoRegistro=S`,
      `idEmpresa=${idEmpresa}`,
      `idUsuario=${idUsuario}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlPerfil}/listarAllPerfiles?${params}`;

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

  getPerfilesEmpresa(idEmpresa: number): Observable<Perfil[]> {
    const params = [
      `idEmpresa=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlPerfil}/listarPerfilesEmpresa?${params}`;

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
