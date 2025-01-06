import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EntornoService } from '../../../../../service/modules/private/operativo/entorno.service';
import { EntornoRequest } from '../../../../../apis/model/module/private/operativo/entorno/request/entorno-request';
import { Util } from '../../../../../utils/util/util.util';
import { MessagesService } from '../../../../../service/commons/messages.service';

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
  entorno: EntornoRequest = new EntornoRequest();
  public entornoForm: FormGroup;
  showErrorMessage: boolean = false;

  constructor(private readonly router: Router,
              private readonly confirmationService: ConfirmationService,
              private readonly formBuilder: FormBuilder,
              private readonly entornoService: EntornoService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly messagesService: MessagesService,
              private readonly messageService: MessageService) {

    this.entornoForm = this.formBuilder.group({
      codigo: new FormControl(this.entorno.codigo),
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
          this.entorno = this.entornoForm.value;
        
          if (this.entorno.codigo) {
            this.entornoService.update(this.entorno).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro actualizado satisfactoriamente.');
                this.router.navigate(['/entorno']);
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
            this.entornoService.create(this.entorno).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro guardado satisfactoriamente.');
                this.router.navigate(['/entorno']);
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
      this.entornoForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(params => {
      let id = params.get('id');

      if (id) {
        this.entornoService.getEntorno(id).subscribe(response => {
          this.entorno = response;

          this.entornoForm.patchValue({
            codigo: this.entorno.codigo,
            descripcion: this.entorno.descripcion
          });
        });
      }
    })
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
}
