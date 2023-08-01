import { DatabaseManager, PouchDBConfig } from "pocket";
import { useState } from "react";
import Button from "src/components/Button";
import Input from "src/components/Input";
import { setConnection } from "src/flow/login.flow";
import { Connection } from "src/models/Connection";

function LoginPage() {
    const [name, setName] = useState("")
    const [host, setHost] = useState("localhost")
    const [port, setPort] = useState("5984")
    const [database, setDatabase] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    return <div className="w-screen h-screen flex justify-center items-center bg-slate-200">
        <div className="w-full sm:w-full md:w-1/4 lg:1/3 h-[600px] rounded-lg bg-white p-4">
            <div className="font-bold text-xl">Poker Login</div>
            <div className="h-6"></div>
            <Input
                label="Name"
                placeholder="home"
                value={name}
                onChange={(text) => setName(text)}
            />
            <div className="h-4"></div>
            <Input
                label="Host"
                placeholder="localhost"
                value={host}
                onChange={(text) => setHost(text)}
            />
            <div className="h-4"></div>
            <Input
                label="Port"
                placeholder="5984"
                value={port}
                onChange={(text) => setPort(text)}
            />
            <div className="h-4"></div>
            <Input
                label="Database"
                placeholder="db"
                value={database}
                onChange={(text) => setDatabase(text)}
            />
            <div className="h-4"></div>
            <Input
                label="Username"
                placeholder="username"
                value={username}
                onChange={(text) => setUsername(text)}
            />
            <div className="h-4"></div>
            <Input
                label="Password"
                placeholder="password"
                value={password}
                onChange={(text) => setPassword(text)}
            />
            <div className="h-8"></div>
            <div className="grid grid-cols-3 gap-4">
                <Button type="outline" color="red">Save</Button>
                <Button type="outline" color="green">Connect</Button>
                <Button type="outline" color="blue" onClick={async () => {
                    const connection = new Connection()
                    connection.name = name
                    connection.host = host
                    connection.port = port
                    connection.database = database
                    connection.username = username
                    connection.password = password
                    setConnection(connection)
                    const url = `http://${host}${port === '80' ? '' : ':' + port}`
                    const config = {} as PouchDBConfig;
                    if (username && password) {
                        config.auth = {
                            username,
                            password
                        };
                    }
                    if (password) {
                        config.password = password;
                    }
                    const db = await DatabaseManager.connect(url, config);
                    console.log('db: ', db);
                }}>Login</Button>
            </div>
        </div>
    </div>;
}

export default LoginPage;