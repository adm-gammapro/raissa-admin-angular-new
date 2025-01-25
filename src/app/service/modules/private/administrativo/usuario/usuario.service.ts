import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from '../../../../authorization/auth.service';
import { UsuarioSearch } from '../../../../../apis/model/module/private/administrativo/usuario/request/usuario-search';
import { buildPageableParams } from '../../../../commons/http-request-handler.service';
import { UsuarioRequest } from '../../../../../apis/model/module/private/administrativo/usuario/request/usuario-request';
import { UsuarioResponse } from '../../../../../apis/model/module/private/administrativo/usuario/response/usuario-response';
import { UsuarioPerfilRequest } from '../../../../../apis/model/module/private/administrativo/usuario/request/usuario-perfil-request';
import { UsuarioPerfilSearch } from '../../../../../apis/model/module/private/administrativo/usuario/request/usuario-perfil-search';
import { UsuarioPerfilResponse } from '../../../../../apis/model/module/private/administrativo/usuario/response/usuario-perfil-response';
import { UsuarioClienteSearch } from '../../../../../apis/model/module/private/administrativo/usuario/request/usuario-cliente-search';
import { UsuarioClienteRequest } from '../../../../../apis/model/module/private/administrativo/usuario/request/usuario-cliente-request';
import { UsuarioClienteResponse } from '../../../../../apis/model/module/private/administrativo/usuario/response/usuario-cliente-response';
import { ClienteResponse } from '../../../../../apis/model/module/private/administrativo/cliente/response/cliente-response';
import { PerfilResponse } from '../../../../../apis/model/module/private/administrativo/perfil/response/perfil-response';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly url: string = environment.url.base + '/usuario';
  private readonly urlUsuarioPerfil: string = environment.url.base + '/usuario-perfil';
  private readonly urlUsuarioCliente: string = environment.url.base + '/usuario-cliente';

  constructor(private readonly http: HttpClient,
    private readonly authService: AuthService) { }

  getUsuariosPage(page: number,
    estadoRegistro: string | undefined,
    username: string | undefined,
    cantReg: number): Observable<any> {

    let usuarioSearch: UsuarioSearch = {
      username: username ?? "",
      estadoRegistro: estadoRegistro ?? ""
    };

    const direction: 'ASC' | 'DESC' = 'ASC';
    const pageable = {
      page: page,
      size: cantReg,
      sort: {
        property: "id",
        direction: direction
      }
    };

    const url = `${this.url}/list-page-usuarios`;

    return this.http.post(url, usuarioSearch, { params: buildPageableParams(pageable) }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(usuario: UsuarioRequest): Observable<UsuarioResponse> {

    const url = `${this.url}/create-usuario`;

    return this.http.put<any>(url, usuario).pipe(
      map((response: any) => response as UsuarioResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  update(proveedor: UsuarioRequest): Observable<UsuarioResponse> {

    const url = `${this.url}/update-usuario`;

    return this.http.put<any>(url, proveedor).pipe(
      map((response: any) => response as UsuarioResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(codigo: number): Observable<UsuarioResponse> {

    let proveedor: UsuarioRequest = new UsuarioRequest();
    proveedor.id = codigo;

    const url = `${this.url}/delete-usuario`;

    return this.http.put<any>(url, proveedor).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getUsuario(codigo: number | null): Observable<UsuarioResponse> {
    const params = [
      `codigoUsuario=${codigo}`,
    ].filter(Boolean).join('&');

    const url = `${this.url}/get-usuario?${params}`;

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

  getUsuarioPerfiles(idUsuario: number): Observable<UsuarioPerfilResponse> {
    let usuarioPerfilSearch: UsuarioPerfilSearch = new UsuarioPerfilSearch();
    usuarioPerfilSearch.codigoUsuario = idUsuario;

    const url = `${this.urlUsuarioPerfil}/list-usuario-perfil`;

    return this.http.post(url, usuarioPerfilSearch).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  vincularPerfil(vincularPerfiles: UsuarioPerfilRequest) {

    const url = `${this.urlUsuarioPerfil}/vincular-usuario-perfil`;

    return this.http.post<any>(url, vincularPerfiles).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  desVincularPerfil(desvincularPerfiles: UsuarioPerfilRequest) {

    const url = `${this.urlUsuarioPerfil}/desvincular-usuario-perfil`;

    return this.http.post<any>(url, desvincularPerfiles).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getUsuarioClientePerfilesPage(page: number,
    idUsuario: number | undefined,
    cantReg: number): Observable<any> {
      
    let usuarioClienteSearch: UsuarioClienteSearch = {
      codigoUsuario: idUsuario ?? 0
    };

    const direction: 'ASC' | 'DESC' = 'ASC';
    const pageable = {
      page: page,
      size: cantReg,
      sort: {
        property: "id",
        direction: direction
      }
    };

    const url = `${this.urlUsuarioCliente}/list-page-usuario-cliente`;

    return this.http.post(url, usuarioClienteSearch, { params: buildPageableParams(pageable) }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  

  public createUsuarioClientePerfil(usuarioCliente: UsuarioClienteRequest): Observable<UsuarioClienteResponse> {
    const url = `${this.urlUsuarioCliente}/create-usuario-cliente-perfil`;

    return this.http.post<any>(url, usuarioCliente).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  public updateUsuarioClientePerfil(usuarioCliente: UsuarioClienteRequest): Observable<UsuarioClienteResponse> {
    const url = `${this.urlUsuarioCliente}/update-usuario-cliente-perfil`;

    return this.http.post<any>(url, usuarioCliente).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  public deleteUsuarioClientePerfil(idUsuarioCliente: number): Observable<UsuarioClienteResponse> {
    let usuarioCliente: UsuarioClienteRequest = new UsuarioClienteRequest();
    usuarioCliente.codigo = idUsuarioCliente;

    const url = `${this.urlUsuarioCliente}/delete-usuario-cliente-perfil`;

    return this.http.post<any>(url, usuarioCliente).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getUsuarioClientePerfil(codigoUsuarioClientePerfil: number): Observable<UsuarioClienteResponse> {
    const params = [
      `codigoUsuarioClientePerfil=${codigoUsuarioClientePerfil}`
    ].filter(Boolean).join('&');

    const url = `${this.urlUsuarioCliente}/get-usuario-cliente-perfil?${params}`;

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

  getClientesDisponibles(codigoUsuario: number): Observable<ClienteResponse[]> {
    const params = [
      `codigoUsuario=${codigoUsuario}`
    ].filter(Boolean).join('&');

    const url = `${this.urlUsuarioCliente}/get-clientes-disponibles?${params}`;

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

  getPerfilesDisponibles(codigoUsuario: number): Observable<PerfilResponse[]> {
    const params = [
      `codigoUsuario=${codigoUsuario}`
    ].filter(Boolean).join('&');

    const url = `${this.urlUsuarioCliente}/get-perfiles-disponibles?${params}`;

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

  /*public cambiarPassword(idUsuario: number, password: string) {
    let resetPassword: ResetPassword = new ResetPassword();
    resetPassword.id = idUsuario;
    resetPassword.password = password;

    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/resetear-password`;

    return this.http.put<any>(url, resetPassword, { headers: headers }).pipe(
      map((response: any) => response.body as Usuario),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }*/
}
