import { DatabaseManager, PouchDBConfig, setDefaultDbName, setEnvironement } from "pocket";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "src/components/Button";
import Input from "src/components/Input";
import { getConnections, saveConnection, setConnection } from "src/flow/login.flow";
import { Connection } from "src/models/Connection";

function LoginPage() {
    const [name, setName] = useState("")
    const [host, setHost] = useState("localhost")
    const [port, setPort] = useState("5984")
    const [database, setDatabase] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [connections, setConnections] = useState<Connection[]>([])

    const navigate = useNavigate();

    useEffect(() => {
        setEnvironement('browser');

        DatabaseManager.connect('default', {
            dbName: 'default',
            silentConnect: true,
        }).then(() => {
            getConnections().then((connections) => {
                setConnections(connections)
            });
        })
    });

    async function updateConnection() {
        const connection = new Connection();
        connection.name = name
        connection.host = host
        connection.port = port
        connection.database = database
        connection.username = username
        connection.password = password
        setConnection(connection)
    }

    return <div className="w-screen h-screen flex justify-center items-center bg-slate-100 dark:bg-slate-900">
        <div className="w-full sm:w-full md:w-1/4 lg:1/3 h-[600px] rounded-lg bg-white dark:bg-slate-800 p-4">
            <div className="font-bold text-xl dark:text-white">Poker Login</div>
            <div className="h-6"></div>
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
                placeholder="db"
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
            <div className="h-4"></div>
            <div className="container mx-auto">
                <div className="flex overflow-x-auto gap-4">
                    {
                        connections.map((connection, index) => {
                            return <div
                                key={index}
                                className="cursor-pointer flex-none w-24 h-[60px] rounded-md bg-[#fcba03] text-white shadow-md pl-2"
                                onClick={() => {
                                    setName(connection.name)
                                    setHost(connection.host)
                                    setPort(connection.port)
                                    setDatabase(connection.database)
                                    if (connection.username) {
                                        setUsername(connection.username)
                                    }
                                    setPassword(connection.password)
                                }}
                            >
                                <div>{connection.name}</div>
                                <div className="text-ellipsis text-xs">{connection.database}</div>
                            </div>
                        })
                    }
                </div>
            </div>
            <div className="h-8"></div>
            <div className="grid grid-cols-3 gap-4">
                <Button type="outline" color="red" onClick={async () => {
                    await updateConnection();
                    await saveConnection();
                    setDefaultDbName(name);
                }}>Save</Button>
                <Button type="outline" color="green">Connect</Button>
                <Button type="outline" color="blue" onClick={async () => {
                    await updateConnection();
                    const url = `http://${username}:${password}@${host}${port === '80' ? '' : ':' + port}/${database}`
                    const config = {} as PouchDBConfig;
                    if (username && password) {
                        config.auth = {
                            username,
                            password
                        };
                    }
                    if (name) {
                        config.dbName = name;
                    }
                    if (password) {
                        config.password = password;
                    }
                    await DatabaseManager.connect(url, config);
                    setDefaultDbName(name);
                    navigate('/home');
                }}>Login</Button>
            </div>
        </div>
    </div >;
}

export default LoginPage;