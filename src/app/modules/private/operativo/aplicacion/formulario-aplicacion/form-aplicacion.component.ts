import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AplicacionRequest } from '../../../../../apis/model/module/private/operativo/aplicacion/request/aplicacion-request';
import { ActivatedRoute, Router } from '@angular/router';
import { AplicacionService } from '../../../../../service/modules/private/operativo/aplicacion/aplicacion.service';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { Util } from '../../../../../utils/util/util.util';
import { AplicacionResponse } from '../../../../../apis/model/module/private/operativo/aplicacion/response/aplicacion.response';
import { filter, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-form-aplicacion',
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    ...PRIME_NG_MODULES],
  providers: [ConfirmationService, MessageService],
  templateUrl: './form-aplicacion.component.html',
  styleUrl: './form-aplicacion.component.scss'
})
export class FormAplicacionComponent {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  aplicacionRequest: AplicacionRequest = new AplicacionRequest();
  aplicacionResponse: AplicacionResponse = new AplicacionResponse();
  public aplicacionForm: FormGroup;

  constructor(private readonly router: Router,
    private readonly confirmationService: ConfirmationService,
    private readonly formBuilder: FormBuilder,
    private readonly aplicacionService: AplicacionService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly messagesService: MessagesService,
    private readonly messageService: MessageService) {

    this.aplicacionForm = this.formBuilder.group({
      codigo: [''],
      descripcion: ['', [Validators.required, Validators.maxLength(50)]],
      ruta: [''],
    });
  }

  guardar() {
    if (this.aplicacionForm.valid) {
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
          this.aplicacionRequest = this.aplicacionForm.value;

          if (this.aplicacionRequest.codigo) {
            this.aplicacionService.update(this.aplicacionRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro actualizado satisfactoriamente.');
                this.router.navigate(['/aplicacion']);
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
            this.aplicacionService.create(this.aplicacionRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro guardado satisfactoriamente.');
                this.router.navigate(['/aplicacion']);
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
      this.aplicacionForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.initializeBreadcrumb();
    this.loadModuloIfExists();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.aplicacionForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.aplicacionForm);
  }

  navigateToFormEntorno() {
    this.router.navigate(['/aplicacion']);
  }

  private initializeBreadcrumb(): void {
    this.items = [
      { label: 'Aplicaciones', routerLink: '/aplicacion' },
      { label: 'Formulario' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }

  private loadModuloIfExists(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        map(params => params.get('id')),
        filter(id => !!id && id.trim() !== ''),
        switchMap(id => this.aplicacionService.getAplicacion(id))
      )
      .subscribe({
        next: response => this.populateForm(response),
        error: err => this.messageService.add({
          severity: 'error',
          summary: 'Error de Validación',
          detail: 'Error al cargar Aplicación: ' + err,
          life: 5000
        })
      });
  }

  private populateForm(response: any): void {
    this.aplicacionResponse = response;

    this.aplicacionForm.patchValue({
      codigo: this.aplicacionResponse.codigo,
      descripcion: this.aplicacionResponse.descripcion,
      ruta: this.aplicacionResponse.ruta
    });
  }
}
