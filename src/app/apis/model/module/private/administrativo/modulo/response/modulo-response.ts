import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";
import { AplicacionResponse } from "../../../operativo/aplicacion/response/aplicacion.response";

export class ModuloResponse {
    codigo!: number;
    nombreModulo!: string;
    descripcion!: string;
    subtitulo!: string;
    icono!: string;
    aplicacion!: AplicacionResponse;
    estadoRegistro!: EstadoRegistroEnum;
}