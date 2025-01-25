import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { EstadoRegistroLabelPipe } from '../../../../apis/model/pipe/estado-registro-label.pipe';
import { UsuarioResponse } from '../../../../apis/model/module/private/administrativo/usuario/response/usuario-response';
import { TipoDocumentoResponse } from '../../../../apis/model/module/private/commons/response/tipo-documento-response';
import { Util } from '../../../../utils/util/util.util';
import { Paginator } from '../../../../apis/model/module/private/commons/response/paginator';
import { MessagesService } from '../../../../service/commons/messages.service';
import { UsuarioService } from '../../../../service/modules/private/administrativo/usuario/usuario.service';
import { EstadoRegistroEnum } from '../../../../apis/model/enums/estado-registro';
import { UsuarioPerfilComponent } from './usuario-perfil/usuario-perfil.component';

@Component({
  selector: 'app-usuario',
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES,
    PaginatorComponent,
    HeaderComponent,
    EstadoRegistroLabelPipe, 
    UsuarioPerfilComponent],
        providers: [ConfirmationService, MessageService],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss'
})
export class UsuarioComponent implements OnInit {
  @ViewChild(UsuarioPerfilComponent) usuarioPerfilComponent!: UsuarioPerfilComponent;
  protected mostrarUsuarioPerfil = false;
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  protected usuarios: UsuarioResponse[] = [];
  protected tipoDocumentos: TipoDocumentoResponse[] = [];
  protected estadoSearch: string | undefined;
  protected usernameSearch: string | undefined;
  protected usuarioSearchForm: FormGroup;

  protected estadoRegistroOptions = Util.getListEstadoRegistro();

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng



  constructor(private readonly confirmationService: ConfirmationService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly router: Router,
              private readonly formBuilder: FormBuilder,
              private readonly messageService: MessageService,
              private readonly messagesService: MessagesService,
              private readonly usuarioService: UsuarioService) {

    this.usuarioSearchForm = this.formBuilder.group({
      usernameSearch: [''],
      estadoSearch: ['S'],
    });
  }

  cambioPagina(event: any) {
    this.paginator = {
      ...this.paginator,
      primerRegistroVisualizado: event.primerRegistroVisualizado ?? this.paginator.primerRegistroVisualizado,
      cantidadRegistros: event.cantidadRegistros ?? this.paginator.cantidadRegistros,
      numeroPagina: event.numeroPagina ?? this.paginator.numeroPagina
    };
  
    this.busqueda();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.usuarioSearchForm);
  }

  esBotonDeshabilitado(usuario: UsuarioResponse): boolean {
    return Util.mapEstadoRegistro(usuario.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
  }

  eliminarFila(event: Event, usuarioParam: UsuarioResponse) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Está seguro de dar de baja este registro?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'No',
        severity: 'danger',
        icon: 'pi pi-times',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Si',
        icon: 'pi pi-check',
        severity: 'info',
        outlined: true
      },
      accept: () => {
        this.usuarioService.eliminar(usuarioParam.id).subscribe({
          next: () => {
            this.messagesService.setMessage('Registro dado de baja.');
            this.reloadPage();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: Util.validaMensajeError(err) });
          }
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rechazado', detail: 'No se dió de baja al registro', life: 5000 });
      }
    });
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      const pagina = Util.parseOrDefault(params.get('pagina'), 0);
      const cantReg = Util.parseOrDefault(params.get('cantReg'), 5);
      const estado = Util.getEstado(params.get('estadoSearch'));
      const username = params.get('usernameSearch') ?? "";
  
      // Configuración del paginador
      this.paginator.numeroPagina = pagina;
      this.paginator.cantidadRegistros = cantReg;
      this.estadoSearch = estado === "T" ? "" : estado;
      this.usernameSearch = username;

      this.loadUsuarios();

      this.estadoSearch = !this.estadoSearch ? "T" : this.estadoSearch;

      this.usuarioSearchForm.patchValue({
        usernameSearch: this.usernameSearch,
        estadoSearch: this.estadoSearch
      });
  
      this.initializeBreadcrumbs();
    });
  }

  busqueda() {
    const estado = this.usuarioSearchForm.controls['estadoSearch'].value ?? "T";
    const username = this.usuarioSearchForm.controls['usernameSearch'].value ?? "";

    this.router.navigate(['/usuario', this.paginator.numeroPagina, this.paginator.cantidadRegistros, estado, username]);
  }

  clearForm() {
    this.router.navigate(['/usuario']);
  }

  navigateToFormEntorno(id: string | null) {
    this.router.navigate(['/form-usuario'], { queryParams: { id } });
  }

  reloadPage() {
    this.router.navigateByUrl('/content', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/usuario']);
    });
  }

  mostrarModal(codigoUsuario: number): void {
    this.usuarioPerfilComponent.cargarModelo(codigoUsuario);
    this.mostrarUsuarioPerfil = true; // Mostrar el componente hijo (modal)
  }

  cerrarModal(): void {
    this.mostrarUsuarioPerfil = false; // Cerrar el componente hijo
    this.loadMessages();
  }

  mostrarListaUsuarioClientePerfil(codigoUsuario: number) {
    this.router.navigate(['/usuario-cliente', codigoUsuario]);
  }

  private loadUsuarios(): void {
    this.usuarioService
      .getUsuariosPage(this.paginator.numeroPagina, this.estadoSearch, this.usernameSearch, this.paginator.cantidadRegistros)
      .subscribe(response => {
        this.usuarios = response.content as UsuarioResponse[];
        this.paginator.totalRegistros = response.totalElements;
        this.paginator.primerRegistroVisualizado = response.pageable.offset;

        this.loadMessages();
      });
  }

  private loadMessages(): void {
    const message = this.messagesService.getMessage();
    if (message) {
      this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: message, life: 5000 });
    }
  }

  private initializeBreadcrumbs(): void {
    this.items = [{ label: 'Usuarios' }];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }
}