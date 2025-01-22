export class ClienteAplicacionEntornoServicioRequest {
    codigoAplicacionClientes!: number[];
    codigoServicios!: number[];

    constructor() {
        this.codigoAplicacionClientes = [];
        this.codigoServicios = [];
    }
}