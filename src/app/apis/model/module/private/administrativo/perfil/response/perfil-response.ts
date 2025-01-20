import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";
import { AplicacionResponse } from "../../../operativo/aplicacion/response/aplicacion.response";


export class PerfilResponse {
    codigo!: number;
    descripcion!: string;
    abreviatura!: string;
    nombreComercial!: string;
    aplicacion!: AplicacionResponse;
    fechaCaducidad!: string;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}