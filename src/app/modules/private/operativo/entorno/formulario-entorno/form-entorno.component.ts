import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { EntornoRequest } from '../../../../../apis/model/module/private/operativo/entorno/request/entorno-request';
import { Util } from '../../../../../utils/util/util.util';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { EntornoResponse } from '../../../../../apis/model/module/private/operativo/entorno/response/entorno-response';
import { filter, map, switchMap } from 'rxjs';
import { EntornoService } from '../../../../../service/modules/private/operativo/entorno/entorno.service';

@Component({
  selector: 'app-form-entorno',
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    ...PRIME_NG_MODULES],
  providers: [ConfirmationService, MessageService],
  templateUrl: './form-entorno.component.html',
  styleUrl: './form-entorno.component.scss'
})
export class FormEntornoComponent {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  entornoRequest: EntornoRequest = new EntornoRequest();
  entornoResponse: EntornoResponse = new EntornoResponse();
  public entornoForm: FormGroup;

  constructor(private readonly router: Router,
    private readonly confirmationService: ConfirmationService,
    private readonly formBuilder: FormBuilder,
    private readonly entornoService: EntornoService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly messagesService: MessagesService,
    private readonly messageService: MessageService) {

    this.entornoForm = this.formBuilder.group({
      codigo: [''],
      descripcion: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  guardar() {
    if (this.entornoForm.valid) {
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
          this.entornoRequest = this.entornoForm.value;

          if (this.entornoRequest.codigo) {
            this.entornoService.update(this.entornoRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro actualizado satisfactoriamente.');
                this.router.navigate(['/entorno']);
              },
              error: (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: Util.validaMensajeError(err),
                  life: 5000
                });
              }
            });
          } else {
            this.entornoService.create(this.entornoRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro guardado satisfactoriamente.');
                this.router.navigate(['/entorno']);
              },
              error: (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: Util.validaMensajeError(err),
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
      this.entornoForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.initializeBreadcrumb();
    this.loadModuloIfExists();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.entornoForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.entornoForm);
  }

  navigateToFormEntorno() {
    this.router.navigate(['/entorno']);
  }

  private initializeBreadcrumb(): void {
    this.items = [
      { label: 'Entornos', routerLink: '/entorno' },
      { label: 'Form' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }

  private loadModuloIfExists(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        map(params => params.get('id')),
        filter(id => !!id && id.trim() !== ''),
        switchMap(id => this.entornoService.getEntorno(id))
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
    this.entornoResponse = response;

    this.entornoForm.patchValue({
      codigo: this.entornoResponse.codigo,
      descripcion: this.entornoResponse.descripcion
    });
  }
}
