import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";

export class EntornoResponse {
    codigo!: string;
    descripcion!: string;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}