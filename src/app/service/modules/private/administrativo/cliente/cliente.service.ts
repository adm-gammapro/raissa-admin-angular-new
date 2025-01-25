import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ClienteSearch } from '../../../../../apis/model/module/private/administrativo/cliente/request/cliente-search';
import { buildPageableParams } from '../../../../commons/http-request-handler.service';
import { ClienteRequest } from '../../../../../apis/model/module/private/administrativo/cliente/request/cliente-request';
import { ClienteResponse } from '../../../../../apis/model/module/private/administrativo/cliente/response/cliente-response';
import { ClienteInstitucionFinancieraSearch } from '../../../../../apis/model/module/private/administrativo/cliente/request/cliente-institucion-financiera-search';
import { ClienteInstitucionFinancieraResponse } from '../../../../../apis/model/module/private/administrativo/cliente/response/cliente-institucion-financiera-response';
import { ClienteInstitucionFinancieraRequest } from '../../../../../apis/model/module/private/administrativo/cliente/request/cliente-institucion-financiera-request';
import { ClienteProveedorSearch } from '../../../../../apis/model/module/private/administrativo/cliente/request/cliente-proveedor-search';
import { ClienteProveedorResponse } from '../../../../../apis/model/module/private/administrativo/cliente/response/cliente-proveedor-response';
import { ClienteProveedorRequest } from '../../../../../apis/model/module/private/administrativo/cliente/request/cliente-proveedor-request';
import { ClienteAplicacionEntornoSearch } from '../../../../../apis/model/module/private/administrativo/cliente/request/cliente-aplicacion-entorno-search';
import { ClienteAplicacionEntornoResponse } from '../../../../../apis/model/module/private/administrativo/cliente/response/cliente-aplicacion-entorno-response';
import { ClienteAplicacionEntornoRequest } from '../../../../../apis/model/module/private/administrativo/cliente/request/cliente-aplicacion-entorno-request';
import { ClienteAplicacionEntornoServicioSearch } from '../../../../../apis/model/module/private/administrativo/cliente/request/cliente-aplicacion-entorno-servicio-search';
import { ClienteAplicacionEntornoServicioResponse } from '../../../../../apis/model/module/private/administrativo/cliente/response/cliente-aplicacion-entorno-servicio-response';
import { ClienteAplicacionEntornoServicioRequest } from '../../../../../apis/model/module/private/administrativo/cliente/request/cliente-aplicacion-entorno-servicio-request';
import { EntornoResponse } from '../../../../../apis/model/module/private/operativo/entorno/response/entorno-response';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly url: string = environment.url.base + '/cliente';
  private readonly urlClienteInstitucionFinanciera: string = environment.url.base + '/cliente-institucion-financiera';
  private readonly urlClienteProveedor: string = environment.url.base + '/cliente-proveedor';
  private readonly urlClienteAplicacionEntorno: string = environment.url.base + '/cliente-aplicacion-entorno';
  private readonly urlClienteAplicacionEntornoServicio: string = environment.url.base + '/cliente-aplicacion-entorno-servicio';

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

  getClienteInstitucionFinanciera(codigoCliente: number): Observable<any> {
    let clienteInstitucionFinanciera: ClienteInstitucionFinancieraSearch = new ClienteInstitucionFinancieraSearch();
    clienteInstitucionFinanciera.codigoCliente = codigoCliente;

    const url = `${this.urlClienteInstitucionFinanciera}/list-cliente-institucion-financiera`;

    return this.http.post<any>(url, clienteInstitucionFinanciera).pipe(
      map((response: any) => response as ClienteInstitucionFinancieraResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }
    
  vincularInstitucionesFinancieras(clienteInstitucionFinanciera: ClienteInstitucionFinancieraRequest): Observable<any> {

    const url = `${this.urlClienteInstitucionFinanciera}/vincular-cliente-institucion-financiera`;

    return this.http.post<any>(url, clienteInstitucionFinanciera).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  desvincularInstitucionesFinancieras(clienteInstitucionFinanciera: ClienteInstitucionFinancieraRequest): Observable<any> {

    const url = `${this.urlClienteInstitucionFinanciera}/desvincular-cliente-institucion-financiera`;

    return this.http.post<any>(url, clienteInstitucionFinanciera).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getClienteProveedor(codigoCliente: number): Observable<any> {
    let clienteProveedor: ClienteProveedorSearch = new ClienteProveedorSearch();
    clienteProveedor.codigoCliente = codigoCliente;

    const url = `${this.urlClienteProveedor}/list-cliente-proveedor`;

    return this.http.post<any>(url, clienteProveedor).pipe(
      map((response: any) => response as ClienteProveedorResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }
    
  vincularProveedores(clienteProveedor: ClienteProveedorRequest): Observable<any> {

    const url = `${this.urlClienteProveedor}/vincular-cliente-proveedor`;

    return this.http.post<any>(url, clienteProveedor).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  desvincularProveedores(clienteProveedor: ClienteProveedorRequest): Observable<any> {

    const url = `${this.urlClienteProveedor}/desvincular-cliente-proveedor`;

    return this.http.post<any>(url, clienteProveedor).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getClienteAplicacionEntornoPage(codigoCliente: number,
    page: number,
    cantReg: number): Observable<any> {

    let clienteAplicacionEntornoSearch: ClienteAplicacionEntornoSearch = {
      codigoCliente: codigoCliente
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

    const url = `${this.urlClienteAplicacionEntorno}/list-page-cliente-aplicacion-entorno`;

    return this.http.post(url, clienteAplicacionEntornoSearch, { params: buildPageableParams(pageable) }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }
  
  eliminarClienteAplicacionEntorno(codigo: number): Observable<ClienteAplicacionEntornoResponse> {

    let clienteAplicacionEntorno: ClienteAplicacionEntornoRequest = new ClienteAplicacionEntornoRequest();
    clienteAplicacionEntorno.codigo = codigo;

    const url = `${this.urlClienteAplicacionEntorno}/delete-cliente-aplicacion-entorno`;

    return this.http.post<any>(url, clienteAplicacionEntorno).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  createClienteAplicacionEntorno(clienteAplicacionEntornoRequest: ClienteAplicacionEntornoRequest): Observable<ClienteAplicacionEntornoResponse> {

    const url = `${this.urlClienteAplicacionEntorno}/create-cliente-aplicacion-entorno`;

    return this.http.post<any>(url, clienteAplicacionEntornoRequest).pipe(
      map((response: any) => response as ClienteAplicacionEntornoResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getEntornosdisponibles(codigoCliente: number | null,
                        codigoAplicacion: string | null
  ): Observable<EntornoResponse[]> {
    const params = [
      `codigoAplicacion=${codigoAplicacion}`,
      `codigoCliente=${codigoCliente}`,
    ].filter(Boolean).join('&');

    const url = `${this.urlClienteAplicacionEntorno}/get-entornos-disponibles?${params}`;

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

  getClienteAplicacionEntornoServicio(codigoClienteAplicacionEntorno: number): Observable<any> {
    let clienteAplicacionEntornoServicio: ClienteAplicacionEntornoServicioSearch = new ClienteAplicacionEntornoServicioSearch();
    clienteAplicacionEntornoServicio.codigoClienteAplicacionEntorno = codigoClienteAplicacionEntorno;

    const url = `${this.urlClienteAplicacionEntornoServicio}/list-cliente-aplicacion-entorno-servicio`;

    return this.http.post<any>(url, clienteAplicacionEntornoServicio).pipe(
      map((response: any) => response as ClienteAplicacionEntornoServicioResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }
    
  vincularClienteAplicacionEntornoServicio(clienteAplicacionEntornoServicio: ClienteAplicacionEntornoServicioRequest): Observable<any> {

    const url = `${this.urlClienteAplicacionEntornoServicio}/vincular-cliente-aplicacion-entorno-servicio`;

    return this.http.post<any>(url, clienteAplicacionEntornoServicio).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  desvincularClienteAplicacionEntornoServicio(clienteAplicacionEntornoServicio: ClienteAplicacionEntornoServicioRequest): Observable<any> {

    const url = `${this.urlClienteAplicacionEntornoServicio}/desvincular-cliente-aplicacion-entorno-servicio`;

    return this.http.post<any>(url, clienteAplicacionEntornoServicio).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getClienteVinculado(codigoCliente: number): Observable<ClienteResponse[]> {
    const params = [
      `codigoCliente=${codigoCliente}`,
    ].filter(Boolean).join('&');

    const url = `${this.url}/get-cliente-vinculado?${params}`;

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
