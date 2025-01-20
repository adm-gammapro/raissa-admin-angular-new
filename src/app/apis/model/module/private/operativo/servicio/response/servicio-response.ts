import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";
import { TipoServicioResponse } from "../../../commons/response/tipo-servicio-response";
import { AplicacionResponse } from "../../aplicacion/response/aplicacion.response";

export class ServicioResponse {
    codigo!: number;
    nombre!: string;
    aplicacion!: AplicacionResponse;
    esJob!: boolean;
    tipoServicio!: TipoServicioResponse;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}