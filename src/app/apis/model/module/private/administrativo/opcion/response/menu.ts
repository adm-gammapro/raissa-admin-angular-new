import { Modulo } from "../../../modulo";

export class Menu {
    codigo: number;
    descripcionOpcion: string;
    rutaOpcion: string;
    parteFija: string;
    icono: string;
    opcionPadre: number;
    descripcionOpcionPadre: string;
    numeroOrden: number;
    modulo: Modulo = new Modulo();
    estadoRegistro: string;
    seleccionable: string;
    audiFechIns: string;

    constructor() {
        this.codigo = 0;
        this.descripcionOpcion = "";
        this.rutaOpcion = "";
        this.parteFija = "";
        this.icono = "";
        this.opcionPadre = 0;
        this.descripcionOpcionPadre = "";
        this.numeroOrden = 0;
        this.estadoRegistro = "";
        this.seleccionable = "";
        this.audiFechIns = "";
    }
}