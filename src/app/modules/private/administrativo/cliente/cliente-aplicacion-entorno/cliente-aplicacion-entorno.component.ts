import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../../layout/header/header.component';
import { EstadoRegistroLabelPipe } from '../../../../../apis/model/pipe/estado-registro-label.pipe';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ClienteAplicacionEntornoResponse } from '../../../../../apis/model/module/private/administrativo/cliente/response/cliente-aplicacion-entorno-response';
import { Paginator } from '../../../../../apis/model/module/private/commons/response/paginator';
import { ClienteService } from '../../../../../service/modules/private/administrativo/cliente/cliente.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { Util } from '../../../../../utils/util/util.util';
import { EstadoRegistroEnum } from '../../../../../apis/model/enums/estado-registro';
import { ClienteServicioComponent } from './cliente-servicio/cliente-servicio.component';

@Component({
  selector: 'app-cliente-aplicacion-entorno',
  imports: [FormsModule,
              ReactiveFormsModule,
              CommonModule,
              ...PRIME_NG_MODULES,
              PaginatorComponent,
              HeaderComponent,
              EstadoRegistroLabelPipe,
              ClienteServicioComponent],
  providers: [ConfirmationService, MessageService],
  templateUrl: './cliente-aplicacion-entorno.component.html',
  styleUrl: './cliente-aplicacion-entorno.component.scss'
})
export class ClienteAplicacionEntornoComponent implements OnInit {
  @ViewChild(ClienteServicioComponent) clienteServicioComponent!: ClienteServicioComponent;
  protected mostrarClienteAplicacionEntornoServicio = false;
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  public clienteAplicacionEntornos: ClienteAplicacionEntornoResponse[] = [];
  protected codigoCliente!: number;

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng



  constructor(private readonly confirmationService: ConfirmationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly messagesService: MessagesService,
    private readonly clienteService: ClienteService) {
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

  esBotonDeshabilitado(clienteAplicacionEntornoResponse: ClienteAplicacionEntornoResponse): boolean {
    return Util.mapEstadoRegistro(clienteAplicacionEntornoResponse.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
  }

  eliminarFila(event: Event, clienteAplicacionEntornoParam: ClienteAplicacionEntornoResponse) {
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
        this.clienteService.eliminarClienteAplicacionEntorno(clienteAplicacionEntornoParam.codigo).subscribe({
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
      const codigoCliente = Number(params.get('codigoCliente'));
  
      this.codigoCliente = codigoCliente;

      // Configuración del paginador
      this.paginator.numeroPagina = pagina;
      this.paginator.cantidadRegistros = cantReg;

      this.loadClienteAplicacionEntorno();

      this.initializeBreadcrumbs();
    });
  }

  volver() {
    this.router.navigate(['/cliente']);
  }

  navigateToFormClienteAplicacionEntorno() {
    this.router.navigate(['/form-cliente-aplicacion-entorno'], { queryParams: { codigoCliente: this.codigoCliente } });
  }

  reloadPage() {
    this.router.navigateByUrl('/content', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/cliente-aplicacion-entorno', this.codigoCliente]);
    });
  }

  //Muestra relacion cliente aplicacion entorno
  mostrarVinculoClienteAplicacionEntornoServicio(codigoClienteAplicacionEntorno: number): void {
    this.clienteServicioComponent.cargarModelo(codigoClienteAplicacionEntorno);
    this.mostrarClienteAplicacionEntornoServicio = true; // Mostrar el componente hijo (modal)
  }

  //Modal para vincular institucion financiera con un cliente
  cerrarModalClienteAplicacionEntornoServicio(): void {
    this.mostrarClienteAplicacionEntornoServicio = false; // Cerrar el componente hijo
    this.loadMessages();
  }

  private loadClienteAplicacionEntorno(): void {
      this.clienteService
        .getClienteAplicacionEntornoPage(this.codigoCliente, this.paginator.numeroPagina, this.paginator.cantidadRegistros)
        .subscribe(response => {
          this.clienteAplicacionEntornos = response.content as ClienteAplicacionEntornoResponse[];
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
      this.items = [{ label: 'Clientes', routerLink: '/cliente' }, { label: 'Cliente aplicacion entorno' }];
      this.home = { icon: 'pi pi-home', routerLink: '/content' };
    }
}