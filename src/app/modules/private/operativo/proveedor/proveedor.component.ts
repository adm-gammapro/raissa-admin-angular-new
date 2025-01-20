import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { EstadoRegistroLabelPipe } from '../../../../apis/model/pipe/estado-registro-label.pipe';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ProveedorResponse } from '../../../../apis/model/module/private/operativo/proveedor/response/proveedor-response';
import { Util } from '../../../../utils/util/util.util';
import { Paginator } from '../../../../apis/model/module/private/commons/response/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../service/commons/messages.service';
import { EstadoRegistroEnum } from '../../../../apis/model/enums/estado-registro';
import { InstitucionFinancieraService } from '../../../../service/commons/institucion-financiera.service';
import { ProveedorService } from '../../../../service/modules/private/operativo/proveedor/proveedor.service';
import { InstitucionfinancieraResponse } from '../../../../apis/model/module/private/commons/response/institucion-financiera-response';

@Component({
  selector: 'app-proveedor',
  imports: [FormsModule,
                ReactiveFormsModule,
                CommonModule,
                ...PRIME_NG_MODULES,
                PaginatorComponent,
                HeaderComponent,
                EstadoRegistroLabelPipe],
      providers: [ConfirmationService, MessageService, ProveedorService, InstitucionFinancieraService],
  templateUrl: './proveedor.component.html',
  styleUrl: './proveedor.component.scss'
})
export class ProveedorComponent implements OnInit {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  protected proveedores: ProveedorResponse[] = [];
  protected institucionesFinancieras: InstitucionfinancieraResponse[] = [];
  protected estadoSearch: string | undefined;
  protected nombreSearch: string | undefined;
  protected codigoInstitucionfinancieraSearch: string | undefined;
  protected proveedorSearchForm: FormGroup;

  protected estadoRegistroOptions = Util.getListEstadoRegistro();

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng



  constructor(private readonly confirmationService: ConfirmationService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly router: Router,
              private readonly formBuilder: FormBuilder,
              private readonly messageService: MessageService,
              private readonly messagesService: MessagesService,
              private readonly proveedorService: ProveedorService,
              private readonly institucionFinancieraService: InstitucionFinancieraService) {

    this.proveedorSearchForm = this.formBuilder.group({
      nombreSearch: [''],
      codigoInstitucionfinancieraSearch: [''],
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
    Util.filterAlphanumeric(event, this.proveedorSearchForm);
  }

  esBotonDeshabilitado(proveedor: ProveedorResponse): boolean {
    return Util.mapEstadoRegistro(proveedor.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
  }

  eliminarFila(event: Event, proveedorParam: ProveedorResponse) {
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
        this.proveedorService.eliminar(proveedorParam.codigo).subscribe({
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
      const nombre = params.get('nombreSearch') ?? "";
      const institucionfinanciera = params.get('entidadFinancieraSearch') ?? "";
  
      // Configuración del paginador
      this.paginator.numeroPagina = pagina;
      this.paginator.cantidadRegistros = cantReg;
      this.estadoSearch = estado === "T" ? "" : estado;
      this.nombreSearch = nombre;
      this.codigoInstitucionfinancieraSearch = institucionfinanciera;

      this.loadProveedores();

      this.estadoSearch = !this.estadoSearch ? "T" : this.estadoSearch;

      this.proveedorSearchForm.patchValue({
        nombreSearch: this.nombreSearch,
        codigoInstitucionfinancieraSearch: this.codigoInstitucionfinancieraSearch,
        estadoSearch: this.estadoSearch
      });
  
      this.initializeBreadcrumbs();

      this.loadInstituciones();
    });
  }

  busqueda() {
    const estado = this.proveedorSearchForm.controls['estadoSearch'].value ?? "T";
    const nombre = this.proveedorSearchForm.controls['nombreSearch'].value ?? "";
    const institucionfinanciera = this.proveedorSearchForm.controls['codigoInstitucionfinancieraSearch'].value ?? "";

    this.router.navigate(['/proveedor', this.paginator.numeroPagina, this.paginator.cantidadRegistros, estado, nombre, institucionfinanciera]);
  }

  clearForm() {
    this.router.navigate(['/proveedor']);
  }

  navigateToFormEntorno(id: string | null) {
    this.router.navigate(['/form-proveedor'], { queryParams: { id } });
  }

  reloadPage() {
    this.router.navigateByUrl('/content', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/proveedor']);
    });
  }

  private loadInstituciones(): void {
    this.institucionFinancieraService.getAllInstitucionFinanciera().subscribe(response => {
      this.institucionesFinancieras = response;
    });
  }

  private loadProveedores(): void {
    this.proveedorService
      .getProveedoresPage(this.paginator.numeroPagina, this.estadoSearch, this.nombreSearch, this.codigoInstitucionfinancieraSearch, this.paginator.cantidadRegistros)
      .subscribe(response => {
        this.proveedores = response.content as ProveedorResponse[];
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
    this.items = [{ label: 'Proveedores' }];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }
}
