import { DatabaseManager, Model } from "pocket";
import { useEffect, useState } from "react";
import { getCollections } from "src/flow/collection.flow";
import { getConnection } from "src/flow/login.flow";
import { decrypt, setPassword } from "src/helpers/encryption";
import { Collection } from "src/models/Collection";

function HomePage() {
    const [searchText, setSearchText] = useState("");
    const [collections, setCollections] = useState<Collection[]>();
    const [currentCollection, setCurrentCollection] = useState<Collection>();
    const [results, setResults] = useState<any[]>();

    useEffect(() => {
        if (!collections) {
            getCollections(query => query.orderBy('id', 'asc')).then((collections) => {
                setCollections(collections);
            });
        }

    }, [collections]);

    async function getModels(collection: Collection) {
        const collectionName = collection.id;
        const connection = getConnection();
        const db = DatabaseManager.get(connection.name);
        const query = {
            _id: { $regex: `^${collectionName}`, },
        };
        const output = await db.find({
            selector: query,
        });
        setPassword(connection.password);
        const result = output.docs.map((item: any) => {
            return { id: item._id, rev: item._rev, ...decrypt(item.payload), };
        })
        setResults(result);
    }

    function formatKey(key: string) {
        if (key === 'rev') {
            return 'No';
        }
        if (key === 'id') {
            return 'ID';
        }
        return key;
    }
    function formatValue(key: string, value: any) {
        if (key === 'rev') {
            return value.split('-')[0];
        }
        if (key === 'id') {
            return value.split('.')[1];
        }
        return value;
    }

    return (
        <div className="w-screen h-screen bg-slate-100 dark:bg-slate-900 flex">
            <div className="w-1/4 p-4">
                <input
                    className="w-full h-8 px-4 text-sm rounded-full dark:bg-slate-300 dark:placeholder:text-slate-500 shadow-sm focus:outline-none focus:border-blue-500"
                    placeholder="Search Collection"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <div className="h-4"></div>
                <div className="text-sm ml-2 space-y-2">
                    {
                        collections?.map((item) => {
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
            <div className="w-3/4 overflow-x-auto bg-white dark:bg-slate-800 shadow-sm rounded-lg p-4 mb-4">
                <div className="w-full h-16">
                    <div className="absolute">
                        <div className="p-2 pb-8 text-2xl">{currentCollection?.id || ''}</div>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="mt-[48px]" style={{
                            height: 'calc(100vh - 48px)',
                        }}>
                            <table>
                                {
                                    Object.keys(results?.[0]).map((key) => {
                                        return <th>
                                            <td className="px-2 pb-2 text-slate-900 dark:text-white">{formatKey(key)}</td>
                                        </th>
                                    })
                                }
                                {
                                    results?.map((item) => {
                                        return <tr>
                                            {
                                                Object.keys(item).map((key) => {
                                                    return <td className="px-2 pb-2 text-slate-900 text-xs dark:text-white">{formatValue(key, item[key])}</td>
                                                })
                                            }
                                        </tr>
                                    })
                                }
                            </table>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default HomePage;