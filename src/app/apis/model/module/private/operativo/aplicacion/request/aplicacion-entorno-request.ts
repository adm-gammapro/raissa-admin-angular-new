export class AplicacionEntornoRequest {
    codigoEntorno!: string[];
    codigoAplicacion!: string[];

    constructor() {
        this.codigoEntorno = [];
        this.codigoAplicacion = [];
    }
}