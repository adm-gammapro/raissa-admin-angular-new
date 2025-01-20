import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { ModuloService } from '../../../../../service/modules/private/administrativo/modulo/modulo.service';
import { ModuloRequest } from '../../../../../apis/model/module/private/administrativo/modulo/request/modulo-request';
import { Util } from '../../../../../utils/util/util.util';
import { filter, map, switchMap } from 'rxjs';
import { AplicacionService } from '../../../../../service/modules/private/operativo/aplicacion/aplicacion.service';
import { AplicacionResponse } from '../../../../../apis/model/module/private/operativo/aplicacion/response/aplicacion.response';
import { ModuloResponse } from '../../../../../apis/model/module/private/administrativo/modulo/response/modulo-response';

@Component({
  selector: 'app-form-modulo',
  imports: [FormsModule,
      ReactiveFormsModule,
      CommonModule,
      HeaderComponent,
      ...PRIME_NG_MODULES],
    providers: [ConfirmationService, MessageService],
  templateUrl: './form-modulo.component.html',
  styleUrl: './form-modulo.component.scss'
})
export class FormModuloComponent {
  items: MenuItem[] | undefined;
  home: MenuItem | undefined;
  moduloRequest: ModuloRequest = new ModuloRequest();
  moduloResponse: ModuloResponse = new ModuloResponse();
  aplicaciones: AplicacionResponse[] = [];
  public moduloForm: FormGroup;

  constructor(private readonly router: Router,
              private readonly confirmationService: ConfirmationService,
              private readonly formBuilder: FormBuilder,
              private readonly moduloService: ModuloService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly messagesService: MessagesService,
              private readonly messageService: MessageService,
              private readonly aplicacionService: AplicacionService,) {

    this.moduloForm = this.formBuilder.group({
      codigo: [null],
      nombreModulo: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.required, Validators.maxLength(50)]],
      subtitulo: [''],
      icono: [''],
      codigoAplicacion: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  guardar() {
    if (this.moduloForm.valid) {
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
          this.moduloRequest = this.moduloForm.value;
        
          if (this.moduloRequest.codigo) {
            this.moduloService.update(this.moduloRequest).subscribe({
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
            this.moduloService.create(this.moduloRequest).subscribe({
              next: () => {
                this.messagesService.setMessage('Registro guardado satisfactoriamente.');
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
      this.moduloForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.initializeBreadcrumb();
    this.loadModuloIfExists();
    this.cargarAplicaciones();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.moduloForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.moduloForm);
  }

  navigateToFormEntorno() {
    this.router.navigate(['/modulo']);
  }

  private initializeBreadcrumb(): void {
    this.items = [
      { label: 'Módulos', routerLink: '/modulo' },
      { label: 'Form' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }

  private loadModuloIfExists(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        map(params => Number(params.get('id'))),
        filter(id => !!id), // Solo continuar si el id es válido (no nulo o 0)
        switchMap(id => this.moduloService.getModulo(id)) // Llamada al servicio
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
    this.moduloResponse = response;
  
    this.moduloForm.patchValue({
      codigo: response.codigo,
      nombreModulo: response.nombreModulo,
      descripcion: response.descripcion,
      subtitulo: response.subtitulo,
      icono: response.icono,
      codigoAplicacion: response.aplicacion.codigo
    });
  }

  private cargarAplicaciones(): void {
    this.aplicacionService.getAllAplicaciones().subscribe(response => {
      this.aplicaciones = response;
    });
    
  }
}
