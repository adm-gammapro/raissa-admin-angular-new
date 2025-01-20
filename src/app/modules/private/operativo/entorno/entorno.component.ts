import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../layout/header/header.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { EntornoResponse } from '../../../../apis/model/module/private/operativo/entorno/response/entorno-response';
import { Paginator } from '../../../../apis/model/module/private/commons/response/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Util } from '../../../../utils/util/util.util';
import { EstadoRegistroEnum } from '../../../../apis/model/enums/estado-registro';
import { EstadoRegistroLabelPipe } from '../../../../apis/model/pipe/estado-registro-label.pipe';
import { MessagesService } from '../../../../service/commons/messages.service';
import { EntornoService } from '../../../../service/modules/private/operativo/entorno/entorno.service';

@Component({
  selector: 'app-entorno',
  imports: [FormsModule,
            ReactiveFormsModule,
            CommonModule,
            ...PRIME_NG_MODULES,
            PaginatorComponent,
            HeaderComponent,
            EstadoRegistroLabelPipe],
  providers: [ConfirmationService, MessageService, EntornoService],
  templateUrl: './entorno.component.html',
  styleUrl: './entorno.component.scss'
})
export class EntornoComponent implements OnInit {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  public entornos: EntornoResponse[] = [];
  estadoSearch: string | undefined;
  public entornoSearchForm: FormGroup;

  protected estadoRegistroOptions = Util.getListEstadoRegistro();

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng



  constructor(private readonly confirmationService: ConfirmationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly messagesService: MessagesService,
    private readonly entornoService: EntornoService) {

    this.entornoSearchForm = this.formBuilder.group({
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
    Util.filterAlphanumeric(event, this.entornoSearchForm);
  }

  esBotonDeshabilitado(entorno: EntornoResponse): boolean {
    return Util.mapEstadoRegistro(entorno.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
  }

  eliminarFila(event: Event, entornoParam: EntornoResponse) {
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
        this.entornoService.eliminar(entornoParam.codigo).subscribe({
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

      this.loadEntornos();

      this.estadoSearch = !estado ? "S" : estado;

      this.entornoSearchForm.patchValue({
        estadoSearch: this.estadoSearch
      });
  
      this.initializeBreadcrumbs();
    });
  }

  busqueda() {
    const estado = this.entornoSearchForm.controls['estadoSearch'].value ?? "T";

    this.router.navigate(['/entorno', this.paginator.numeroPagina, this.paginator.cantidadRegistros, estado]);
  }

  clearForm() {
    this.router.navigate(['/entorno']);
  }

  navigateToFormEntorno(id: string | null) {
    this.router.navigate(['/form-entorno'], { queryParams: { id } });
  }

  reloadPage() {
    this.router.navigateByUrl('/content', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/entorno']);
    });
  }

  private loadEntornos(): void {
      this.entornoService
        .getEntornosPage(this.paginator.numeroPagina, this.estadoSearch, this.paginator.cantidadRegistros)
        .subscribe(response => {
          this.entornos = response.content as EntornoResponse[];
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
      this.items = [{ label: 'Entornos' }];
      this.home = { icon: 'pi pi-home', routerLink: '/content' };
    }
}
