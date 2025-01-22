import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../../../config/primeNg/primeng-global-imports';
import { ServicioResponse } from '../../../../../../apis/model/module/private/operativo/servicio/response/servicio-response';
import { ClienteService } from '../../../../../../service/modules/private/administrativo/cliente/cliente.service';
import { MessagesService } from '../../../../../../service/commons/messages.service';
import { ClienteAplicacionEntornoServicioRequest } from '../../../../../../apis/model/module/private/administrativo/cliente/request/cliente-aplicacion-entorno-servicio-request';

@Component({
  selector: 'app-cliente-servicio',
  imports: [FormsModule,
          ReactiveFormsModule,
          CommonModule,
          ...PRIME_NG_MODULES],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './cliente-servicio.component.html',
  styleUrl: './cliente-servicio.component.scss'
})
export class ClienteServicioComponent {
  codigoClienteAplicacionEntorno!: number;
  serviciosNoAsignados!: ServicioResponse[];
  serviciosAsignados!: ServicioResponse[];
  @Output() cerrarModal = new EventEmitter<void>();

  constructor(private readonly clienteService: ClienteService,
        private readonly cdr: ChangeDetectorRef,
        private readonly messagesService: MessagesService
  ) {}

  cargarModelo(codigoClienteAplicacionEntorno: number) {
    this.codigoClienteAplicacionEntorno = codigoClienteAplicacionEntorno;
    this.cargarServicio(codigoClienteAplicacionEntorno);
    this.cdr.markForCheck();
  }

  cargarServicio(codigoClienteAplicacionEntorno: number): void {
    this.clienteService.getClienteAplicacionEntornoServicio(codigoClienteAplicacionEntorno).subscribe(response => {
      this.serviciosAsignados = response.serviciosVinculados;
      this.serviciosNoAsignados = response.serviciosNoVinculados;
    });
  }

  guardarListas() {
    
    let serviciosVincular: ClienteAplicacionEntornoServicioRequest = new ClienteAplicacionEntornoServicioRequest();
    let serviciosDesvincular: ClienteAplicacionEntornoServicioRequest = new ClienteAplicacionEntornoServicioRequest();

    let diferentesA;
    let diferentesB;

    let serviciosNoAsignados!: ServicioResponse[];
    let serviciosAsignados!: ServicioResponse[];

    this.clienteService.getClienteAplicacionEntornoServicio(this.codigoClienteAplicacionEntorno).subscribe(response => {
      serviciosAsignados = response.serviciosVinculados;
      diferentesA = this.serviciosAsignados.filter(itemA => !serviciosAsignados.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesA.length > 0) {
        const idsAsignados: number[] = diferentesA.map(servicio => servicio.codigo);

        serviciosVincular.codigoServicios = idsAsignados;
        serviciosVincular.codigoAplicacionClientes = [this.codigoClienteAplicacionEntorno];

        this.clienteService.vincularClienteAplicacionEntornoServicio(serviciosVincular).subscribe();
      }

      serviciosNoAsignados = response.serviciosNoVinculados;
      diferentesB = this.serviciosNoAsignados.filter(itemA => !serviciosNoAsignados.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesB.length > 0) {
        const idsNoAsignados: number[] = diferentesB.map(servicio => servicio.codigo);

        serviciosDesvincular.codigoServicios = idsNoAsignados;
        serviciosDesvincular.codigoAplicacionClientes = [this.codigoClienteAplicacionEntorno];

        this.clienteService.desvincularClienteAplicacionEntornoServicio(serviciosDesvincular).subscribe();
      }
    });

    this.cerrar();

    this.messagesService.setMessage('Registro guardado satisfactoriamente.');
  }

  cerrar(): void {
    this.cerrarModal.emit(); // Emitir un evento para cerrar el modal
  }
}
