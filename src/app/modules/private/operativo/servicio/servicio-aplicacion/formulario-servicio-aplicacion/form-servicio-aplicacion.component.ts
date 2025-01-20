import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ServicioRequest } from '../../../../../../apis/model/module/private/operativo/servicio/request/servicio-request';
import { ServicioResponse } from '../../../../../../apis/model/module/private/operativo/servicio/response/servicio-response';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicioService } from '../../../../../../service/modules/private/operativo/servicio/servicio.service';
import { MessagesService } from '../../../../../../service/commons/messages.service';
import { Util } from '../../../../../../utils/util/util.util';
import { filter, map, switchMap } from 'rxjs';
import { AplicacionService } from '../../../../../../service/modules/private/operativo/aplicacion/aplicacion.service';
import { AplicacionResponse } from '../../../../../../apis/model/module/private/operativo/aplicacion/response/aplicacion.response';
import { TipoServicioService } from '../../../../../../service/commons/tipo-servicio.service';
import { TipoServicioResponse } from '../../../../../../apis/model/module/private/commons/response/tipo-servicio-response';

@Component({
  selector: 'app-form-servicio-aplicacion',
  imports: [FormsModule,
      ReactiveFormsModule,
      CommonModule,
      HeaderComponent,
      ...PRIME_NG_MODULES],
    providers: [ConfirmationService, MessageService],
  templateUrl: './form-servicio-aplicacion.component.html',
  styleUrl: './form-servicio-aplicacion.component.scss'
})
export class FormServicioAplicacionComponent {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  servicioRequest: ServicioRequest = new ServicioRequest();
  servicioResponse: ServicioResponse = new ServicioResponse();
  tipoServicios: TipoServicioResponse[] = [];
  aplicaciones: AplicacionResponse[] = [];
  public servicioForm: FormGroup;

  constructor(private readonly router: Router,
    private readonly confirmationService: ConfirmationService,
    private readonly formBuilder: FormBuilder,
    private readonly servicioService: ServicioService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly messagesService: MessagesService,
    private readonly messageService: MessageService,
    private readonly aplicacionService: AplicacionService,
    private readonly tipoServicioService: TipoServicioService) {

    this.servicioForm = this.formBuilder.group({
      codigo: [''],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      codigoAplicacion: ['', [Validators.required]],
      esJob: ['', [Validators.required]],
      codigoTipoServicio: ['', [Validators.required]]
    });
  }

  opcionesSeleccionable = [
    { label: 'Sí', value: 'S' },
    { label: 'No', value: 'N' }
  ];

  guardar() {
    if (this.servicioForm.valid) {
      this.confirmationService.confirm({
        message: '¿Está seguro de guardar este registro?',
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
          this.servicioRequest = this.servicioForm.value;

          this.servicioRequest = {
            ...this.servicioForm.value, // Copia los valores del formulario
            esJob: this.transformBooleanValue(this.servicioForm.value.esJob)
          };



          if (this.servicioRequest.codigo) {
            this.servicioService.update(this.servicioRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro actualizado satisfactoriamente.');
                this.router.navigate(['/servicio']);
              },
              error: (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: err.error.message,
                  life: 5000
                });
              }
            });
          } else {
            this.servicioService.create(this.servicioRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro guardado satisfactoriamente.');
                this.router.navigate(['/servicio']);
              },
              error: (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: err.error.message,
                  life: 5000
                });
              }
            });
          }
        },
        reject: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Rechazado',
            detail: 'No se guardó registro',
            life: 5000
          });
        }
      });

    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Validación',
        detail: 'Se deben ingresar los campos obligatorios y en el formato requerido.',
        life: 5000
      });
      this.servicioForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.initializeBreadcrumb();
    this.loadModuloIfExists();
    this.cargarAplicaciones();
    this.loadTipoServicio();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.servicioForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.servicioForm);
  }

  navigateToFormEntorno() {
    this.router.navigate(['/servicio']);
  }

  private initializeBreadcrumb(): void {
    this.items = [
      { label: 'Servicios', routerLink: '/servicio' },
      { label: 'Form' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }

  private loadModuloIfExists(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        map(params => Number(params.get('id'))),
        filter(id => !!id),
        switchMap(id => this.servicioService.getServicio(id))
      )
      .subscribe({
        next: response => this.populateForm(response),
        error: err => this.messageService.add({
          severity: 'error',
          summary: 'Error de Validación',
          detail: 'Error al cargar Servicio',
          life: 5000
        })
      });
  }

  private populateForm(response: any): void {
    this.servicioResponse = response;

    this.servicioForm.patchValue({
      codigo: this.servicioResponse.codigo,
      nombre: this.servicioResponse.nombre,
      codigoAplicacion: this.servicioResponse.aplicacion.codigo,
      esJob: this.servicioResponse.esJob ? 'S' : 'N',
      codigoTipoServicio: this.servicioResponse.tipoServicio?.codigo,
    });
  }

  private cargarAplicaciones(): void {
    this.aplicacionService.getAllAplicaciones().subscribe(response => {
      this.aplicaciones = response;
    });
    
  }

  private loadTipoServicio(): void {
    this.tipoServicioService.getAllTipoServicios().subscribe(response => {
      this.tipoServicios = response;
    });
  }

  private transformBooleanValue(value: string | null | undefined): boolean {
    return value === 'S';
  }
}
