import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../../layout/header/header.component';
import { EstadoRegistroLabelPipe } from '../../../../../apis/model/pipe/estado-registro-label.pipe';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { UsuarioClienteResponse } from '../../../../../apis/model/module/private/administrativo/usuario/response/usuario-cliente-response';
import { Paginator } from '../../../../../apis/model/module/private/commons/response/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { UsuarioService } from '../../../../../service/modules/private/administrativo/usuario/usuario.service';
import { EstadoRegistroEnum } from '../../../../../apis/model/enums/estado-registro';
import { Util } from '../../../../../utils/util/util.util';

@Component({
  selector: 'app-usuario-cliente',
  imports: [FormsModule,
                  ReactiveFormsModule,
                  CommonModule,
                  ...PRIME_NG_MODULES,
                  PaginatorComponent,
                  HeaderComponent,
                  EstadoRegistroLabelPipe],
      providers: [ConfirmationService, MessageService],
  templateUrl: './usuario-cliente.component.html',
  styleUrl: './usuario-cliente.component.scss'
})
export class UsuarioClienteComponent implements OnInit {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  public usuarioClientePerfiles: UsuarioClienteResponse[] = [];
  protected codigoUsuario!: number;

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng



  constructor(private readonly confirmationService: ConfirmationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly messagesService: MessagesService,
    private readonly usuarioService: UsuarioService) {
  }

  cambioPagina(event: any) {//este metodo se debe replicar en todas las tablas donde se quiera usar paginador
    if (event.primerRegistroVisualizado != undefined) {
      this.paginator.primerRegistroVisualizado = event.primerRegistroVisualizado;
    }
    if (event.cantidadRegistros != undefined) {
      this.paginator.cantidadRegistros = event.cantidadRegistros;
    }
    if (event.numeroPagina != undefined) {
      this.paginator.numeroPagina = event.numeroPagina;
    }
  }

  esBotonDeshabilitado(usuarioClienteResponse: UsuarioClienteResponse): boolean {
    return Util.mapEstadoRegistro(usuarioClienteResponse.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
  }

  eliminarFila(event: Event, clienteAplicacionEntornoParam: UsuarioClienteResponse) {
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
        this.usuarioService.deleteUsuarioClientePerfil(clienteAplicacionEntornoParam.codigo).subscribe({
          next: () => {
            this.messagesService.setMessage('Registro dado de baja.');
            this.reloadPage();
          },
          error: (e) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el registro' });
            console.error(e);
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
      const codigoUsuario = Number(params.get('codigoUsuario'));
  
      this.codigoUsuario = codigoUsuario;

      // Configuración del paginador
      this.paginator.numeroPagina = pagina;
      this.paginator.cantidadRegistros = cantReg;

      this.loadUsuarioClientePerfil();

      this.initializeBreadcrumbs();
    });
  }

  volver() {
    this.router.navigate(['/usuario']);
  }

  navigateToFormUsuarioClientePerfil(codigoUsuarioClientePerfil: number | null) {
    this.router.navigate(['/form-usuario-cliente'], { queryParams: { id: codigoUsuarioClientePerfil, codigoUsuario: this.codigoUsuario } });
  }

  reloadPage() {
    this.router.navigateByUrl('/content', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/usuario-cliente', this.codigoUsuario]);
    });
  }

  private loadUsuarioClientePerfil(): void {
      this.usuarioService
        .getUsuarioClientePerfilesPage(this.paginator.numeroPagina, this.codigoUsuario, this.paginator.cantidadRegistros)
        .subscribe(response => {
          this.usuarioClientePerfiles = response.content as UsuarioClienteResponse[];
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
      this.items = [{ label: 'Usuarios', routerLink: '/usuario' }, { label: 'Usuario cliente perfil' }];
      this.home = { icon: 'pi pi-home', routerLink: '/content' };
    }
}