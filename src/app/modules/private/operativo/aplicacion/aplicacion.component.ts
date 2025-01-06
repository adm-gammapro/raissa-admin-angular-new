import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { EstadoRegistroLabelPipe } from '../../../../apis/model/pipe/estado-registro-label.pipe';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AplicacionResponse } from '../../../../apis/model/module/private/operativo/aplicacion/response/aplicacion.response';
import { Util } from '../../../../utils/util/util.util';
import { Paginator } from '../../../../apis/model/commons/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../service/commons/messages.service';
import { AplicacionService } from '../../../../service/modules/private/operativo/aplicacion.service';
import { EstadoRegistroEnum } from '../../../../apis/model/enums/estado-registro';

@Component({
  selector: 'app-aplicacion',
  imports: [FormsModule,
              ReactiveFormsModule,
              CommonModule,
              ...PRIME_NG_MODULES,
              PaginatorComponent,
              HeaderComponent,
              EstadoRegistroLabelPipe],
    providers: [ConfirmationService, MessageService, AplicacionService],
  templateUrl: './aplicacion.component.html',
  styleUrl: './aplicacion.component.scss'
})
export class AplicacionComponent implements OnInit {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  public aplicaciones: AplicacionResponse[] = [];
  estadoSearch: string | undefined;
  public aplicacionSearchForm: FormGroup;

  protected estadoRegistroOptions = Util.getListEstadoRegistro();

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng



  constructor(private readonly confirmationService: ConfirmationService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly router: Router,
              private readonly formBuilder: FormBuilder,
              private readonly messageService: MessageService,
              private readonly messagesService: MessagesService,
              private readonly aplicacionService: AplicacionService) {

    this.aplicacionSearchForm = this.formBuilder.group({
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
    Util.filterAlphanumeric(event, this.aplicacionSearchForm);
  }

  esBotonDeshabilitado(aplicacion: AplicacionResponse): boolean {
    return Util.mapEstadoRegistro(aplicacion.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
  }

  eliminarFila(event: Event, aplicacionParam: AplicacionResponse) {
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
        this.aplicacionService.eliminar(aplicacionParam.codigo).subscribe({
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
      let pagina = Number(params.get('pagina'));
      let estado = params.get('estadoSearch');
      let cantReg = Number(params.get('cantReg'));

      if (!pagina) {
        this.paginator.numeroPagina = 0;
      } else {
        this.paginator.numeroPagina = pagina;
      }

      if (!estado) {
        this.estadoSearch = "S";
      } else if(estado === "T") {
        this.estadoSearch = "";
      } else {
        this.estadoSearch = estado;
      }

      if (!cantReg) {
        this.paginator.cantidadRegistros = 5;
      } else {
        this.paginator.cantidadRegistros = cantReg;
      }

      this.aplicacionService.getAplicacionesPage(this.paginator.numeroPagina, this.estadoSearch, this.paginator.cantidadRegistros).subscribe(response => {
        this.aplicaciones = response.content as AplicacionResponse[];
        this.paginator.totalRegistros = response.totalElements;
        this.paginator.primerRegistroVisualizado = response.pageable.offset;

        if (!estado) {
          this.estadoSearch = "S";
        } else {
          this.estadoSearch = estado;
        }

        this.aplicacionSearchForm.patchValue({
          estadoSearch: this.estadoSearch
        });

        const message = this.messagesService.getMessage();
        if (message) {
          this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: message, life: 5000 });
        }

        this.items = [
          { label: 'Aplicaciones' }
        ];

        this.home = { icon: 'pi pi-home', routerLink: '/content' };
      });
    });
  }

  busqueda() {
      this.estadoSearch = this.aplicacionSearchForm.controls['estadoSearch'].value;

      if (this.estadoSearch === null) {
        this.estadoSearch = "T";
      }

      this.router.navigate(['/aplicacion', this.paginator.numeroPagina, this.paginator.cantidadRegistros, this.estadoSearch]);
  }

  clearForm() {
    this.router.navigate(['/aplicacion']);
  }

  navigateToFormEntorno(id: string | null) {
    this.router.navigate(['/form-aplicacion'], { queryParams: { id } });
  }

  reloadPage() {
    this.router.navigateByUrl('/content', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/aplicacion']);
    });
  }
}
