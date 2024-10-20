import { Model, Relational } from "pocketto";

@Relational
export class Connection extends Model {
    static dbName = 'default';
    name!: string;
    host!: string;
    port!: string;
    database!: string;
    username?: string;
    password!: string;
    enableEncryption!: boolean;
}