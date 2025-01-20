import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../../authorization/auth.service';
import { ProveedorSearch } from '../../../../../apis/model/module/private/operativo/proveedor/request/proveedor-search';
import { buildPageableParams } from '../../../../commons/http-request-handler.service';
import { ProveedorRequest } from '../../../../../apis/model/module/private/operativo/proveedor/request/proveedor-request';
import { ProveedorResponse } from '../../../../../apis/model/module/private/operativo/proveedor/response/proveedor-response';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private readonly url: string = environment.url.base + '/proveedor';

  constructor(private readonly http: HttpClient,
    private readonly authService: AuthService) { }

  getProveedoresPage(page: number,
                    estadoRegistro: string | undefined,
                    nombreProveedor: string | undefined,
                    codigoEntidadFinanciera: string | undefined,
                    cantReg: number): Observable<any> {

    let proveedorSearch: ProveedorSearch = {
      nombre: nombreProveedor ?? "",
      codigoEntidadFinanciera: codigoEntidadFinanciera ?? "",
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

    const url = `${this.url}/list-page-proveedor`;

    return this.http.post(url, proveedorSearch, { params: buildPageableParams(pageable) }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(proveedor: ProveedorRequest): Observable<ProveedorResponse> {

    const url = `${this.url}/create-proveedor`;

    return this.http.put<any>(url, proveedor).pipe(
      map((response: any) => response as ProveedorResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  update(proveedor: ProveedorRequest): Observable<ProveedorResponse> {

    const url = `${this.url}/update-proveedor`;

    return this.http.put<any>(url, proveedor).pipe(
      map((response: any) => response as ProveedorResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(codigo: string): Observable<ProveedorResponse> {

    let proveedor: ProveedorRequest = new ProveedorRequest();
    proveedor.codigo = codigo;

    const url = `${this.url}/delete-proveedor`;

    return this.http.put<any>(url, proveedor).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getProveedor(codigo: string | null): Observable<ProveedorResponse> {
    const params = [
      `codigoProveedor=${codigo}`,
    ].filter(Boolean).join('&');

    const url = `${this.url}/get-proveedor?${params}`;

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

  getAllProveedores(): Observable<ProveedorResponse[]> {

    const url = `${this.url}/list-all-proveedor`;

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
