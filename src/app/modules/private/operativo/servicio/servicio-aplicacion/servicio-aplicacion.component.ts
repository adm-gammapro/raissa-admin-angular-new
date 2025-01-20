import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../../layout/header/header.component';
import { EstadoRegistroLabelPipe } from '../../../../../apis/model/pipe/estado-registro-label.pipe';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ServicioResponse } from '../../../../../apis/model/module/private/operativo/servicio/response/servicio-response';
import { Util } from '../../../../../utils/util/util.util';
import { Paginator } from '../../../../../apis/model/module/private/commons/response/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { ServicioService } from '../../../../../service/modules/private/operativo/servicio/servicio.service';
import { EstadoRegistroEnum } from '../../../../../apis/model/enums/estado-registro';

@Component({
  selector: 'app-servicio-aplicacion',
  imports: [FormsModule,
              ReactiveFormsModule,
              CommonModule,
              ...PRIME_NG_MODULES,
              PaginatorComponent,
              HeaderComponent,
              EstadoRegistroLabelPipe],
    providers: [ConfirmationService, MessageService],
  templateUrl: './servicio-aplicacion.component.html',
  styleUrl: './servicio-aplicacion.component.scss'
})
export class ServicioAplicacionComponent implements OnInit {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  public servicios: ServicioResponse[] = [];
  estadoSearch: string | undefined;
  public servicioSearchForm: FormGroup;

  protected estadoRegistroOptions = Util.getListEstadoRegistro();

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng



  constructor(private readonly confirmationService: ConfirmationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly messagesService: MessagesService,
    private readonly servicioService: ServicioService) {

    this.servicioSearchForm = this.formBuilder.group({
      estadoSearch: ['S'],
    });
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

    this.busqueda();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.servicioSearchForm);
  }

  esBotonDeshabilitado(servicio: ServicioResponse): boolean {
    return Util.mapEstadoRegistro(servicio.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
  }

  eliminarFila(event: Event, servicioParam: ServicioResponse) {
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
        this.servicioService.eliminar(servicioParam.codigo).subscribe({
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
  
      // Configuración del paginador
      this.paginator.numeroPagina = pagina;
      this.paginator.cantidadRegistros = cantReg;
      this.estadoSearch = estado === "T" ? "" : estado;

      this.loadServicio();

      this.estadoSearch = !estado ? "S" : estado;

      this.servicioSearchForm.patchValue({
        estadoSearch: this.estadoSearch
      });
  
      this.initializeBreadcrumbs();
    });
  }

  busqueda() {
    const estado = this.servicioSearchForm.controls['estadoSearch'].value ?? "T";

    this.router.navigate(['/servicio', this.paginator.numeroPagina, this.paginator.cantidadRegistros, estado]);
  }

  clearForm() {
    this.router.navigate(['/servicio']);
  }

  navigateToFormEntorno(id: string | null) {
    this.router.navigate(['/form-servicio'], { queryParams: { id } });
  }

  reloadPage() {
    this.router.navigateByUrl('/content', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/servicio']);
    });
  }

  private loadServicio(): void {
      this.servicioService
        .getServiciosPage(this.paginator.numeroPagina, this.estadoSearch, this.paginator.cantidadRegistros)
        .subscribe(response => {
          this.servicios = response.content as ServicioResponse[];
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
      this.items = [{ label: 'Servicios' }];
      this.home = { icon: 'pi pi-home', routerLink: '/content' };
    }
}
