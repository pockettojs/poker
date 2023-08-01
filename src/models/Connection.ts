import { Model, PocketModel } from "pocket";

@PocketModel
export class Connection extends Model {
    name!: string;
    host!: string;
    port!: string;
    database!: string;
    username?: string;
    password!: string;
}