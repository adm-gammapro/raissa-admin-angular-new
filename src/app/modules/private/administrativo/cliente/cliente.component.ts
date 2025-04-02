import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { EstadoRegistroLabelPipe } from '../../../../apis/model/pipe/estado-registro-label.pipe';
import { ClienteResponse } from '../../../../apis/model/module/private/administrativo/cliente/response/cliente-response';
import { Util } from '../../../../utils/util/util.util';
import { Paginator } from '../../../../apis/model/module/private/commons/response/paginator';
import { MessagesService } from '../../../../service/commons/messages.service';
import { ClienteService } from '../../../../service/modules/private/administrativo/cliente/cliente.service';
import { EstadoRegistroEnum } from '../../../../apis/model/enums/estado-registro';
import { ClienteInstitucionFinancieraComponent } from './cliente-institucion-financiera/cliente-institucion-financiera.component';
import { ClienteProveedorComponent } from './cliente-proveedor/cliente-proveedor.component';

@Component({
  selector: 'app-cliente',
  imports: [FormsModule,
                    ReactiveFormsModule,
                    CommonModule,
                    ...PRIME_NG_MODULES,
                    PaginatorComponent,
                    HeaderComponent,
                    EstadoRegistroLabelPipe,
                    ClienteInstitucionFinancieraComponent,
                    ClienteProveedorComponent],
          providers: [ConfirmationService, MessageService],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.scss'
})
export class ClienteComponent implements OnInit {
  @ViewChild(ClienteInstitucionFinancieraComponent) clienteInstitucionFinancieraComponent!: ClienteInstitucionFinancieraComponent;
  protected mostrarClienteInstitucionFinanciera = false;
  @ViewChild(ClienteProveedorComponent) clienteProveedorComponent!: ClienteProveedorComponent;
  protected mostrarClienteProveedor = false;

  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  protected clientes: ClienteResponse[] = [];
  protected estadoSearch: string | undefined;
  protected razonSocialSearch: string | undefined;
  protected clienteSearchForm: FormGroup;

  protected estadoRegistroOptions = Util.getListEstadoRegistro();

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng



  constructor(private readonly confirmationService: ConfirmationService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly router: Router,
              private readonly formBuilder: FormBuilder,
              private readonly messageService: MessageService,
              private readonly messagesService: MessagesService,
              private readonly clienteService: ClienteService) {

    this.clienteSearchForm = this.formBuilder.group({
      razonSocialSearch: [''],
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
    Util.filterAlphanumeric(event, this.clienteSearchForm);
  }

  esBotonDeshabilitado(cliente: ClienteResponse): boolean {
    return Util.mapEstadoRegistro(cliente.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
  }

  eliminarFila(event: Event, clienteParam: ClienteResponse) {
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
        this.clienteService.eliminar(clienteParam.codigo).subscribe({
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
      const razonSocial = params.get('razonSocialSearch') ?? "";
  
      // Configuración del paginador
      this.paginator.numeroPagina = pagina;
      this.paginator.cantidadRegistros = cantReg;
      this.estadoSearch = estado === "T" ? "" : estado;
      this.razonSocialSearch = razonSocial;

      this.loadClientes();

      this.estadoSearch = !this.estadoSearch ? "T" : this.estadoSearch;

      this.clienteSearchForm.patchValue({
        razonSocialSearch: this.razonSocialSearch,
        estadoSearch: this.estadoSearch
      });
  
      this.initializeBreadcrumbs();
    });
  }

  busqueda() {
    const estado = this.clienteSearchForm.controls['estadoSearch'].value ?? "T";
    const razonSocial = this.clienteSearchForm.controls['razonSocialSearch'].value ?? "";

    this.router.navigate(['/cliente', this.paginator.numeroPagina, this.paginator.cantidadRegistros, estado, razonSocial]);
  }

  clearForm() {
    this.router.navigate(['/cliente']);
  }

  navigateToFormEntorno(id: string | null) {
    this.router.navigate(['/form-cliente'], { queryParams: { id } });
  }

  reloadPage() {
    this.router.navigateByUrl('/content', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/cliente']);
    });
  }

  //Muestra relacion cliente aplicacion entorno
  mostrarVinculoClienteAplicacionEntorno(id: number | null) {
    this.router.navigate(['/cliente-aplicacion-entorno', id]);
  }

  //Modal para vincular institucion financiera con un cliente
  mostrarModalClienteInstitucionFinanciera(codigoCliente: number): void {
    this.clienteInstitucionFinancieraComponent.cargarModelo(codigoCliente);
    this.mostrarClienteInstitucionFinanciera = true; // Mostrar el componente hijo (modal)
  }

  cerrarModalClienteInstitucionFinanciera(): void {
    this.mostrarClienteInstitucionFinanciera = false; // Cerrar el componente hijo
    this.loadMessages();
  }

  //Modal para vincular proveedor con un cliente
  mostrarModalClienteProveedor(codigoCliente: number): void {
    this.clienteProveedorComponent.cargarModelo(codigoCliente);
    this.mostrarClienteProveedor = true; // Mostrar el componente hijo (modal)
  }

  cerrarModalClienteProveedor(): void {
    this.mostrarClienteProveedor = false; // Cerrar el componente hijo
    this.loadMessages();
  }

  mostrarClienteDatasource(codigoCliente: number) {
    this.router.navigate(['/cliente-datasource', codigoCliente]);
  }

  private loadClientes(): void {
    this.clienteService
      .getClientesPage(this.paginator.numeroPagina, this.estadoSearch, this.razonSocialSearch, this.paginator.cantidadRegistros)
      .subscribe(response => {
        this.clientes = response.content as ClienteResponse[];
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
    this.items = [{ label: 'Clientes' }];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }
}
