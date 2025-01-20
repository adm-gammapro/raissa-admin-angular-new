import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { EstadoRegistroLabelPipe } from '../../../../apis/model/pipe/estado-registro-label.pipe';
import { OpcionResponse } from '../../../../apis/model/module/private/administrativo/opcion/response/opcion-response';
import { Util } from '../../../../utils/util/util.util';
import { Paginator } from '../../../../apis/model/module/private/commons/response/paginator';
import { MessagesService } from '../../../../service/commons/messages.service';
import { OpcionService } from '../../../../service/modules/private/administrativo/opcion/opcion.service';
import { EstadoRegistroEnum } from '../../../../apis/model/enums/estado-registro';

@Component({
  selector: 'app-opcion',
  imports: [FormsModule,
            ReactiveFormsModule,
            CommonModule,
            ...PRIME_NG_MODULES,
            PaginatorComponent,
            HeaderComponent,
            EstadoRegistroLabelPipe],
  providers: [ConfirmationService, MessageService],
  templateUrl: './opcion.component.html',
  styleUrl: './opcion.component.scss'
})
export class OpcionComponent implements OnInit {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  public opciones: OpcionResponse[] = [];
  estadoSearch: string | undefined;
  descripcionSearch: string | undefined;
  public opcionSearchForm: FormGroup;

  protected estadoRegistroOptions = Util.getListEstadoRegistro();

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng



  constructor(private readonly confirmationService: ConfirmationService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly router: Router,
              private readonly formBuilder: FormBuilder,
              private readonly messageService: MessageService,
              private readonly messagesService: MessagesService,
              private readonly opcionService: OpcionService) {

    this.opcionSearchForm = this.formBuilder.group({
      estadoSearch: ['S'],
      descripcionSearch: [''],
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
    Util.filterAlphanumeric(event, this.opcionSearchForm);
  }

  esBotonDeshabilitado(opcion: OpcionResponse): boolean {
    return Util.mapEstadoRegistro(opcion.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
  }

  eliminarFila(event: Event, opcionParam: OpcionResponse) {
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
        this.opcionService.eliminar(opcionParam.codigo).subscribe({
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
      const descripcionOpcion = params.get('descripcionOpcionSearch') ?? "";
  
      this.paginator.numeroPagina = pagina;
      this.paginator.cantidadRegistros = cantReg;
      this.estadoSearch = estado === "T" ? "" : estado;
      this.descripcionSearch = descripcionOpcion;
  
      this.loadOpciones();

      this.estadoSearch = !this.estadoSearch ? "T" : this.estadoSearch;
  
      this.opcionSearchForm.patchValue({
        estadoSearch: this.estadoSearch,
        nombrePerfilSearch: this.descripcionSearch,
      });
  
      this.initializeBreadcrumbs();
    });
  }

  busqueda() {
    const estado = this.opcionSearchForm.controls['estadoSearch'].value ?? "T";
    const descripcionOpcion = this.opcionSearchForm.controls['descripcionSearch'].value ?? "";
  
    this.router.navigate(['/opcion', this.paginator.numeroPagina, this.paginator.cantidadRegistros, estado, descripcionOpcion]);
  }

  clearForm() {
    this.router.navigate(['/opcion']);
  }

  navigateToFormEntorno(id: string | null) {
    this.router.navigate(['/form-opcion'], { queryParams: { id } });
  }

  reloadPage() {
    this.router.navigateByUrl('/content', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/opcion']);
    });
  }
  
  private loadOpciones(): void {
    this.opcionService
      .getModulosPage(this.paginator.numeroPagina, this.estadoSearch, this.descripcionSearch, this.paginator.cantidadRegistros)
      .subscribe(response => {
        this.opciones = response.content as OpcionResponse[];
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
    this.items = [{ label: 'Opciones' }];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }
}