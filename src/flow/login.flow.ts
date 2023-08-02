import { Connection } from "src/models/Connection";

let tempConnection: Connection;
export function setConnection(connection: Connection) {
    tempConnection = connection;
}
export function getConnection() {
    return tempConnection;
}

export async function updateConnection(connection: Connection) {
    console.log(connection);
    await connection.save();
}

export async function saveConnection() {
    await Connection.where('name', tempConnection.name).delete();
    await tempConnection.save();
}

export async function getConnections() {
    return Connection.all();
}

export async function deleteConnection(id: string) {
    await Connection.where('id', id).delete();
}