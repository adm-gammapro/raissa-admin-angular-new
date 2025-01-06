import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";

export class AplicacionRequest {
    codigo!: string;
    descripcion!: string;
    ruta!: string;
    estadoRegistro!: EstadoRegistroEnum;
}