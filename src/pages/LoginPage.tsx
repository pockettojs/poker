import { DatabaseManager, PouchDBConfig, setDefaultDbName, setEnvironment } from "pocketto";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "src/components/Button";
import Input from "src/components/Input";
import { getConnection, getConnections, saveConnection, setConnection } from "src/flow/login.flow";
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
    const [enableEncryption, setEnableEncryption] = useState(false)
    const [connections, setConnections] = useState<Connection[]>()

    const [alert, setAlert] = useState<any>();
    const [showAlert, setShowAlert] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        setEnvironment('browser');

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

        const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
        if (params.name) {
            setName(params.name);
        }
        if (params.host) {
            setHost(params.host);
        }
        if (params.port) {
            setPort(params.port);
        }
        if (params.database) {
            setDatabase(params.database);
        }
        if (params.username) {
            setUsername(params.username);
        }
        if (params.password) {
            setPassword(params.password);
        }
        if (params.enableEncryption) {
            setEnableEncryption(params.enableEncryption === 'true');
        }
    }, [connections]);

    useEffect(() => {
        const connection = getConnection();
        if (connection) {
            setName(connection.name)
            setHost(connection.host)
            setPort(connection.port)
            setDatabase(connection.database)
            if (connection.username) {
                setUsername(connection.username)
            }
            setPassword(connection.password)
        }
    }, []);

    function checkConnection() {
        if (!name) {
            setAlert(<Alert type="error" message={'Name is required.'}></Alert>);
            setShowAlert(true);
            return false;
        }
        if (!host) {
            setAlert(<Alert type="error" message={'Host is required.'}></Alert>);
            setShowAlert(true);
            return false;
        }
        if (!port) {
            setAlert(<Alert type="error" message={'Port is required.'}></Alert>);
            setShowAlert(true);
            return false;
        }
        if (!database) {
            setAlert(<Alert type="error" message={'Database is required.'}></Alert>);
            setShowAlert(true);
            return false;
        }
        if (!password) {
            setAlert(<Alert type="error" message={'Password is required.'}></Alert>);
            setShowAlert(true);
            return false;
        }

        return true;
    }

    async function updateConnection() {
        const connection = new Connection();
        connection.name = name
        connection.host = host
        connection.port = port
        connection.database = database
        connection.username = username
        connection.password = password
        connection.enableEncryption = enableEncryption
        setConnection(connection)
    }

    async function establishConnection() {
        const http = host.startsWith('https://') ? 'https://' : 'http://';
        const hostWithoutProtocol = host.startsWith('http://') ? host.substring(7) : (host.startsWith('https://') ? host.substring(8) : host);
        const url = `${http}${username}:${password}@${hostWithoutProtocol}${port === '80' ? '' : ':' + port}/${database}`
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
        if (password && enableEncryption) {
            config.password = password;
        }
        config.silentConnect = true;
        const db = await DatabaseManager.connect(url, config);
        if (enableEncryption) {
            setEncryptionPassword(password)
        }
        setDefaultDbName(name);
        return db;
    }

    return <div>
        {
            showAlert && alert
        }
        <div className="w-screen h-screen flex justify-center items-center bg-slate-100 dark:bg-slate-900">
            <div
                className="w-full sm:w-full md:w-1/2 lg:w-1/3 rounded-lg bg-white dark:bg-slate-800 p-4"
                style={{
                    height: 'fit-content',
                }}
            >
                <div className="font-bold text-xl text-indigo-600 dark:text-indigo-500">
                    Poker: Pocketto Client Tools
                </div>
                <div className="h-6"></div>
                <Input
                    size="sm"
                    label="Nickname"
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
                    type="password"
                    label="Password"
                    placeholder="password"
                    value={password}
                    onChange={(text) => setPassword(text)}
                />
                <div className="h-4"></div>
                <div
                    className="flex flex-row gap-2 w-full"
                    onClick={() => setEnableEncryption(!enableEncryption)}
                >
                    <div>
                        <input
                            type="checkbox"
                            checked={enableEncryption}
                            onChange={(e) => setEnableEncryption(e.target.checked)}
                        />
                    </div>
                    <label className="mt-0.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Enable Data Encrypt/Decrypt
                    </label>
                </div>
                <div className="h-4"></div>
                <div className="font-bold text-indigo-600 dark:text-indigo-500">Favorites</div>
                <div className="h-2"></div>
                <div className="container mx-auto">
                    <div className="flex overflow-x-auto gap-4">
                        {
                            connections && connections.map((connection, index) => {
                                return <div
                                    key={index}
                                    className="relative z-10 cursor-pointer flex-none w-40 h-[50px] rounded-md border-slate-300  border shadow-md pl-2"
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
                <div className="h-2"></div>
                <div className="ml-1 text-xs dark:text-slate-200">
                    Scroll right to show more connections
                </div>
                <div className="ml-1 text-xs dark:text-blue-400 cursor-pointer text-blue-600 underline" onClick={() => {
                    navigate('/favorites');
                }}>
                    Manage Favorites
                </div>
                <div className="h-4"></div>
                <div className="grid grid-cols-3 gap-4">
                    <Button type="outline" color="red" onClick={async () => {
                        if (!checkConnection()) return;
                        await updateConnection();
                        await saveConnection();
                        const connections = await getConnections();
                        setConnections(connections);
                        setDefaultDbName(name);
                    }}>Save</Button>
                    <Button type="outline" color="green" onClick={async () => {
                        if (!checkConnection()) return;
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
                        if (!checkConnection()) return;
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