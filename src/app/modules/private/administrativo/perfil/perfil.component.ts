import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { EstadoRegistroLabelPipe } from '../../../../apis/model/pipe/estado-registro-label.pipe';
import { PerfilResponse } from '../../../../apis/model/module/private/administrativo/perfil/response/perfil-response';
import { Paginator } from '../../../../apis/model/module/private/commons/response/paginator';
import { Util } from '../../../../utils/util/util.util';
import { MessagesService } from '../../../../service/commons/messages.service';
import { PerfilService } from '../../../../service/modules/private/administrativo/perfil/perfil.service';
import { EstadoRegistroEnum } from '../../../../apis/model/enums/estado-registro';
import { PerfilOpcionComponent } from './perfil-opcion/perfil-opcion.component';

@Component({
  selector: 'app-perfil',
  imports: [FormsModule,
                ReactiveFormsModule,
                CommonModule,
                ...PRIME_NG_MODULES,
                PaginatorComponent,
                HeaderComponent,
                EstadoRegistroLabelPipe,
                PerfilOpcionComponent],
      providers: [ConfirmationService, MessageService],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  @ViewChild(PerfilOpcionComponent) perfilOpcionComponent!: PerfilOpcionComponent;
  protected mostrarPerfilOpcion = false;
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  public perfiles: PerfilResponse[] = [];
  estadoSearch: string | undefined;
  nombrePerfilSearch: string | undefined;
  public perfilSearchForm: FormGroup;

  protected estadoRegistroOptions = Util.getListEstadoRegistro();

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng



  constructor(private readonly confirmationService: ConfirmationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly messagesService: MessagesService,
    private readonly perfilService: PerfilService) {

    this.perfilSearchForm = this.formBuilder.group({
      estadoSearch: ['S'],
      nombrePerfilSearch: [''],
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
    Util.filterAlphanumeric(event, this.perfilSearchForm);
  }

  esBotonDeshabilitado(perfil: PerfilResponse): boolean {
    return Util.mapEstadoRegistro(perfil.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
  }

  eliminarFila(event: Event, perfilParam: PerfilResponse) {
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
        this.perfilService.eliminar(perfilParam.codigo).subscribe({
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
      const nombrePerfil = params.get('nombrePerfilSearch') ?? "";
  
      this.paginator.numeroPagina = pagina;
      this.paginator.cantidadRegistros = cantReg;
      this.estadoSearch = estado === "T" ? "" : estado;
      this.nombrePerfilSearch = nombrePerfil;
  
      this.loadperfiles();

      this.estadoSearch = !this.estadoSearch ? "T" : this.estadoSearch;
  
      this.perfilSearchForm.patchValue({
        estadoSearch: this.estadoSearch,
        nombrePerfilSearch: this.nombrePerfilSearch,
      });
  
      this.initializeBreadcrumbs();
    });
  }

  busqueda() {
    const estado = this.perfilSearchForm.controls['estadoSearch'].value ?? "T";
    const nombrePerfil = this.perfilSearchForm.controls['nombrePerfilSearch'].value ?? "";
  
    this.router.navigate(['/perfil', this.paginator.numeroPagina, this.paginator.cantidadRegistros, estado, nombrePerfil]);
  }

  clearForm() {
    this.router.navigate(['/perfil']);
  }

  navigateToFormEntorno(id: string | null) {
    this.router.navigate(['/form-perfil'], { queryParams: { id } });
  }

  reloadPage() {
    this.router.navigateByUrl('/content', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/perfil']);
    });
  }

  mostrarModal(codigoPerfil: number): void {
    this.perfilOpcionComponent.cargarModelo(codigoPerfil);
    this.mostrarPerfilOpcion = true; // Mostrar el componente hijo (modal)
  }

  cerrarModal(): void {
    this.mostrarPerfilOpcion = false; // Cerrar el componente hijo
    this.loadMessages();
  }
  
  private loadperfiles(): void {
    this.perfilService
      .getPerfilesPage(this.paginator.numeroPagina, this.estadoSearch, this.nombrePerfilSearch, this.paginator.cantidadRegistros)
      .subscribe(response => {
        this.perfiles = response.content as PerfilResponse[];
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
    this.items = [{ label: 'Perfiles' }];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }
}
