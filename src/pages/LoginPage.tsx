import { DatabaseManager, PouchDBConfig, setDefaultDbName, setEnvironement } from "pocket";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "src/components/Button";
import Input from "src/components/Input";
import { getConnections, saveConnection, setConnection } from "src/flow/login.flow";
import { Connection } from "src/models/Connection";
import { setPassword as setEncryptionPassword } from 'src/helpers/encryption';
import Alert from "src/components/Alert";

function LoginPage() {
    const [name, setName] = useState("")
    const [host, setHost] = useState("localhost")
    const [port, setPort] = useState("5984")
    const [database, setDatabase] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [connections, setConnections] = useState<Connection[]>()

    const [alert, setAlert] = useState<any>();
    const [showAlert, setShowAlert] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        setEnvironement('browser');

        if (!connections) {
            DatabaseManager.connect('default', {
                dbName: 'default',
                silentConnect: true,
            }).then(() => {
                getConnections().then((connections) => {
                    setConnections(connections)
                });
            })
        }
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

    async function establishConnection() {
        const http = host.startsWith('https://') ? 'https://' : 'http://';
        const hostWithoutProtocol = host.startsWith('http://') ? host.substring(7) : (host.startsWith('https://') ? host.substring(8) : host);
        const url = `${http}${username}:${password}@${hostWithoutProtocol}${port === '80' ? '' : ':' + port}/${database}`
        console.log('url: ', url);
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
        const db = await DatabaseManager.connect(url, config);
        setEncryptionPassword(password)
        setDefaultDbName(name);
        return db;
    }

    return <div>
        {
            showAlert && alert
        }
        <div className="w-screen h-screen flex justify-center items-center bg-slate-100 dark:bg-slate-900">
            <div className="w-full sm:w-full md:w-1/4 lg:1/3 h-[650px] rounded-lg bg-white dark:bg-slate-800 p-4">
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
                <div className="h-4"></div>
                <div className="container mx-auto">
                    <div className="flex overflow-x-auto gap-4">
                        {
                            connections && connections.map((connection, index) => {
                                return <div
                                    key={index}
                                    className="relative z-10 cursor-pointer flex-none w-24 h-[40px] rounded-md border-slate-300  border shadow-md pl-2"
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
                                    <div className="font-bold text-sm dark:text-white">{connection.name}</div>
                                    <div className="text-ellipsis text-xs text-slate-500 dark:text-white">{(connection.database || '').substring((connection.database || '').length - 8, (connection.database || '').length - 1)}</div>
                                </div>
                            })
                        }
                        {
                            (!connections || connections.length === 0) && <div className="h-[40px]"></div>
                        }
                    </div>
                </div>
                <div className="ml-1 mt-1 text-xs dark:text-slate-200">
                    Scroll right to show more connections
                </div>
                <div className="ml-1 text-xs dark:text-blue-400 cursor-pointer text-blue-600 underline" onClick={() => {
                    navigate('/favorites');
                }}>
                    Manage Favorites
                </div>
                <div className="h-8"></div>
                <div className="grid grid-cols-3 gap-4">
                    <Button type="outline" color="red" onClick={async () => {
                        await updateConnection();
                        await saveConnection();
                        const connections = await getConnections();
                        setConnections(connections);
                        setDefaultDbName(name);
                    }}>Save</Button>
                    <Button type="outline" color="green" onClick={async () => {
                        await updateConnection();
                        const db = await establishConnection();
                        db.allDocs().then(() => {
                            setAlert(<Alert type="success" message={'Connect successfully!'}></Alert>);
                            setShowAlert(true);
                            setTimeout(() => {
                                setAlert(undefined);
                                setShowAlert(false);
                            }, 4000);
                        }).catch(() => {
                            setAlert(<Alert type="error" message={'Connect failed.'}></Alert>);
                            setShowAlert(true);
                            setTimeout(() => {
                                setAlert(undefined);
                                setShowAlert(false);
                            }, 4000);
                        });

                    }}>Connect</Button>
                    <Button type="outline" color="blue" onClick={async () => {
                        await updateConnection();
                        await establishConnection();
                        navigate('/home');
                    }}>Login</Button>
                </div>
            </div>
        </div>
    </div>;
}

export default LoginPage;