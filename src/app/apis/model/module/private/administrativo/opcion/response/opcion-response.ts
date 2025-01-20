import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";
import { ModuloResponse } from "../../modulo/response/modulo-response";

export class OpcionResponse {
    codigo!: number;
    descripcionOpcion!: string;
    rutaOpcion!: string;
    parteFija!: string;
    icono!: string;
    opcionPadre!: number;
    descripcionOpcionPadre!: string;
    numeroOrden!: number;
    modulo!: ModuloResponse;
    seleccionable!: string;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}