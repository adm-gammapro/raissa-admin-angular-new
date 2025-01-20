import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ClienteSearch } from '../../../../../apis/model/module/private/administrativo/cliente/request/cliente-search';
import { buildPageableParams } from '../../../../commons/http-request-handler.service';
import { ClienteRequest } from '../../../../../apis/model/module/private/administrativo/cliente/request/cliente-request';
import { ClienteResponse } from '../../../../../apis/model/module/private/administrativo/cliente/response/cliente-response';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
private readonly url: string = environment.url.base + '/cliente';

  constructor(private readonly http: HttpClient,
    private readonly authService: AuthService) { }

  getClientesPage(page: number,
    estadoRegistro: string | undefined,
    razonSocial: string | undefined,
    cantReg: number): Observable<any> {

    let clienteSearch: ClienteSearch = {
      razonSocial: razonSocial ?? "",
      estadoRegistro: estadoRegistro ?? ""
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

    const url = `${this.url}/list-page-cliente`;

    return this.http.post(url, clienteSearch, { params: buildPageableParams(pageable) }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(cliente: ClienteRequest): Observable<ClienteResponse> {

    const url = `${this.url}/create-cliente`;

    return this.http.put<any>(url, cliente).pipe(
      map((response: any) => response as ClienteResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  update(cliente: ClienteRequest): Observable<ClienteResponse> {

    const url = `${this.url}/update-cliente`;

    return this.http.put<any>(url, cliente).pipe(
      map((response: any) => response as ClienteResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(codigo: number): Observable<ClienteResponse> {

    let cliente: ClienteRequest = new ClienteRequest();
    cliente.codigo = codigo;

    const url = `${this.url}/delete-cliente`;

    return this.http.post<any>(url, cliente).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getCliente(codigo: number | null): Observable<ClienteResponse> {
    const params = [
      `codigoCliente=${codigo}`,
    ].filter(Boolean).join('&');

    const url = `${this.url}/get-cliente?${params}`;

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
