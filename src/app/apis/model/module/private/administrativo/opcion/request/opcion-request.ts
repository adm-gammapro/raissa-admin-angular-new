import { ModuloRequest } from "../../modulo/request/modulo-request";

export class OpcionRequest {
    codigo!: number;
    descripcionOpcion!: string;
    rutaOpcion!: string;
    parteFija!: string;
    icono!: string;
    opcionPadre!: number;
    descripcionOpcionPadre!: string;
    numeroOrden!: number;
    modulo!: ModuloRequest;
    seleccionable!: string;
}