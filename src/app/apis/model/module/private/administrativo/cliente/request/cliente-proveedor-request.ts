export class ClienteProveedorRequest {
    codigoCliente!: number[];
    codigoProveedor!: string[];

    constructor() {
        this.codigoCliente = [];
        this.codigoProveedor = [];
    }
}