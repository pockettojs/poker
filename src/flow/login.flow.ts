import { Connection } from "src/models/Connection";

let tempConnection: Connection;
export function setConnection(connection: Connection) {
    tempConnection = connection;
}
export function getConnection() {
    return tempConnection;
}

export async function saveConnection() {
    await tempConnection.save();
}