import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { EntornoRequest } from '../../../../apis/model/module/private/operativo/entorno/request/entorno-request';
import { EntornoResponse } from '../../../../apis/model/module/private/operativo/entorno/response/entorno-response';
import { EntornoSearch } from '../../../../apis/model/module/private/operativo/entorno/request/entorno-search';
import { buildPageableParams } from '../../../commons/http-request-handler.service';

@Injectable({
  providedIn: 'root'
})
export class EntornoService {
  private readonly urlEntorno = environment.url.base + '/entorno';

  constructor(private readonly http: HttpClient,
    private readonly authService: AuthService) { }

  getEntornosPage(page: number,
                  estadoRegistro: string,
                  cantReg: number): Observable<any> {

    let entornoSearch: EntornoSearch = { 
                      estadoRegistro: ""
        };

    entornoSearch.estadoRegistro = estadoRegistro;

    const direction: 'ASC' | 'DESC' =  'ASC';
    const pageable = {
      page: page,
      size: cantReg,
      sort: {
          property: "codigo",
          direction: direction
      }
  };

    const url = `${this.urlEntorno}/list-page-entorno?`;

    return this.http.post(url, entornoSearch, { params: buildPageableParams(pageable) }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(entorno: EntornoRequest): Observable<EntornoResponse> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlEntorno}/create-entorno`;

    return this.http.put<any>(url, entorno, { headers: headers }).pipe(
      map((response: any) => response as EntornoResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  update(entorno: EntornoRequest): Observable<EntornoResponse> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlEntorno}/update-entorno`;

    return this.http.put<any>(url, entorno, { headers: headers }).pipe(
      map((response: any) => response as EntornoResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(codigo: string): Observable<EntornoResponse> {
    const headers = new HttpHeaders({
    });

    let entorno: EntornoRequest = new EntornoRequest();
    entorno.codigo = codigo;

    const url = `${this.urlEntorno}/delete-entorno`;

    return this.http.put<any>(url, entorno, { headers: headers }).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getEntorno(codigo: string): Observable<EntornoResponse> {
    const params = [
      `codigoEntorno=${codigo}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlEntorno}/get-entorno?${params}`;

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

  getAllEntornos(): Observable<EntornoResponse[]> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlEntorno}/list-all-entornos`;

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
