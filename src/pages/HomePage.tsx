import { DatabaseManager } from "pocket";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "src/components/Alert";
import { getCollections } from "src/flow/collection.flow";
import { getConnection } from "src/flow/login.flow";
import { decrypt } from "src/helpers/encryption";
import { Collection } from "src/models/Collection";
import { Connection } from "src/models/Connection";

function HomePage() {
    const [connection, setConnection] = useState<Connection>();
    const [searchText, setSearchText] = useState("");
    const [collections, setCollections] = useState<Collection[]>();
    const [filteredCollections, setFilteredCollections] = useState<Collection[]>();
    const [currentCollection, setCurrentCollection] = useState<Collection>();
    const [attributes, setAttributes] = useState<string[]>([]);
    const [searchAttributes, setSearchAttributes] = useState<string[]>();
    const [results, setResults] = useState<any[]>();
    const [filteredResults, setFilteredResults] = useState<any[]>();
    const [db, setDb] = useState<any>();

    const [alert, setAlert] = useState<any>();
    const [showAlert, setShowAlert] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        const connection = getConnection();
        if (!connection) {
            navigate('/login');
            return;
        }
        setConnection(connection);
        const db = DatabaseManager.get(connection.name);
        setDb(db);

        if (!collections) {
            getCollections(query => query.orderBy('id', 'asc')).then((collections) => {
                setCollections(collections);
                setFilteredCollections(collections);
            });
        }
    }, [collections, navigate]);

    async function getModels(collection: Collection) {
        const collectionName = collection.id;
        const query = {
            _id: { $regex: `^${collectionName}`, },
        };
        const output = await db.find({
            selector: query,
        });
        try {
            const result = output.docs.map((item: any) => {
                return { id: item._id, rev: item._rev, ...decrypt(item.payload), };
            })
            result.sort((a: any, b: any) => {
                return a.updatedAt > b.updatedAt ? -1 : 1;
            });

            setAttributes(result.length > 0 ? Object.keys(result[0]) : []);
            setSearchAttributes(result.length > 0 ? Object.keys(result[0]).map(() => '') : []);
            for (const item of result) {
                const attr = Object.keys(item);
                if (attributes.length === 0 || attr.length > attributes.length) {
                    setAttributes(attr);
                    setSearchAttributes(attr.map(() => ''));
                }
            }

            setResults(result);
            setFilteredResults(result);
        } catch (error) {
            setAlert(<Alert type="error" message={'The database encryption key is wrong, please check'}></Alert>);
            setShowAlert(true);
            setTimeout(() => {
                setAlert(undefined);
                setShowAlert(false);
            }, 4000);
        }
    }

    function formatKey(key: string) {
        return key;
    }
    function formatValue(key: string, value: any) {
        if (key === 'rev') {
            return value.split('-')[0];
        }
        if (key === 'id') {
            return value.split('.')[1];
        }
        if (value && value.length === 24 && value[10] === 'T' && value[23] === 'Z') {
            return value.replace('T', ' ').replace('Z', '')
        }
        if (value && typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    }
    function getWidth() {
        return 'w-10';
    }

    return (
        <div className="w-screen h-screen bg-slate-100 dark:bg-slate-900 flex">
            {
                showAlert && alert
            }
            <div className="w-1/6 p-4">
                <div className="ml-2 mb-4 dark:text-white font-bold">{connection?.name || ''}</div>
                <input
                    className="w-full h-8 px-4 text-sm rounded-full dark:bg-slate-600 dark:placeholder:text-slate-500 shadow-sm focus:outline-none focus:border-blue-500"
                    placeholder="Search Collection"
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        const filtered = collections?.filter((item) => {
                            return item.id.toLowerCase().includes(e.target.value.toLowerCase());
                        });
                        setFilteredCollections(filtered);
                    }}
                />
                <div className="h-4"></div>
                <div className="text-sm ml-2 space-y-2">
                    {
                        filteredCollections && filteredCollections.map((item) => {
                            return <div
                                key={item.id}
                                className="w-full cursor-pointer"
                                onClick={() => {
                                    setCurrentCollection(item);
                                    getModels(item);
                                }}
                            >
                                <div className="text-slate-900 dark:text-white">{item.id}</div>
                            </div>
                        })
                    }
                </div>
            </div>
            <div className="w-5/6 overflow-x-auto bg-white dark:bg-slate-800 shadow-sm rounded-lg p-4">
                {
                    !filteredResults && <div className="w-full h-full flex justify-center items-center">
                        <div className="text-slate-600 dark:text-white">Please select a collection</div>
                    </div>
                }
                <div className="w-full h-16">
                    <div className="absolute">
                        <div className="p-2 pb-8 text-2xl dark:text-white">{currentCollection?.id || ''}</div>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="mt-[48px]" style={{
                            height: 'calc(100vh - 48px)',
                        }}>
                            {
                                filteredResults ? <table>
                                    <thead>
                                        <tr>
                                            {
                                                filteredResults ? attributes.map((key, index) => {
                                                    return <th key={index} className="px-2 pb-2 text-slate-900 dark:text-white">{formatKey(key)}</th>
                                                }) : <></>
                                            }
                                        </tr>
                                        <tr>
                                            {
                                                filteredResults ? attributes.map((key, index) => {
                                                    return <td key={index} className={"pl-1 pb-2 " + getWidth()}>
                                                        <input
                                                            className="h-6 px-2 w-full text-xs rounded-full dark:bg-slate-600 dark:placeholder:text-slate-400 shadow-sm focus:outline-none focus:border-blue-500 bg-slate-100"
                                                            placeholder={formatKey(key)}
                                                            value={searchAttributes ? searchAttributes[index] : ''}
                                                            onChange={(e) => {
                                                                const filtered = results?.filter((item) => {
                                                                    return formatValue(key, item[key]).toLowerCase().includes(e.target.value.toLowerCase());
                                                                });
                                                                setFilteredResults(filtered || []);
                                                                setSearchAttributes(searchAttributes?.map((item, indexJ) => {
                                                                    if (index === indexJ) {
                                                                        return e.target.value;
                                                                    }
                                                                    return item;
                                                                }));
                                                            }}
                                                        />
                                                    </td>
                                                }) : <></>
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            filteredResults ? filteredResults?.map((item, index) => {
                                                return <tr key={index}>
                                                    {
                                                        attributes.map((key, indexJ) => {
                                                            return <td key={indexJ} valign="top" className="px-2 pb-2 text-slate-900 text-xs dark:text-white">
                                                                <pre>
                                                                    {formatValue(key, item[key])}
                                                                </pre>
                                                            </td>
                                                        })
                                                    }
                                                </tr>
                                            }) : <></>
                                        }
                                    </tbody>
                                </table> : <></>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;