import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { OpcionRequest } from '../../../../../apis/model/module/private/administrativo/opcion/request/opcion-request';
import { OpcionResponse } from '../../../../../apis/model/module/private/administrativo/opcion/response/opcion-response';
import { OpcionService } from '../../../../../service/modules/private/administrativo/opcion/opcion.service';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { Util } from '../../../../../utils/util/util.util';

@Component({
  selector: 'app-form-opcion',
  imports: [FormsModule,
        ReactiveFormsModule,
        CommonModule,
        HeaderComponent,
        ...PRIME_NG_MODULES],
      providers: [ConfirmationService, MessageService],
  templateUrl: './form-opcion.component.html',
  styleUrl: './form-opcion.component.scss'
})
export class FormOpcionComponent {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  opcionRequest: OpcionRequest = new OpcionRequest();
  opcionResponse: OpcionResponse = new OpcionResponse();
  public opcionForm: FormGroup;

  opcionesSeleccionable = [
    { label: 'Sí', value: 'S' },
    { label: 'No', value: 'N' }
  ];

  constructor(private readonly router: Router,
              private readonly confirmationService: ConfirmationService,
              private readonly formBuilder: FormBuilder,
              private readonly opcionService: OpcionService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly messagesService: MessagesService,
              private readonly messageService: MessageService) {

    this.opcionForm = this.formBuilder.group({
      codigo: [null],
      descripcionOpcion: ['', [Validators.required, Validators.maxLength(50)]],
      seleccionable: ['', [Validators.required]]
    });
  }

  guardar() {
    if (this.opcionForm.valid) {
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
          this.opcionRequest = this.opcionForm.value;
        
          if (this.opcionRequest.codigo) {
            this.opcionService.update(this.opcionRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro actualizado satisfactoriamente.');
                this.router.navigate(['/modulo']);
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
            this.opcionService.create(this.opcionRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro guardado satisfactoriamente.');
                this.router.navigate(['/opcion']);
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
      this.opcionForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.initializeBreadcrumb();
    this.loadModuloIfExists();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.opcionForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.opcionForm);
  }

  navigateToFormEntorno() {
    this.router.navigate(['/opcion']);
  }

  private initializeBreadcrumb(): void {
    this.items = [
      { label: 'Opciones', routerLink: '/opcion' },
      { label: 'Form' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }

  private loadModuloIfExists(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        map(params => Number(params.get('id'))),
        filter(id => !!id), // Solo continuar si el id es válido (no nulo o 0)
        switchMap(id => this.opcionService.getOpcion(id)) // Llamada al servicio
      )
      .subscribe({
        next: response => this.populateForm(response),
        error: err => this.messageService.add({
                              severity: 'error',
                              summary: 'Error de Validación',
                              detail: 'Error al cargar Módulo: ' + err,
                              life: 5000
        })
      });
  }
  
  private populateForm(response: any): void {
    this.opcionResponse = response;
  
    this.opcionForm.patchValue({
      codigo: response.codigo,
      descripcionOpcion: response.descripcionOpcion,
      seleccionable: response.seleccionable
    });
  }
}
