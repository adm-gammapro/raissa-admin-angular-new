export class UsuarioRequest {
    id!: number;
    username!: string;
    nombres!: string;
    apePaterno!: string;
    apeMaterno!: string;
    password!: string;
    fechaCambioClave!: Date;
    indicadorExpiracion!: string;
    fechaExpiracionClave!: Date;
    correo!: string;
    telefono!: string;
    codigoTipoDocumento!: string;
    numeroDocumento!: string;
}