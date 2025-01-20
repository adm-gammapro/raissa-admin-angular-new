import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ProveedorRequest } from '../../../../../apis/model/module/private/operativo/proveedor/request/proveedor-request';
import { ProveedorResponse } from '../../../../../apis/model/module/private/operativo/proveedor/response/proveedor-response';
import { ActivatedRoute, Router } from '@angular/router';
import { ProveedorService } from '../../../../../service/modules/private/operativo/proveedor/proveedor.service';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { Util } from '../../../../../utils/util/util.util';
import { filter, map, switchMap } from 'rxjs';
import { InstitucionFinancieraService } from '../../../../../service/commons/institucion-financiera.service';
import { InstitucionfinancieraResponse } from '../../../../../apis/model/module/private/commons/response/institucion-financiera-response';

@Component({
  selector: 'app-form-proveedor',
  imports: [FormsModule,
      ReactiveFormsModule,
      CommonModule,
      HeaderComponent,
      ...PRIME_NG_MODULES],
    providers: [ConfirmationService, MessageService],
  templateUrl: './form-proveedor.component.html',
  styleUrl: './form-proveedor.component.scss'
})
export class FormProveedorComponent {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  proveedorRequest: ProveedorRequest = new ProveedorRequest();
  proveedorResponse: ProveedorResponse = new ProveedorResponse();
  protected institucionesFinancieras: InstitucionfinancieraResponse[] = [];
  public proveedorForm: FormGroup;

  opcionesSeleccionable = [
    { label: 'Sí', value: 'S' },
    { label: 'No', value: 'N' }
  ];

  constructor(private readonly router: Router,
              private readonly confirmationService: ConfirmationService,
              private readonly formBuilder: FormBuilder,
              private readonly proveedorService: ProveedorService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly messagesService: MessagesService,
              private readonly messageService: MessageService,
              private readonly institucionFinancieraService: InstitucionFinancieraService) {

    this.proveedorForm = this.formBuilder.group({
      codigo: [''],
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      referencia: ['', [Validators.required, Validators.maxLength(50)]],
      codigoInstitucionFinanciera: ['', [Validators.required]],
      indicadorValorAdicional: [''],
      indicadorTokenizable: ['']
    });
  }

  guardar() {
    if (this.proveedorForm.valid) {
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
          this.proveedorRequest = {
            ...this.proveedorForm.value, // Copia los valores del formulario
            indicadorValorAdicional: this.transformBooleanValue(this.proveedorForm.value.indicadorValorAdicional),
            indicadorTokenizable: this.transformBooleanValue(this.proveedorForm.value.indicadorTokenizable),
          };

          if (this.proveedorRequest.codigo) {
            this.proveedorService.update(this.proveedorRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro actualizado satisfactoriamente.');
                this.router.navigate(['/proveedor']);
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
            this.proveedorService.create(this.proveedorRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro guardado satisfactoriamente.');
                this.router.navigate(['/proveedor']);
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
      this.proveedorForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.initializeBreadcrumb();
    this.loadModuloIfExists();
    this.loadInstituciones();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.proveedorForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.proveedorForm);
  }

  navigateToFormEntorno() {
    this.router.navigate(['/proveedor']);
  }

  private loadInstituciones(): void {
    this.institucionFinancieraService.getAllInstitucionFinanciera().subscribe(response => {
      this.institucionesFinancieras = response;
    });
  }

  private initializeBreadcrumb(): void {
    this.items = [
      { label: 'Proveedores', routerLink: '/proveedor' },
      { label: 'Formulario' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }

  private loadModuloIfExists(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        map(params => params.get('id')),
        filter(id => !!id && id.trim() !== ''),
        switchMap(id => this.proveedorService.getProveedor(id))
      )
      .subscribe({
        next: response => this.populateForm(response),
        error: err => this.messageService.add({
          severity: 'error',
          summary: 'Error de Validación',
          detail: 'Error al cargar proveedor: ' + err,
          life: 5000
        })
      });
  }

  private populateForm(response: any): void {
    this.proveedorResponse = response;

    this.proveedorForm.patchValue({
      codigo: this.proveedorResponse.codigo,
      nombre: this.proveedorResponse.nombre,
      referencia: this.proveedorResponse.referencia,
      codigoInstitucionFinanciera: this.proveedorResponse.institucionFinanciera.codigo,
      indicadorValorAdicional: this.proveedorResponse.indicadorValorAdicional ? 'S' : 'N',
      indicadorTokenizable: this.proveedorResponse.indicadorTokenizable ? 'S' : 'N'
    });
  }

  private transformBooleanValue(value: string | null | undefined): boolean {
    return value === 'S';
  }
}