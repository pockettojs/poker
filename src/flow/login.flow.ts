import { Persistor } from "pocketto";
import { Connection } from "src/models/Connection";

let tempConnection: Connection;
class ConnectionPersistor extends Persistor {
}

export function setConnection(connection: Connection) {
    tempConnection = connection;
    ConnectionPersistor.set({
        name: connection.name,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
        enableEncryption: connection.enableEncryption,
    });
}
export function getConnection() {
    const data = ConnectionPersistor.get<any>();
    if (data) {
        tempConnection = new Connection();
        tempConnection.name = data.name;
        tempConnection.host = data.host;
        tempConnection.port = data.port;
        tempConnection.database = data.database;
        tempConnection.username = data.username;
        tempConnection.password = data.password;
        tempConnection.enableEncryption = data.enableEncryption;
    }
    return tempConnection;
}

export async function updateConnection(connection: Connection) {
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