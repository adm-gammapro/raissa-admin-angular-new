import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from '../../../../authorization/auth.service';
import { UsuarioSearch } from '../../../../../apis/model/module/private/administrativo/usuario/request/usuario-search';
import { buildPageableParams } from '../../../../commons/http-request-handler.service';
import { UsuarioRequest } from '../../../../../apis/model/module/private/administrativo/usuario/request/usuario-request';
import { UsuarioResponse } from '../../../../../apis/model/module/private/administrativo/usuario/response/usuario-response';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly url: string = environment.url.base + '/usuario';

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

  /*getUsuariosEmpresas(idUsuario: number, idUsuarioSession: number): Observable<any> {
    const params = [
      `idUsuario=${idUsuario}`,
      `idUsuarioSession=${idUsuarioSession}`,
      `estadoRegistro=S`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/listarEmpresasUsuarioPage?${params}`;

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

  getUsuarioPerfiles(idUsuario: number, idEmpresa: string): Observable<any> {
    const params = [
      `idUsuario=${idUsuario}`,
      `idEmpresa=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/listarUsuarioPerfil?${params}`;

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

  public vincularEmpresa(idEmpresa: number, idUsuario: number) {
    let usuarioCliente: UsuarioCliente = new UsuarioCliente();
    usuarioCliente.codigoCliente = idEmpresa;
    usuarioCliente.codigoUsuario = idUsuario;

    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/vincularEmpresas`;

    return this.http.post<any>(url, usuarioCliente, { headers: headers }).pipe(
      map((response: any) => response.body as Usuario),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  public desVincularEmpresa(idUsuarioCliente: number) {
    let usuarioCliente: UsuarioCliente = new UsuarioCliente();
    usuarioCliente.codigo = idUsuarioCliente;

    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/desvincularEmpresas`;

    return this.http.post<any>(url, usuarioCliente, { headers: headers }).pipe(
      map((response: any) => response.body as Usuario),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  public cambiarPassword(idUsuario: number, password: string) {
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
  }

  public vincularPerfil(vincularPerfiles: PerfilRequest) {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/vincular-usuario-perfil`;

    return this.http.put<any>(url, vincularPerfiles, { headers: headers }).pipe(
      map((response: any) => response.body as Usuario),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  public desVincularPerfil(desvincularPerfiles: PerfilRequest) {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/desvincular-usuario-perfil`;

    return this.http.put<any>(url, desvincularPerfiles, { headers: headers }).pipe(
      map((response: any) => response.body as Usuario),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  public vincularEmpresaPerfil(usuarioCliente: UsuarioCliente) {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/vincularEmpresas`;

    return this.http.post<any>(url, usuarioCliente, { headers: headers }).pipe(
      map((response: any) => response.body as UsuarioCliente),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }*/
}
