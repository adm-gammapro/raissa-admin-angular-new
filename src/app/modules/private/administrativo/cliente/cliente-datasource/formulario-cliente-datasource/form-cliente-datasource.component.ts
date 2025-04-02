import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ClienteDatasourceRequest } from '../../../../../../apis/model/module/private/administrativo/cliente/request/cliente-datasource-request';
import { ClienteDatasourceResponse } from '../../../../../../apis/model/module/private/administrativo/cliente/response/cliente-datasource-response';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../../service/commons/messages.service';
import { ClienteService } from '../../../../../../service/modules/private/administrativo/cliente/cliente.service';
import { Util } from '../../../../../../utils/util/util.util';
import { filter, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-form-cliente-datasource',
  imports: [FormsModule,
          ReactiveFormsModule,
          CommonModule,
          HeaderComponent,
          ...PRIME_NG_MODULES],
        providers: [ConfirmationService, MessageService],
  templateUrl: './form-cliente-datasource.component.html',
  styleUrl: './form-cliente-datasource.component.scss'
})
export class FormClienteDatasourceComponent {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  clienteDatasourceRequest: ClienteDatasourceRequest = new ClienteDatasourceRequest();
  clienteDatasourceResponse: ClienteDatasourceResponse = new ClienteDatasourceResponse();
  codigoCliente!: number;
  public clienteDatasourceForm: FormGroup;

  constructor(private readonly router: Router,
              private readonly confirmationService: ConfirmationService,
              private readonly formBuilder: FormBuilder,
              private readonly activatedRoute: ActivatedRoute,
              private readonly messagesService: MessagesService,
              private readonly messageService: MessageService,
              private readonly clienteService: ClienteService) {

    this.clienteDatasourceForm = this.formBuilder.group({
      codigo: [null],
      codigoCliente: [null],
      codigoDataSource: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  guardar() {
    if (this.clienteDatasourceForm.valid) {
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
          this.clienteDatasourceRequest = {
            ...this.clienteDatasourceForm.value
          };

          this.clienteDatasourceRequest.codigoCliente = this.codigoCliente;

          if (this.clienteDatasourceRequest.codigo) {
            this.clienteService.updateClienteDatasource(this.clienteDatasourceRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro actualizado satisfactoriamente.');
                this.router.navigate(['/cliente-datasource', this.codigoCliente]);
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
            this.clienteService.createClienteDatasource(this.clienteDatasourceRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro guardado satisfactoriamente.');
                this.router.navigate(['/cliente-datasource', this.codigoCliente]);
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
      this.clienteDatasourceForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.initializeBreadcrumb();
    this.loadModuloIfExists();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.clienteDatasourceForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.clienteDatasourceForm);
  }

  navigateToFormClienteDatasource() {
    this.router.navigate(['/cliente-datasource', this.codigoCliente]);
  }

  private initializeBreadcrumb(): void {
    this.items = [
      { label: 'Clientes', routerLink: '/cliente' },
      { label: 'Cliente datasource', routerLink: ['/cliente-datasource', this.codigoCliente] },
      { label: 'Form' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }

  private loadModuloIfExists(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        map(params => {
          this.codigoCliente = Number(params.get('codigoCliente'))

          return Number(params.get('id'))
          }),
        filter(id => !!id), // Solo continuar si el id es válido (no nulo o 0)
        switchMap(id => this.clienteService.getClienteDatasource(id))
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
    this.clienteDatasourceResponse = response;

    this.clienteDatasourceForm.patchValue({
      codigo: this.clienteDatasourceResponse.codigo,
      codigoCliente: this.clienteDatasourceResponse.cliente.codigo,
      codigoDataSource: this.clienteDatasourceResponse.codigoDataSource
    });
  }
}
