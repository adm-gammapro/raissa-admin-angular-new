import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ServicioSearch } from '../../../../../apis/model/module/private/operativo/servicio/request/servicio-search';
import { buildPageableParams } from '../../../../commons/http-request-handler.service';
import { ServicioRequest } from '../../../../../apis/model/module/private/operativo/servicio/request/servicio-request';
import { ServicioResponse } from '../../../../../apis/model/module/private/operativo/servicio/response/servicio-response';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
private readonly url = environment.url.base + '/servicio';

  constructor(private readonly http: HttpClient,
    private readonly authService: AuthService) { }

  getServiciosPage(page: number,
                  estadoRegistro: string | undefined,
                  cantReg: number): Observable<any> {

    let servicioSearch: ServicioSearch = { 
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

    const url = `${this.url}/list-page-servicios`;

    return this.http.post(url, servicioSearch, { params: buildPageableParams(pageable) }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(servicio: ServicioRequest): Observable<ServicioResponse> {
    const url = `${this.url}/create-servicio`;

    return this.http.put<any>(url, servicio).pipe(
      map((response: any) => response as ServicioResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  update(servicio: ServicioRequest): Observable<ServicioResponse> {
    const url = `${this.url}/update-servicio`;

    return this.http.put<any>(url, servicio).pipe(
      map((response: any) => response as ServicioResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(codigo: number): Observable<ServicioResponse> {
    let servicio: ServicioRequest = new ServicioRequest();
    servicio.codigo = codigo;

    const url = `${this.url}/delete-servicio`;

    return this.http.post<any>(url, servicio).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getServicio(codigo: number | null): Observable<ServicioResponse> {
    const params = [
      `codigoServicio=${codigo}`,
    ].filter(Boolean).join('&');

    const url = `${this.url}/get-servicio?${params}`;

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

  getAllServicios(): Observable<ServicioResponse[]> {
    const url = `${this.url}/list-all-servicios`;

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
