import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";
import { TipoClienteResponse } from "./tipo-cliente-response";

export class ClienteResponse {
    codigo!: number;
    razonSocial!: string;
    ruc!: string;
    tipoCliente!: TipoClienteResponse;
    direccion!: string;
    telefonoFijo!: string;
    telefonoCelular!: string;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}