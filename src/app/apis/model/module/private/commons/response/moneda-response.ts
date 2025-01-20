export class MonedaResponse {
    valor: string;
    descripcion: string;

    constructor(valor: string, descripcion: string) {
        this.valor = valor;
        this.descripcion = descripcion;
    }
    
    static readonly monedas: MonedaResponse[] = [
        new MonedaResponse('1', 'Soles'),
        new MonedaResponse('2', 'Dólares'),
    ];
}