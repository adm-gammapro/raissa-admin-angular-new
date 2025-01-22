import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";
import { AplicacionEntornoRelacionResponse } from "../../../operativo/aplicacion/response/aplicacion-entorno-relacion-response";
import { ClienteResponse } from "./cliente-response";

export class ClienteAplicacionEntornoResponse {
    codigo!: number;
    cliente!: ClienteResponse;
    aplicacionEntorno!: AplicacionEntornoRelacionResponse;
    apiKey!: string;
    keyRpa!: string;
    secretRpa!: string;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}