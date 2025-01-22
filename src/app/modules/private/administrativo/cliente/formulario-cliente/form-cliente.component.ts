import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ClienteRequest } from '../../../../../apis/model/module/private/administrativo/cliente/request/cliente-request';
import { ClienteResponse } from '../../../../../apis/model/module/private/administrativo/cliente/response/cliente-response';
import { TipoClienteResponse } from '../../../../../apis/model/module/private/commons/response/tipo-cliente-response';
import { ClienteService } from '../../../../../service/modules/private/administrativo/cliente/cliente.service';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { TipoClienteService } from '../../../../../service/commons/tipo-cliente.service';
import { Util } from '../../../../../utils/util/util.util';

@Component({
  selector: 'app-form-cliente',
  imports: [FormsModule,
          ReactiveFormsModule,
          CommonModule,
          HeaderComponent,
          ...PRIME_NG_MODULES],
        providers: [ConfirmationService, MessageService],
  templateUrl: './form-cliente.component.html',
  styleUrl: './form-cliente.component.scss'
})
export class FormClienteComponent {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  clienteRequest: ClienteRequest = new ClienteRequest();
  clienteResponse: ClienteResponse = new ClienteResponse();
  protected tipoClientes: TipoClienteResponse[] = [];
  public clienteForm: FormGroup;

  opcionesSeleccionable = [
    { label: 'Sí', value: 'S' },
    { label: 'No', value: 'N' }
  ];

  constructor(private readonly router: Router,
              private readonly confirmationService: ConfirmationService,
              private readonly formBuilder: FormBuilder,
              private readonly clienteService: ClienteService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly messagesService: MessagesService,
              private readonly messageService: MessageService,
              private readonly tipoClienteService: TipoClienteService) {

    this.clienteForm = this.formBuilder.group({
      codigo: [''],
      razonSocial: ['', [Validators.required, Validators.maxLength(250)]],
      ruc: ['', [Validators.required, Validators.maxLength(50)]],
      codigoTipoCliente: ['', [Validators.required, Validators.maxLength(100)]],
      direccion: ['', [Validators.required, Validators.maxLength(200)]],
      telefonoFijo: ['', [Validators.required, Validators.maxLength(20)]],
      telefonoCelular: ['', [Validators.required, Validators.maxLength(20)]]
    });
  }

  guardar() {
    if (this.clienteForm.valid) {
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
          this.clienteRequest = {
            ...this.clienteForm.value
          };

          if (this.clienteRequest.codigo) {
            this.clienteService.update(this.clienteRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro actualizado satisfactoriamente.');
                this.router.navigate(['/cliente']);
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
            this.clienteService.create(this.clienteRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro guardado satisfactoriamente.');
                this.router.navigate(['/cliente']);
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
      this.clienteForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.initializeBreadcrumb();
    this.loadModuloIfExists();
    this.loadTipoCliente();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.clienteForm);
  }

  filterNumeric(event: Event): void {
    Util.filterNumeric(event, this.clienteForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.clienteForm);
  }

  navigateToFormEntorno() {
    this.router.navigate(['/cliente']);
  }

  private loadTipoCliente(): void {
    this.tipoClienteService.getAllTipoClientes().subscribe(response => {
      this.tipoClientes = response;
    });
  }

  private initializeBreadcrumb(): void {
    this.items = [
      { label: 'Clientes', routerLink: '/cliente' },
      { label: 'Formulario' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }

  private loadModuloIfExists(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        map(params => Number(params.get('id'))),
        filter(id => !!id),
        switchMap(id => this.clienteService.getCliente(id))
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
    this.clienteResponse = response;

    this.clienteForm.patchValue({
      codigo: this.clienteResponse.codigo,
      razonSocial: this.clienteResponse.razonSocial,
      ruc: this.clienteResponse.ruc,
      codigoTipoCliente: this.clienteResponse.tipoCliente.codigo,
      direccion: this.clienteResponse.direccion,
      telefonoFijo: this.clienteResponse.telefonoFijo,
      telefonoCelular: this.clienteResponse.telefonoCelular
    });
  }
}
