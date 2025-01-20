import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";

export class ModuloRequest {
    codigo!: number;
    nombreModulo!: string;
    descripcion!: string;
    subtitulo!: string;
    icono!: string;
    codigoAplicacion!: string;
    estadoRegistro!: EstadoRegistroEnum;
}