import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output } from '@angular/core';
import { ProveedorResponse } from '../../../../../apis/model/module/private/operativo/proveedor/response/proveedor-response';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ClienteService } from '../../../../../service/modules/private/administrativo/cliente/cliente.service';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { ClienteProveedorRequest } from '../../../../../apis/model/module/private/administrativo/cliente/request/cliente-proveedor-request';

@Component({
  selector: 'app-cliente-proveedor',
  imports: [FormsModule,
          ReactiveFormsModule,
          CommonModule,
          ...PRIME_NG_MODULES],
      providers: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './cliente-proveedor.component.html',
  styleUrl: './cliente-proveedor.component.scss'
})
export class ClienteProveedorComponent {
  codigoCliente!: number;
  proveedoresNoAsignados!: ProveedorResponse[];
  proveedoresAsignados!: ProveedorResponse[];
  @Output() cerrarModal = new EventEmitter<void>();

  constructor(private readonly clienteService: ClienteService,
        private readonly cdr: ChangeDetectorRef,
        private readonly messagesService: MessagesService
  ) {}

  cargarModelo(codigoCliente: number) {
    this.codigoCliente = codigoCliente;
    this.cargarProveedor(codigoCliente);
    this.cdr.markForCheck();
  }

  cargarProveedor(codigoCliente: number): void {
    this.clienteService.getClienteProveedor(codigoCliente).subscribe(response => {
      this.proveedoresAsignados = response.proveedoresVinculados;
      this.proveedoresNoAsignados = response.proveedoresNoVinculados;
    });
  }

  guardarListas() {
    let proveedorVincular: ClienteProveedorRequest = new ClienteProveedorRequest();
    let proveedorDesvincular: ClienteProveedorRequest = new ClienteProveedorRequest();

    let diferentesA;
    let diferentesB;

    let proveedoresNoAsignados!: ProveedorResponse[];
    let proveedoresAsignados!: ProveedorResponse[];

    this.clienteService.getClienteProveedor(this.codigoCliente).subscribe(response => {
      proveedoresAsignados = response.proveedoresVinculados;
      diferentesA = this.proveedoresAsignados.filter(itemA => !proveedoresAsignados.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesA.length > 0) {
        const idsAsignados: string[] = diferentesA.map(institucion => institucion.codigo);

        proveedorVincular.codigoProveedor = idsAsignados;
        proveedorVincular.codigoCliente = [this.codigoCliente];

        this.clienteService.vincularProveedores(proveedorVincular).subscribe();
      }

      proveedoresNoAsignados = response.proveedoresNoVinculados;
      diferentesB = this.proveedoresNoAsignados.filter(itemA => !proveedoresNoAsignados.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesB.length > 0) {
        const idsNoAsignados: string[] = diferentesB.map(institucion => institucion.codigo);

        proveedorDesvincular.codigoProveedor = idsNoAsignados;
        proveedorDesvincular.codigoCliente = [this.codigoCliente];

        this.clienteService.desvincularProveedores(proveedorDesvincular).subscribe();
      }
    });

    this.cerrar();

    this.messagesService.setMessage('Registro guardado satisfactoriamente.');
  }

  cerrar(): void {
    this.cerrarModal.emit(); // Emitir un evento para cerrar el modal
  }
}
