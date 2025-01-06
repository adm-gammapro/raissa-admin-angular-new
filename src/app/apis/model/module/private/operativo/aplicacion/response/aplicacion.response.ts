import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";

export class AplicacionResponse {
    codigo!: string;
    descripcion!: string;
    ruta!: string;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}