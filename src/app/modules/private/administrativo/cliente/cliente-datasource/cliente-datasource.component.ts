import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../../layout/header/header.component';
import { EstadoRegistroLabelPipe } from '../../../../../apis/model/pipe/estado-registro-label.pipe';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ClienteDatasourceResponse } from '../../../../../apis/model/module/private/administrativo/cliente/response/cliente-datasource-response';
import { Paginator } from '../../../../../apis/model/module/private/commons/response/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { ClienteService } from '../../../../../service/modules/private/administrativo/cliente/cliente.service';
import { EstadoRegistroEnum } from '../../../../../apis/model/enums/estado-registro';
import { Util } from '../../../../../utils/util/util.util';
import { first } from 'rxjs';

@Component({
  selector: 'app-cliente-datasource',
  imports: [FormsModule,
                ReactiveFormsModule,
                CommonModule,
                ...PRIME_NG_MODULES,
                PaginatorComponent,
                HeaderComponent,
                EstadoRegistroLabelPipe],
    providers: [ConfirmationService, MessageService],
  templateUrl: './cliente-datasource.component.html',
  styleUrl: './cliente-datasource.component.scss'
})
export class ClienteDatasourceComponent implements OnInit {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  public clienteDatasources: ClienteDatasourceResponse[] = [];
  estadoSearch: string | undefined;
  public clienteDatasourceSearchForm: FormGroup;
  protected codigoCliente!: number;
  protected estadoRegistroOptions = Util.getListEstadoRegistro();

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng



  constructor(private readonly confirmationService: ConfirmationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly messagesService: MessagesService,
    private readonly clienteService: ClienteService) {

    this.clienteDatasourceSearchForm = this.formBuilder.group({
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
    Util.filterAlphanumeric(event, this.clienteDatasourceSearchForm);
  }

  esBotonDeshabilitado(clienteDatasource: ClienteDatasourceResponse): boolean {
    return Util.mapEstadoRegistro(clienteDatasource.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
  }

  eliminarFila(event: Event, clienteDatasourceParam: ClienteDatasourceResponse) {
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
        this.clienteService.eliminarClienteDatasource(clienteDatasourceParam.codigo).subscribe({
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
      const estado = Util.getEstado(params.get('estadoSearch'));
      const cliente = Number(params.get('codigoCliente'));


      this.paginator.numeroPagina = pagina;
      this.paginator.cantidadRegistros = cantReg;
      this.estadoSearch = estado === "T" ? "" : estado;

      this.codigoCliente = cliente;

      this.loadClienteDataSource();

      this.estadoSearch = !this.estadoSearch ? "T" : this.estadoSearch;

      this.clienteDatasourceSearchForm.patchValue({
        estadoSearch: this.estadoSearch,
      });

      this.initializeBreadcrumbs();
    });
  }

  busqueda() {
    const estado = this.clienteDatasourceSearchForm.controls['estadoSearch'].value ?? "T";

    this.router.navigate(['/cliente-datasource', this.paginator.numeroPagina, this.paginator.cantidadRegistros, this.codigoCliente, estado]);
  }

  clearForm() {
    this.router.navigate(['/cliente-datasource', this.codigoCliente]);
  }

  navigateToFormEntorno(id: number | null): void {
    if (id !== null) {
      this.router.navigate(['/form-cliente-datasource'], {
        queryParams: { id: id, codigoCliente: this.codigoCliente },
      });
    } else {
      this.clienteService.validarClienteDatasource(this.codigoCliente).pipe(first()).subscribe({
        next: (numero) => {
          if (numero === 0) {
            this.router.navigate(['/form-cliente-datasource'], {
              queryParams: { id: id, codigoCliente: this.codigoCliente },
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Rechazado',
              detail: 'No se puede registrar múltiples DS para un mismo cliente',
              life: 5000,
            });
          }
        },
        error: (err) => {
          console.error(Util.validaMensajeError(err));
        },
      });
    }
  }

  volver() {
    this.router.navigate(['/cliente']);
  }

  reloadPage() {
    this.router.navigateByUrl('/content', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/cliente-datasource', this.codigoCliente]);
    });
  }

  private loadClienteDataSource(): void {
    this.clienteService
      .getClienteDatasourcesPage(this.paginator.numeroPagina, this.codigoCliente, this.estadoSearch, this.paginator.cantidadRegistros)
      .subscribe(response => {
        this.clienteDatasources = response.content as ClienteDatasourceResponse[];
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
    this.items = [{ label: 'Clientes', routerLink: '/cliente' }, { label: 'Cliente Datasource' }];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }
}