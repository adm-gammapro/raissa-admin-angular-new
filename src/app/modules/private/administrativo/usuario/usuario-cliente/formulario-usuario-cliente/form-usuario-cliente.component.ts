import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../../../config/primeNg/primeng-global-imports';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { UsuarioClienteRequest } from '../../../../../../apis/model/module/private/administrativo/usuario/request/usuario-cliente-request';
import { UsuarioClienteResponse } from '../../../../../../apis/model/module/private/administrativo/usuario/response/usuario-cliente-response';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../../../../../service/modules/private/administrativo/usuario/usuario.service';
import { MessagesService } from '../../../../../../service/commons/messages.service';
import { Util } from '../../../../../../utils/util/util.util';
import { map } from 'rxjs';
import { ClienteResponse } from '../../../../../../apis/model/module/private/administrativo/cliente/response/cliente-response';
import { PerfilResponse } from '../../../../../../apis/model/module/private/administrativo/perfil/response/perfil-response';
import { ClienteService } from '../../../../../../service/modules/private/administrativo/cliente/cliente.service';

@Component({
  selector: 'app-form-usuario-cliente',
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    ...PRIME_NG_MODULES],
  providers: [ConfirmationService, MessageService],
  templateUrl: './form-usuario-cliente.component.html',
  styleUrl: './form-usuario-cliente.component.scss'
})
export class FormUsuarioClienteComponent {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  usuarioClienteRequest: UsuarioClienteRequest = new UsuarioClienteRequest();
  usuarioClienteResponse!: UsuarioClienteResponse;
  public usuarioClienteForm: FormGroup;
  codigoUsuario!: number;
  clientes!: ClienteResponse[];
  perfiles!: PerfilResponse[];

  constructor(private readonly router: Router,
    private readonly confirmationService: ConfirmationService,
    private readonly formBuilder: FormBuilder,
    private readonly usuarioService: UsuarioService,
    private readonly clienteService: ClienteService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly messagesService: MessagesService,
    private readonly messageService: MessageService) {

    this.usuarioClienteForm = this.formBuilder.group({
      codigo: [null],
      codigoUsuario: [null],
      codigoCliente: [null, [Validators.required]],
      codigoPerfil: [null, [Validators.required]],
    });
  }
  
  guardar() {
    if (this.usuarioClienteForm.valid) {
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
          this.usuarioClienteRequest = this.usuarioClienteForm.value;
          this.usuarioClienteRequest.codigoUsuario = this.codigoUsuario;

          if (this.usuarioClienteRequest.codigo) {
            this.usuarioService.updateUsuarioClientePerfil(this.usuarioClienteRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro actualizado satisfactoriamente.');
                this.router.navigate(['/usuario-cliente', this.codigoUsuario]);
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
            this.usuarioService.createUsuarioClientePerfil(this.usuarioClienteRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro guardado satisfactoriamente.');
                this.router.navigate(['/usuario-cliente', this.codigoUsuario]);
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
      this.usuarioClienteForm.markAllAsTouched();
    }
  }
  
  ngOnInit() {
    this.loadModuloIfExists();
    this.cargarPerfiles();
    this.initializeBreadcrumb();
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.usuarioClienteForm);
  }

  navigateToFormUsuarioCliente() {
    this.router.navigate(['/usuario-cliente', this.codigoUsuario]);
  }

  private initializeBreadcrumb(): void {
    this.items = [
      { label: 'Usuarios', routerLink: '/usuarios' },
      { label: 'Usuario cliente perfil', routerLink: ['/usuario-cliente', this.codigoUsuario] },
      { label: 'Formulario' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }

  private loadModuloIfExists(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        map(params => {
          this.codigoUsuario = Number(params.get('codigoUsuario'));
  
          const id = params.get('id');
          return id ? Number(id) : null;
        })
      )
      .subscribe(id => {
        if (id) {
          this.usuarioService.getUsuarioClientePerfil(id).subscribe({
            next: response => this.populateForm(response),
            error: err => this.messageService.add({
              severity: 'error',
              summary: 'Error de Validación',
              detail: 'Error al cargar Aplicación: ' + err,
              life: 5000
            })
          });
        } else {
          this.obtenerListaClientesNuevo();
        }
      });
  }

  private populateForm(response: any): void {
    this.usuarioClienteResponse = response;

    this.obtenerListaClientesEditar(this.usuarioClienteResponse.cliente.codigo);

    this.usuarioClienteForm.patchValue({
      codigo: this.usuarioClienteResponse.codigo,
      codigoUsuario: this.usuarioClienteResponse.usuario.id,
      codigoCliente: this.usuarioClienteResponse.cliente.codigo,
      codigoPerfil: this.usuarioClienteResponse.perfil.codigo
    });
  }

  private obtenerListaClientesNuevo() {
    this.usuarioService.getClientesDisponibles(this.codigoUsuario).subscribe(response => {
      this.clientes = response;
    });
  }

  private obtenerListaClientesEditar(codigoCliente: number) {
    this.clienteService.getClienteVinculado(codigoCliente).subscribe(response => {
      this.clientes = response;
    });
  }

  private cargarPerfiles(): void {
    this.usuarioService.getPerfilesDisponibles(this.codigoUsuario).subscribe(response => {
      this.perfiles = response;
    });
  }
}