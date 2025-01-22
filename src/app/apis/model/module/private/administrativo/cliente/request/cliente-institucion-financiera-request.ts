export class ClienteInstitucionFinancieraRequest {
    codigoCliente!: number[];
    codigoInstitucionFinanciera!: string[];

    constructor() {
        this.codigoCliente = [];
        this.codigoInstitucionFinanciera = [];
    }
}