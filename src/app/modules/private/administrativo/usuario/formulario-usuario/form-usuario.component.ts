import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { UsuarioRequest } from '../../../../../apis/model/module/private/administrativo/usuario/request/usuario-request';
import { UsuarioResponse } from '../../../../../apis/model/module/private/administrativo/usuario/response/usuario-response';
import { TipoDocumentoResponse } from '../../../../../apis/model/module/private/commons/response/tipo-documento-response';
import { UsuarioService } from '../../../../../service/modules/private/administrativo/usuario/usuario.service';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { TipoDocService } from '../../../../../service/commons/tipo-doc.service';
import { Util } from '../../../../../utils/util/util.util';

@Component({
  selector: 'app-form-usuario',
  imports: [FormsModule,
        ReactiveFormsModule,
        CommonModule,
        HeaderComponent,
        ...PRIME_NG_MODULES],
      providers: [ConfirmationService, MessageService],
  templateUrl: './form-usuario.component.html',
  styleUrl: './form-usuario.component.scss'
})
export class FormUsuarioComponent {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  usuarioRequest: UsuarioRequest = new UsuarioRequest();
  usuarioResponse: UsuarioResponse = new UsuarioResponse();
  protected tipoDocumentos: TipoDocumentoResponse[] = [];
  public usuarioForm: FormGroup;

  opcionesSeleccionable = [
    { label: 'Sí', value: 'S' },
    { label: 'No', value: 'N' }
  ];

  constructor(private readonly router: Router,
              private readonly confirmationService: ConfirmationService,
              private readonly formBuilder: FormBuilder,
              private readonly usuarioService: UsuarioService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly messagesService: MessagesService,
              private readonly messageService: MessageService,
              private readonly tipoDocService: TipoDocService) {

    this.usuarioForm = this.formBuilder.group({
      id: [null],
      username: [''],
      nombres: ['', [Validators.required, Validators.maxLength(50)]],
      apePaterno: ['', [Validators.required, Validators.maxLength(100)]],
      apeMaterno: ['', [Validators.required, Validators.maxLength(100)]],
      fechaCambioClave: [null],
      indicadorExpiracion: ['', [Validators.required]],
      fechaExpiracionClave: [null],
      correo: ['', [Validators.required, Validators.maxLength(50)]],
      telefono: ['', [Validators.required, Validators.maxLength(250)]],
      codigoTipoDocumento: ['', [Validators.required]],
      numeroDocumento: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  guardar() {
    if (this.usuarioForm.valid) {
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
          this.usuarioRequest = {
            ...this.usuarioForm.value
          };

          if (this.usuarioRequest.id) {
            this.usuarioService.update(this.usuarioRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro actualizado satisfactoriamente.');
                this.router.navigate(['/usuario']);
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
            this.usuarioService.create(this.usuarioRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro guardado satisfactoriamente.');
                this.router.navigate(['/usuario']);
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
      this.usuarioForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.initializeBreadcrumb();
    this.loadModuloIfExists();
    this.loadTipoDocs();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.usuarioForm);
  }

  filterNumeric(event: Event): void {
    Util.filterNumeric(event, this.usuarioForm);
  }

  filterAlphanumericoSinEspacio(event: Event): void {
    Util.filterAlphanumericoSinEspacio(event, this.usuarioForm);
  }

  filterSpecialCharacters(event: Event): void {
    Util.filterSpecialCharacters(event, this.usuarioForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.usuarioForm);
  }

  navigateToFormEntorno() {
    this.router.navigate(['/usuario']);
  }

  private loadTipoDocs(): void {
    this.tipoDocService.getAllTipoDocumentos().subscribe(response => {
      this.tipoDocumentos = response;
    });
  }

  private initializeBreadcrumb(): void {
    this.items = [
      { label: 'Usuarios', routerLink: '/usuario' },
      { label: 'Formulario' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }

  private loadModuloIfExists(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        map(params => Number(params.get('id'))),
        filter(id => !!id),
        switchMap(id => this.usuarioService.getUsuario(id))
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
    this.usuarioResponse = response;

    this.usuarioForm.patchValue({
      id: this.usuarioResponse.id,
      username: this.usuarioResponse.username,
      nombres: this.usuarioResponse.nombres,
      apePaterno: this.usuarioResponse.apePaterno,
      apeMaterno: this.usuarioResponse.apeMaterno,
      fechaCambioClave: this.usuarioResponse.fechaCambioClave,
      indicadorExpiracion: this.usuarioResponse.indicadorExpiracion,
      fechaExpiracionClave: this.usuarioResponse.fechaExpiracionClave,
      correo: this.usuarioResponse.correo,
      telefono: this.usuarioResponse.telefono,
      numeroDocumento: this.usuarioResponse.numeroDocumento,
      codigoTipoDocumento: this.usuarioResponse.tipoDocumento.codigo
    });
  }
}