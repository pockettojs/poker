import { DatabaseManager } from "pocket";
import { useEffect, useState } from "react";
import Button from "src/components/Button";
import Input from "src/components/Input";
import { deleteConnection, getConnections, saveConnection, setConnection } from "src/flow/login.flow";
import { Connection } from "src/models/Connection";

function ConnectionList() {
    const [connections, setConnections] = useState<Connection[]>();
    const [currentConnection, setCurrentConnection] = useState<Connection>();

    const [name, setName] = useState("")
    const [host, setHost] = useState("")
    const [port, setPort] = useState("")
    const [database, setDatabase] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        if (!connections) {
            DatabaseManager.connect('default', {
                dbName: 'default',
                silentConnect: true,
            }).then(() => {
                getConnections().then((connections) => {
                    setConnections(connections);
                });
            });
        }
    }, [connections])

    return <div>
        <div className="w-screen h-screen bg-slate-100 dark:bg-slate-900 flex">
            <div className="w-1/6 p-4">
                <div className="ml-2 mb-2 text-lg">Favorites</div>
                <div className="ml-2 space-y-2 text-md">
                    {
                        connections && connections.map((connection) => {
                            return <div
                                key={connection.id}
                                className="w-full cursor-pointer"
                                onClick={() => {
                                    setCurrentConnection(connection);
                                    setConnection(connection);
                                    setName(connection.name);
                                    setHost(connection.host);
                                    setPort(connection.port);
                                    setDatabase(connection.database);
                                    if (connection.username) setUsername(connection.username);
                                    setPassword(connection.password);
                                }}
                            >
                                <div className="text-slate-900 dark:text-white">{connection.name}</div>
                            </div>
                        })
                    }
                </div>
            </div>
            <div className="w-5/6 overflow-x-auto bg-white dark:bg-slate-800 shadow-sm rounded-lg p-4">
                {
                    currentConnection && <div>
                        <Input
                            size="sm"
                            label="Name"
                            placeholder="home"
                            value={name}
                            onChange={(text) => setName(text)}
                        />
                        <div className="h-4"></div>
                        <Input
                            size="sm"
                            label="Host"
                            placeholder="localhost"
                            value={host}
                            onChange={(text) => setHost(text)}
                        />
                        <div className="h-4"></div>
                        <Input
                            size="sm"
                            label="Port"
                            placeholder="5984"
                            value={port}
                            onChange={(text) => setPort(text)}
                        />
                        <div className="h-4"></div>
                        <Input
                            size="sm"
                            label="Database"
                            placeholder="database"
                            value={database}
                            onChange={(text) => setDatabase(text)}
                        />
                        <div className="h-4"></div>
                        <Input
                            size="sm"
                            label="Username"
                            placeholder="username"
                            value={username}
                            onChange={(text) => setUsername(text)}
                        />
                        <div className="h-4"></div>
                        <Input
                            size="sm"
                            label="Password"
                            placeholder="password"
                            value={password}
                            onChange={(text) => setPassword(text)}
                        />
                        <div className="h-8"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <Button color="blue" onClick={async () => {
                                currentConnection.name = name;
                                currentConnection.host = host;
                                currentConnection.port = port;
                                currentConnection.database = database;
                                currentConnection.username = username;
                                currentConnection.password = password;
                                await currentConnection.save();
                            }}>Update</Button>
                            <Button color="red" onClick={() => {
                                deleteConnection(currentConnection.id);
                                setCurrentConnection(undefined);
                                getConnections().then((connections) => {
                                    setConnections(connections);
                                });
                            }}>Delete</Button>
                        </div>
                    </div>
                }
            </div>
        </div>
    </div >
}

export default ConnectionList;