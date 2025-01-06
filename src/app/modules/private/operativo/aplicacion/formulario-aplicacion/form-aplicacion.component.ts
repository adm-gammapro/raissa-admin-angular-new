import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AplicacionRequest } from '../../../../../apis/model/module/private/operativo/aplicacion/request/aplicacion-request';
import { ActivatedRoute, Router } from '@angular/router';
import { AplicacionService } from '../../../../../service/modules/private/operativo/aplicacion.service';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { Util } from '../../../../../utils/util/util.util';

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
  aplicacion: AplicacionRequest = new AplicacionRequest();
  public aplicacionForm: FormGroup;
  showErrorMessage: boolean = false;

  constructor(private readonly router: Router,
              private readonly confirmationService: ConfirmationService,
              private readonly formBuilder: FormBuilder,
              private readonly aplicacionService: AplicacionService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly messagesService: MessagesService,
              private readonly messageService: MessageService) {

    this.aplicacionForm = this.formBuilder.group({
      codigo: new FormControl(this.aplicacion.codigo),
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
          this.aplicacion = this.aplicacionForm.value;
        
          if (this.aplicacion.codigo) {
            this.aplicacionService.update(this.aplicacion).subscribe({
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
            this.aplicacionService.create(this.aplicacion).subscribe({
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
    this.activatedRoute.queryParamMap.subscribe(params => {
      let id = params.get('id');

      if (id) {
        this.aplicacionService.getAplicacion(id).subscribe(response => {
          this.aplicacion = response;

          this.aplicacionForm.patchValue({
            codigo: this.aplicacion.codigo,
            descripcion: this.aplicacion.descripcion,
            ruta: this.aplicacion.ruta
          });
        });
      }
    });

    this.items = [
      { label: 'Aplicaciones', routerLink: '/aplicacion' },
      { label: 'Formulario' }
    ];

    this.home = { icon: 'pi pi-home', routerLink: '/content' };
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
}
