import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ClienteAplicacionEntornoRequest } from '../../../../../../apis/model/module/private/administrativo/cliente/request/cliente-aplicacion-entorno-request';
import { ClienteAplicacionEntornoResponse } from '../../../../../../apis/model/module/private/administrativo/cliente/response/cliente-aplicacion-entorno-response';
import { AplicacionResponse } from '../../../../../../apis/model/module/private/operativo/aplicacion/response/aplicacion.response';
import { EntornoResponse } from '../../../../../../apis/model/module/private/operativo/entorno/response/entorno-response';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../../service/commons/messages.service';
import { AplicacionService } from '../../../../../../service/modules/private/operativo/aplicacion/aplicacion.service';
import { ClienteService } from '../../../../../../service/modules/private/administrativo/cliente/cliente.service';
import { Util } from '../../../../../../utils/util/util.util';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-form-cliente-aplicacion-entorno',
  imports: [FormsModule,
        ReactiveFormsModule,
        CommonModule,
        HeaderComponent,
        ...PRIME_NG_MODULES],
      providers: [ConfirmationService, MessageService],
  templateUrl: './form-cliente-aplicacion-entorno.component.html',
  styleUrl: './form-cliente-aplicacion-entorno.component.scss'
})
export class FormClienteAplicacionEntornoComponent {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  clienteAplicacionEntornoRequest: ClienteAplicacionEntornoRequest = new ClienteAplicacionEntornoRequest();
  clienteAplicacionEntornoResponse: ClienteAplicacionEntornoResponse = new ClienteAplicacionEntornoResponse();
  aplicaciones: AplicacionResponse[] = [];
  entornos: EntornoResponse[] = [];
  codigoCliente!: number;
  public clienteAplicacionEntornoForm: FormGroup;

  constructor(private readonly router: Router,
              private readonly confirmationService: ConfirmationService,
              private readonly formBuilder: FormBuilder,
              private readonly aplicacionService: AplicacionService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly messagesService: MessagesService,
              private readonly messageService: MessageService,
              private readonly clienteService: ClienteService) {

    this.clienteAplicacionEntornoForm = this.formBuilder.group({
      codigo: [null],
      codigoCliente: [null, [Validators.required]],
      codigoAplicacion: ['', [Validators.required]],
      codigoEntorno: ['', [Validators.required]],
      apiKey: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  guardar() {
    if (this.clienteAplicacionEntornoForm.valid) {
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
          this.clienteAplicacionEntornoRequest = this.clienteAplicacionEntornoForm.value;
          this.clienteService.createClienteAplicacionEntorno(this.clienteAplicacionEntornoRequest).subscribe({
            next: () => {
              this.messagesService.setMessage('Registro guardado satisfactoriamente.');
              this.router.navigate(['/cliente-aplicacion-entorno', this.codigoCliente]);
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
      this.clienteAplicacionEntornoForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.loadModuloIfExists();
    this.cargarAplicaciones();
    this.initializeBreadcrumb();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.clienteAplicacionEntornoForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.clienteAplicacionEntornoForm);
  }

  navigateToFormClienteAplicacionEntorno() {
    this.router.navigate(['/cliente-aplicacion-entorno', this.codigoCliente]);
  }

  cargarEntornos(codigoAplicacion: any): void {

    this.clienteService.getEntornosdisponibles(this.codigoCliente, codigoAplicacion).subscribe(response => {
      this.entornos = response;
    });
  }

  private initializeBreadcrumb(): void {
    this.items = [
      { label: 'Clientes', routerLink: '/cliente' },
      { label: 'Cliente aplicacion entorno', routerLink: ['/cliente-aplicacion-entorno', this.codigoCliente] },
      { label: 'Form' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }

  private loadModuloIfExists(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        map(params => Number(params.get('codigoCliente'))),
        filter(id => !!id), // Solo continuar si el id es válido (no nulo o 0)
      )
      .subscribe({
        next: id => this.populateForm({ id }),
        error: err => this.messageService.add({
                              severity: 'error',
                              summary: 'Error de Validación',
                              detail: 'Error al cargar Módulo: ' + err,
                              life: 5000
        })
      });
  }
  
  private populateForm(response: any): void {
    this.codigoCliente = response.id;

    this.clienteAplicacionEntornoForm.patchValue({
      codigoCliente: response.id,
    });
  }

  private cargarAplicaciones(): void {
    this.aplicacionService.getAplicacionesDisponibles().subscribe(response => {
      this.aplicaciones = response;
    });
  }
}