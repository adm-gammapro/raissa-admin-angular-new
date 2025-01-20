import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { EstadoRegistroLabelPipe } from '../../../../apis/model/pipe/estado-registro-label.pipe';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ModuloService } from '../../../../service/modules/private/administrativo/modulo/modulo.service';
import { Util } from '../../../../utils/util/util.util';
import { Paginator } from '../../../../apis/model/module/private/commons/response/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../service/commons/messages.service';
import { EstadoRegistroEnum } from '../../../../apis/model/enums/estado-registro';
import { ModuloResponse } from '../../../../apis/model/module/private/administrativo/modulo/response/modulo-response';

@Component({
  selector: 'app-modulo',
  imports: [FormsModule,
              ReactiveFormsModule,
              CommonModule,
              ...PRIME_NG_MODULES,
              PaginatorComponent,
              HeaderComponent,
              EstadoRegistroLabelPipe],
    providers: [ConfirmationService, MessageService, ModuloService],
  templateUrl: './modulo.component.html',
  styleUrl: './modulo.component.scss'
})
export class ModuloComponent implements OnInit {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  public modulos: ModuloResponse[] = [];
  estadoSearch: string | undefined;
  nombreModuloSearch: string | undefined;
  public moduloSearchForm: FormGroup;

  protected estadoRegistroOptions = Util.getListEstadoRegistro();

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng



  constructor(private readonly confirmationService: ConfirmationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly messagesService: MessagesService,
    private readonly moduloService: ModuloService) {

    this.moduloSearchForm = this.formBuilder.group({
      estadoSearch: ['S'],
      nombreModuloSearch: [''],
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
    Util.filterAlphanumeric(event, this.moduloSearchForm);
  }

  esBotonDeshabilitado(modulo: ModuloResponse): boolean {
    return Util.mapEstadoRegistro(modulo.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
  }

  eliminarFila(event: Event, moduloParam: ModuloResponse) {
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
        this.moduloService.eliminar(moduloParam.codigo).subscribe({
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
      const nombreModulo = params.get('nombreModuloSearch') ?? "";
  
      this.paginator.numeroPagina = pagina;
      this.paginator.cantidadRegistros = cantReg;
      this.estadoSearch = estado === "T" ? "" : estado;
      this.nombreModuloSearch = nombreModulo;
  
      this.loadModulos();

      this.estadoSearch = !this.estadoSearch ? "T" : this.estadoSearch;
  
      this.moduloSearchForm.patchValue({
        estadoSearch: this.estadoSearch,
        nombreModuloSearch: this.nombreModuloSearch,
      });
  
      this.initializeBreadcrumbs();
    });
  }

  busqueda() {
    const estado = this.moduloSearchForm.controls['estadoSearch'].value ?? "T";
    const nombreModulo = this.moduloSearchForm.controls['nombreModuloSearch'].value ?? "";
  
    this.router.navigate(['/modulo', this.paginator.numeroPagina, this.paginator.cantidadRegistros, estado, nombreModulo]);
  }

  clearForm() {
    this.router.navigate(['/modulo']);
  }

  navigateToFormEntorno(id: string | null) {
    this.router.navigate(['/form-modulo'], { queryParams: { id } });
  }

  reloadPage() {
    this.router.navigateByUrl('/content', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/modulo']);
    });
  }
  
  private loadModulos(): void {
    this.moduloService
      .getModulosPage(this.paginator.numeroPagina, this.estadoSearch, this.nombreModuloSearch, this.paginator.cantidadRegistros)
      .subscribe(response => {
        this.modulos = response.content as ModuloResponse[];
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
    this.items = [{ label: 'Módulos' }];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }
}
