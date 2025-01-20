import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output } from '@angular/core';
import { AplicacionService } from '../../../../../service/modules/private/operativo/aplicacion/aplicacion.service';
import { EntornoResponse } from '../../../../../apis/model/module/private/operativo/entorno/response/entorno-response';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { AplicacionEntornoRequest } from '../../../../../apis/model/module/private/operativo/aplicacion/request/aplicacion-entorno-request';

@Component({
  selector: 'app-aplicacion-entorno',
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './aplicacion-entorno.component.html',
  styleUrl: './aplicacion-entorno.component.scss'
})
export class AplicacionEntornoComponent {
  codigoAplicacion!: string;
  entornosNoAsignados!: EntornoResponse[];
  entornosAsignados!: EntornoResponse[];
  @Output() cerrarModal = new EventEmitter<void>();

  constructor(private readonly aplicacionService: AplicacionService,
    private readonly cdr: ChangeDetectorRef,
        private readonly messagesService: MessagesService
  ) {}

  cargarModelo(codigoAplicacion: string) {
    this.codigoAplicacion = codigoAplicacion;
    this.cargarEntornos(codigoAplicacion);
    this.cdr.markForCheck();
  }

  cargarEntornos(codigoAplicacion: string): void {
    this.aplicacionService.getAplicacionEntorno(codigoAplicacion).subscribe(response => {
      this.entornosAsignados = response.entornosVinculados;
      this.entornosNoAsignados = response.entornosNoVinculados;
    });
  }

  guardarListas() {
    let aplicacionEntornoVincular: AplicacionEntornoRequest = new AplicacionEntornoRequest();
    let aplicacionEntornoDesvincular: AplicacionEntornoRequest = new AplicacionEntornoRequest();

    let diferentesA;
    let diferentesB;

    let entornosNoAsignados!: EntornoResponse[];
    let entornosAsignados!: EntornoResponse[];

    this.aplicacionService.getAplicacionEntorno(this.codigoAplicacion).subscribe(response => {
      entornosAsignados = response.entornosVinculados;
      diferentesA = this.entornosAsignados.filter(itemA => !entornosAsignados.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesA.length > 0) {
        const idsAsignados: string[] = diferentesA.map(entorno => entorno.codigo);

        aplicacionEntornoVincular.codigoEntorno = idsAsignados;
        aplicacionEntornoVincular.codigoAplicacion = [this.codigoAplicacion];

        this.aplicacionService.vincularEntornos(aplicacionEntornoVincular).subscribe();
      }

      entornosNoAsignados = response.entornosNoVinculados;
      diferentesB = this.entornosNoAsignados.filter(itemA => !entornosNoAsignados.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesB.length > 0) {
        const idsNoAsignados: string[] = diferentesB.map(entorno => entorno.codigo);

        aplicacionEntornoDesvincular.codigoEntorno = idsNoAsignados;
        aplicacionEntornoDesvincular.codigoAplicacion = [this.codigoAplicacion];

        this.aplicacionService.desvincularEntornos(aplicacionEntornoDesvincular).subscribe();
      }
    });

    this.cerrar();

    this.messagesService.setMessage('Registro guardado satisfactoriamente.');
  }

  cerrar(): void {
    this.cerrarModal.emit(); // Emitir un evento para cerrar el modal
  }
}
