import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output } from '@angular/core';
import { InstitucionfinancieraResponse } from '../../../../../apis/model/module/private/commons/response/institucion-financiera-response';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { ClienteService } from '../../../../../service/modules/private/administrativo/cliente/cliente.service';
import { ClienteInstitucionFinancieraRequest } from '../../../../../apis/model/module/private/administrativo/cliente/request/cliente-institucion-financiera-request';

@Component({
  selector: 'app-cliente-institucion-financiera',
  imports: [FormsModule,
        ReactiveFormsModule,
        CommonModule,
        ...PRIME_NG_MODULES],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './cliente-institucion-financiera.component.html',
  styleUrl: './cliente-institucion-financiera.component.scss'
})
export class ClienteInstitucionFinancieraComponent {
  codigoCliente!: number;
  institucionesNoAsignados!: InstitucionfinancieraResponse[];
  institucionesAsignados!: InstitucionfinancieraResponse[];
  @Output() cerrarModal = new EventEmitter<void>();

  constructor(private readonly clienteService: ClienteService,
        private readonly cdr: ChangeDetectorRef,
        private readonly messagesService: MessagesService
  ) {}

  cargarModelo(codigoCliente: number) {
    this.codigoCliente = codigoCliente;
    this.cargarInstitucionFinanciera(codigoCliente);
    this.cdr.markForCheck();
  }

  cargarInstitucionFinanciera(codigoCliente: number): void {
    this.clienteService.getClienteInstitucionFinanciera(codigoCliente).subscribe(response => {
      this.institucionesAsignados = response.listBancosVinculados;
      this.institucionesNoAsignados = response.listBancosNoVinculados;
    });
  }

  guardarListas() {
    let clienteInstitucionVincular: ClienteInstitucionFinancieraRequest = new ClienteInstitucionFinancieraRequest();
    let clienteInstitucionDesvincular: ClienteInstitucionFinancieraRequest = new ClienteInstitucionFinancieraRequest();

    let diferentesA;
    let diferentesB;

    let institucionesNoAsignados!: InstitucionfinancieraResponse[];
    let institucionesAsignados!: InstitucionfinancieraResponse[];

    this.clienteService.getClienteInstitucionFinanciera(this.codigoCliente).subscribe(response => {
      institucionesAsignados = response.listBancosVinculados;
      diferentesA = this.institucionesAsignados.filter(itemA => !institucionesAsignados.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesA.length > 0) {
        const idsAsignados: string[] = diferentesA.map(institucion => institucion.codigo);

        clienteInstitucionVincular.codigoInstitucionFinanciera = idsAsignados;
        clienteInstitucionVincular.codigoCliente = [this.codigoCliente];

        this.clienteService.vincularInstitucionesFinancieras(clienteInstitucionVincular).subscribe();
      }

      institucionesNoAsignados = response.listBancosNoVinculados;
      diferentesB = this.institucionesNoAsignados.filter(itemA => !institucionesNoAsignados.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesB.length > 0) {
        const idsNoAsignados: string[] = diferentesB.map(institucion => institucion.codigo);

        clienteInstitucionDesvincular.codigoInstitucionFinanciera = idsNoAsignados;
        clienteInstitucionDesvincular.codigoCliente = [this.codigoCliente];

        this.clienteService.desvincularInstitucionesFinancieras(clienteInstitucionDesvincular).subscribe();
      }
    });

    this.cerrar();

    this.messagesService.setMessage('Registro guardado satisfactoriamente.');
  }

  cerrar(): void {
    this.cerrarModal.emit(); // Emitir un evento para cerrar el modal
  }
}
