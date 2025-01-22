import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { OpcionResponse } from '../../../../../apis/model/module/private/administrativo/opcion/response/opcion-response';
import { PerfilService } from '../../../../../service/modules/private/administrativo/perfil/perfil.service';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { PerfilOpcionRequest } from '../../../../../apis/model/module/private/administrativo/perfil/request/perfil-opcion-request';

@Component({
  selector: 'app-perfil-opcion',
  imports: [FormsModule,
      ReactiveFormsModule,
      CommonModule,
      ...PRIME_NG_MODULES],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './perfil-opcion.component.html',
  styleUrl: './perfil-opcion.component.scss'
})
export class PerfilOpcionComponent {
  codigoPerfil!: number;
  opcionesNoAsignados!: OpcionResponse[];
  opcionesAsignados!: OpcionResponse[];
  @Output() cerrarModal = new EventEmitter<void>();

  constructor(private readonly perfilService: PerfilService,
    private readonly cdr: ChangeDetectorRef,
        private readonly messagesService: MessagesService
  ) {}

  cargarModelo(codigoPerfil: number) {
    this.codigoPerfil = codigoPerfil;
    this.cargarPerfiles(codigoPerfil);
    this.cdr.markForCheck();
  }

  cargarPerfiles(codigoPerfil: number): void {
    this.perfilService.getPerfilOpcion(codigoPerfil).subscribe(response => {
      this.opcionesAsignados = response.opcionesVinculados;
      this.opcionesNoAsignados = response.opcionesNoVinculados;
    });
  }

  guardarListas() {
    let perfilOpcionVincular: PerfilOpcionRequest = new PerfilOpcionRequest();
    let perfilOpcionDesvincular: PerfilOpcionRequest = new PerfilOpcionRequest();

    let diferentesA;
    let diferentesB;

    let opcionesNoAsignados!: OpcionResponse[];
    let opcionesAsignados!: OpcionResponse[];

    this.perfilService.getPerfilOpcion(this.codigoPerfil).subscribe(response => {
      opcionesAsignados = response.opcionesVinculados;
      diferentesA = this.opcionesAsignados.filter(itemA => !opcionesAsignados.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesA.length > 0) {
        const idsAsignados: number[] = diferentesA.map(entorno => entorno.codigo);

        perfilOpcionVincular.codigoOpcion = idsAsignados;
        perfilOpcionVincular.codigoPerfil = [this.codigoPerfil];

        this.perfilService.vincularOpciones(perfilOpcionVincular).subscribe();
      }

      opcionesNoAsignados = response.opcionesNoVinculados;
      diferentesB = this.opcionesNoAsignados.filter(itemA => !opcionesNoAsignados.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesB.length > 0) {
        const idsNoAsignados: number[] = diferentesB.map(entorno => entorno.codigo);

        perfilOpcionDesvincular.codigoOpcion = idsNoAsignados;
        perfilOpcionDesvincular.codigoPerfil = [this.codigoPerfil];

        this.perfilService.desvincularOpciones(perfilOpcionDesvincular).subscribe();
      }
    });

    this.cerrar();

    this.messagesService.setMessage('Registro guardado satisfactoriamente.');
  }

  cerrar(): void {
    this.cerrarModal.emit(); // Emitir un evento para cerrar el modal
  }
}
