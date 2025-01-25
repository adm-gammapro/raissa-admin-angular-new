import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { PerfilResponse } from '../../../../../apis/model/module/private/administrativo/perfil/response/perfil-response';
import { PerfilRequest } from '../../../../../apis/model/module/private/administrativo/perfil/request/perfil-request';
import { AplicacionResponse } from '../../../../../apis/model/module/private/operativo/aplicacion/response/aplicacion.response';
import { PerfilService } from '../../../../../service/modules/private/administrativo/perfil/perfil.service';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { AplicacionService } from '../../../../../service/modules/private/operativo/aplicacion/aplicacion.service';
import { Util } from '../../../../../utils/util/util.util';

@Component({
  selector: 'app-form-perfil',
  imports: [FormsModule,
        ReactiveFormsModule,
        CommonModule,
        HeaderComponent,
        ...PRIME_NG_MODULES],
      providers: [ConfirmationService, MessageService],
  templateUrl: './form-perfil.component.html',
  styleUrl: './form-perfil.component.scss'
})
export class FormPerfilComponent {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  perfilRequest: PerfilRequest = new PerfilRequest();
  perfilResponse: PerfilResponse = new PerfilResponse();
  aplicaciones: AplicacionResponse[] = [];
  public perfilForm: FormGroup;

  constructor(private readonly router: Router,
              private readonly confirmationService: ConfirmationService,
              private readonly formBuilder: FormBuilder,
              private readonly perfilService: PerfilService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly messagesService: MessagesService,
              private readonly messageService: MessageService,
              private readonly aplicacionService: AplicacionService) {

    this.perfilForm = this.formBuilder.group({
      codigo: [null],
      descripcion: ['', [Validators.required, Validators.maxLength(50)]],
      abreviatura: ['', [Validators.required, Validators.maxLength(50)]],
      nombreComercial: [''],
      codigoAplicacion: ['', [Validators.required]],
      fechaCaducidad: [null],
    });
  }

  guardar() {
    if (this.perfilForm.valid) {
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
          this.perfilRequest = this.perfilForm.value;
        
          if (this.perfilRequest.codigo) {
            this.perfilService.update(this.perfilRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro actualizado satisfactoriamente.');
                this.router.navigate(['/perfil']);
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
            this.perfilService.create(this.perfilRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro guardado satisfactoriamente.');
                this.router.navigate(['/perfil']);
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
      this.perfilForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.initializeBreadcrumb();
    this.loadModuloIfExists();
    this.cargarAplicaciones();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.perfilForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.perfilForm);
  }

  navigateToFormEntorno() {
    this.router.navigate(['/perfil']);
  }

  private initializeBreadcrumb(): void {
    this.items = [
      { label: 'Perfiles', routerLink: '/perfil' },
      { label: 'Form' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }

  private loadModuloIfExists(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        map(params => Number(params.get('id'))),
        filter(id => !!id),
        switchMap(id => this.perfilService.getPerfil(id)) 
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
    this.perfilResponse = response;
  
    this.perfilForm.patchValue({
      codigo: response.codigo,
      descripcion: response.descripcion,
      abreviatura: response.abreviatura,
      nombreComercial: response.nombreComercial,
      codigoAplicacion: response.aplicacion.codigo,
      fechaCaducidad: response.fechaCaducidad,
    });
  }

  private cargarAplicaciones(): void {
    this.aplicacionService.getAllAplicaciones().subscribe(response => {
      this.aplicaciones = response;
    });
    
  }
}
