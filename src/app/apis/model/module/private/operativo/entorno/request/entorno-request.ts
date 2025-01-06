import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";

export class EntornoRequest {
    codigo!: string;
    descripcion!: string;
    estadoRegistro!: EstadoRegistroEnum;
}