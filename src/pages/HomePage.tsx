import { DatabaseManager, PouchDBConfig, setDefaultDbName, setEnvironment, setRealtime } from "pocketto";
import { setPassword as setEncryptionPassword } from 'src/helpers/encryption';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "src/components/Alert";
import { getCollections } from "src/flow/collection.flow";
import { getConnection } from "src/flow/login.flow";
import { decrypt } from "src/helpers/encryption";
import { Collection } from "src/models/Collection";
import { Connection } from "src/models/Connection";
import AsyncLock from 'async-lock';
import { ArrowClockwise12Regular, Delete16Filled, Dismiss16Filled, Edit16Filled } from "@ricons/fluent";
import Dialog from "src/components/Dialog";
import Button from "src/components/Button";
import Input from "src/components/Input";
import { useRealtimeListItemChanged } from "src/hooks/useRealtimeListItemChanged";
import { cn } from "src/utils/cn";

const lock = new AsyncLock();
const LOCK_KEY = 'model-query';

const KEY_TEXT_COLOR_LIGHT = "#F97316";
// const NUMBER_TEXT_COLOR_DARK = "#4F46E5";
const NUMBER_TEXT_COLOR_LIGHT = "#3a33a1";
// const BOOLEAN_TEXT_COLOR_DARK = "#F97316";
const BOOLEAN_TEXT_COLOR_LIGHT = "#e36812";
const NULL_TEXT_COLOR = "#718096";
const UNDEFINED_TEXT_COLOR = "#718096";
// const STRING_TEXT_COLOR_DARK = "#22C55E";
const STRING_TEXT_COLOR_LIGHT = "#199e4a";

function HomePage() {
    const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
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

    // Edit field
    const [originalValue, setOriginalValue] = useState<any>();
    const [editItem, setEditItem] = useState<any>();
    const [editKey, setEditKey] = useState<string>();
    const editInputRef = useRef<HTMLInputElement>(null);

    // Delete item
    const [deleteItem, setDeleteItem] = useState<any>();

    // Add new field
    const [addNewField, setAddNewField] = useState<any>();
    const [newFieldName, setNewFieldName] = useState<string>("");

    const navigate = useNavigate();

    useMemo(() => {
        window.matchMedia('(prefers-color-scheme: dark)').matches ? setColorScheme('dark') : setColorScheme('light');

        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', event => {
                const colorScheme = event.matches ? "dark" : "light";
                setColorScheme(colorScheme);
            });
    }, []);

    async function establishConnection(connection: Connection) {
        setEnvironment('browser');
        const { host, port, username, password, database, name, enableEncryption, encryptionPassword } = connection;
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
        if (password && encryptionPassword) {
            config.encryptionPassword = encryptionPassword;
        }
        config.silentConnect = true;
        const db = await DatabaseManager.connect(url, config);
        if (encryptionPassword) setEncryptionPassword(encryptionPassword);
        setDefaultDbName(name);
        setRealtime(true);
        return db;
    }

    useEffect(() => {
        const connection = getConnection();
        console.log('connection: ', connection);
        if (!connection) {
            navigate('/login');
            return;
        }
        setConnection(connection);
        establishConnection(connection).then(() => {
            const db = DatabaseManager.get(connection.name);
            setDb(db);

            if (!collections) {
                getCollections(query => query.orderBy('createdAt', 'asc')).then((collections) => {
                    setCollections(collections);
                    setFilteredCollections(collections);
                });
            }
        });
    }, [collections, navigate]);

    const getModels = useCallback(async (collection: Collection) => {
        const collectionName = collection.id;
        const query = {
            _id: { $regex: `^${collectionName}`, },
        };
        const output = await db.find({
            selector: query,
            limit: 99999,
        });
        const enableEncryption = !!db.config.encryptionPassword;
        lock.acquire(LOCK_KEY, async (done) => {
            try {
                const result = output.docs.map((item: any) => {
                    if (enableEncryption) {
                        item = { id: item._id, rev: item._rev, ...decrypt(item.payload), };
                        delete item.payload;
                    } else {
                        item = { id: item._id, rev: item._rev, ...item, };
                        delete item._rev;
                        delete item._id;
                    }
                    delete item._revisions;
                    return item;
                })

                result.sort((a: any, b: any) => {
                    return a.createdAt > b.createdAt ? -1 : 1;
                });

                setAttributes([]);
                let currentAttr: string[] = [];
                for (let i = 0; i < result.length; i++) {
                    const item = result[i];
                    const attr = Object.keys(item);
                    if (i === 0) {
                        currentAttr = attr;
                        setAttributes(currentAttr);
                        setSearchAttributes(currentAttr.map(() => ''));
                    }
                    if (attr.length > currentAttr.length) {
                        currentAttr = attr;
                        setAttributes(currentAttr);
                        setSearchAttributes(currentAttr.map(() => ''));
                    } else if (attr.length === currentAttr.length) {
                        currentAttr = Array.from(new Set([...currentAttr, ...attr]));
                        setAttributes(Array.from(currentAttr));
                        setSearchAttributes(Array.from(currentAttr).map(() => ''));
                    }
                }

                setResults(result);
                setFilteredResults(result);
                setEditItem(undefined);
                setEditKey(undefined);
                done();
            } catch (error) {
                if ((error as Error).message === 'The database did not encrypted, please check') {
                    setAlert(<Alert type="error" message={'The database encryption key is wrong, please check'}></Alert>);
                    setShowAlert(true);
                    setTimeout(() => {
                        setAlert(undefined);
                        setShowAlert(false);
                    }, 4000);
                    done(error as Error);
                }

                setAlert(<Alert type="error" message={'The database encryption key is wrong, please check'}></Alert>);
                setShowAlert(true);
                setTimeout(() => {
                    setAlert(undefined);
                    setShowAlert(false);
                }, 4000);
                done(error as Error);
            }
        });
    }, [db]);

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
    function getColor(value: any) {
        if (value === null) {
            return NULL_TEXT_COLOR;
        }
        if (value === undefined) {
            return UNDEFINED_TEXT_COLOR;
        }
        if (typeof value === 'number') {
            return NUMBER_TEXT_COLOR_LIGHT;
        }
        if (typeof value === 'boolean') {
            return BOOLEAN_TEXT_COLOR_LIGHT;
        }
        if (typeof value === 'string') {
            return STRING_TEXT_COLOR_LIGHT;
        }
        return STRING_TEXT_COLOR_LIGHT;
    }

    function syntaxHighlight(json: any) {
        const newItem = { ...json };
        newItem.id = newItem.id.split('.').slice(1).join('.');

        if (typeof json != 'string') {
            json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const pattern = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|\{|\}|\[|\]|,)/g;
        return json.replace(pattern, function (match: string) {
            var cls = 'white';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = KEY_TEXT_COLOR_LIGHT;
                } else {
                    cls = STRING_TEXT_COLOR_LIGHT;
                }
            } else if (/^-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?$/.test(match)) {
                cls = NUMBER_TEXT_COLOR_LIGHT;
            } else if (/true|false/.test(match)) {
                cls = BOOLEAN_TEXT_COLOR_LIGHT;
            } else if (/null/.test(match)) {
                cls = NULL_TEXT_COLOR;
            } else if (/undefined/.test(match)) {
                cls = UNDEFINED_TEXT_COLOR;
            } else {
                if (colorScheme === 'dark') {
                    cls = 'white';
                } else {
                    cls = 'black';
                }
            }
            return '<span style="color: ' + cls + ';">' + match + '</span>';
        });
    }


    const needRefreshId = useRealtimeListItemChanged(currentCollection?.id);
    const [currentRefreshingId, setCurrentRefreshingId] = useState<string>();
    useEffect(() => {
        if (needRefreshId && currentCollection) {
            getModels(currentCollection as Collection).then(() => {
                setAlert(<Alert type="success" message={'Database is updated by user!'}></Alert>);
                setShowAlert(true);
                setTimeout(() => {
                    setAlert(undefined);
                    setShowAlert(false);
                }, 4000);
                setCurrentRefreshingId(needRefreshId);
            });
        }
    }, [needRefreshId, currentCollection, getModels]);

    return (<>
        <Dialog show={!!deleteItem} onClose={() => setDeleteItem(undefined)}>
            <div className="p-4">
                <div className="w-full flex justify-between">
                    <div className="font-bold text-red-500">Permanent Delete Alert</div>
                    <Dismiss16Filled className="mt-1 w-4 h-4 text-black dark:text-slate-400 cursor-pointer" onClick={() => {
                        setDeleteItem(undefined);
                    }} />
                </div>
                <div className="h-6"></div>
                <div className="text-black dark:text-slate-400">Do you sure you want to continue to delete the following item?</div>
                <div className="h-4"></div>
                <div className="text-[13px] border border-slate-200 dark:border-slate-900 w-full h-auto max-h-80 overflow-y-auto p-4 rounded-md dark:bg-slate-800 bg-slate-100">
                    <pre dangerouslySetInnerHTML={{ __html: deleteItem && syntaxHighlight(deleteItem) }}></pre>
                </div>
                <div className="h-8"></div>
                <div className="w-full flex justify-end gap-4">
                    {
                        colorScheme === 'light' ? <Button size="sm" type="text" color="slate" onClick={() => {
                            setDeleteItem(undefined);
                        }}>Cancel</Button> : <Button size="sm" type="default" color="slate" onClick={() => {
                            setDeleteItem(undefined);
                        }}>Cancel</Button>
                    }
                    <Button size="sm" type="outline" color="red" onClick={async () => {
                        await db.remove(deleteItem.id, deleteItem.rev).catch((err: any) => {
                            setAlert(<Alert type="error" message={err.message}></Alert>);
                            setShowAlert(true);
                            setTimeout(() => {
                                setAlert(undefined);
                                setShowAlert(false);
                            }, 4000);
                        });
                        setDeleteItem(undefined);
                        await getModels(currentCollection as Collection);
                        setAlert(<Alert type="success" message={'Deleted successfully'}></Alert>);
                        setShowAlert(true);
                        setTimeout(() => {
                            setAlert(undefined);
                            setShowAlert(false);
                        }, 4000);

                    }}>Confirm</Button>
                </div>
            </div>
        </Dialog>
        <Dialog show={!!addNewField} onClose={() => setAddNewField(undefined)}>
            {/* give new field to edit */}
            <div className="p-4">
                <div className="w-full flex justify-between">
                    <div className="font-bold">Add New Field</div>
                    <Dismiss16Filled className="mt-1 w-4 h-4 text-black dark:text-slate-400 cursor-pointer" onClick={() => {
                        setAddNewField(undefined);
                    }} />
                </div>
                <div className="h-8"></div>
                <div>
                    <Input
                        placeholder="Field Name"
                        value={newFieldName}
                        onChange={(value) => {
                            setNewFieldName(value);
                        }}
                    />
                </div>
                <div className="h-8"></div>
                <div className="w-full flex justify-end gap-4">
                    {
                        colorScheme === 'light' ? <Button size="sm" type="text" color="slate" onClick={() => {
                            setAddNewField(undefined);
                        }}>Cancel</Button> : <Button size="sm" type="default" color="slate" onClick={() => {
                            setAddNewField(undefined);
                        }}>Cancel</Button>
                    }
                    <Button size="sm" type="outline" color="blue" onClick={async () => {
                        await getModels(currentCollection as Collection);
                        await Promise.all((results as any[]).map(async (item) => {
                            // add new field per item
                            item[newFieldName] = 'NEW_FIELD';
                            item._id = item.id;
                            item._rev = item.rev;
                            delete item.id;
                            delete item.rev;
                            await db.put(item);
                            return true;
                        }));



                        setAlert(<Alert type="success" message={'Field added successfully'}></Alert>);
                        setShowAlert(true);
                        setTimeout(() => {
                            setAlert(undefined);
                            setShowAlert(false);
                        }, 4000);

                    }}>Confirm</Button>
                </div>
            </div>
        </Dialog>
        <div className="w-screen h-screen bg-slate-100 dark:bg-slate-900 flex">
            {
                showAlert && alert
            }
            <div className="w-1/6 p-4">
                <div className="flex">
                    <div className="ml-2 mb-4 dark:text-slate-400 font-bold truncate w-full">{connection?.name || ''}</div>
                </div>
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
                                onClick={async () => {
                                    setCurrentCollection(item);
                                    await getModels(item);
                                }}
                            >
                                <div className="text-slate-900 dark:text-slate-400">{item.id}</div>
                            </div>
                        })
                    }
                </div>
            </div>
            <div className="w-5/6 overflow-x-auto bg-white dark:bg-slate-800 shadow-sm rounded-lg p-4">
                {
                    !filteredResults && <div className="w-full h-full flex justify-center items-center">
                        <div className="text-slate-600 dark:text-slate-400">Please select a collection</div>
                    </div>
                }
                <div className="w-full h-16">
                    <div className="absolute">
                        <div className="p-2 pb-8 text-2xl dark:text-slate-400">
                            {currentCollection?.id || ''}
                            <span className="text-xs">&nbsp;&nbsp;(Row count: {filteredResults ? filteredResults.length : '0'})</span>
                        </div>
                    </div>
                    {
                        filteredResults && <div className="absolute right-4 top-4 w-8 h-8 cursor-pointer">
                            <ArrowClockwise12Regular onClick={() => {
                                getModels(currentCollection as Collection);
                            }} />
                        </div>
                    }
                    <div>
                        <div className="h-[52px]"></div>
                        <div className="overflow-x-auto" style={{
                            height: 'calc(100vh - 80px)',
                        }}>
                            {
                                filteredResults ? <table>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            {
                                                filteredResults ? attributes.map((key, index) => {
                                                    return <th key={index} className="px-2 pb-2 text-slate-900 dark:text-slate-400">{formatKey(key)}</th>
                                                }) : <></>
                                            }
                                        </tr>
                                        <tr>
                                            <th>
                                                <td>
                                                    <Edit16Filled className="mt-[-4px] w-4 h-4 text-black dark:text-slate-400 cursor-pointer" onClick={() => {
                                                        setNewFieldName('');
                                                        setAddNewField(true);
                                                    }} />
                                                </td>
                                            </th>
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
                                                return <tr key={index} className="hover:bg-orange-100">
                                                    <td valign="top">
                                                        <Delete16Filled className="w-4 h-4 text-red-500 cursor-pointer" onClick={() => {
                                                            setDeleteItem(item);
                                                        }} />
                                                    </td>
                                                    {
                                                        attributes.map((key, indexJ) => {
                                                            return <td key={indexJ} valign="top" className={cn(
                                                                "px-2 text-slate-900 text-xs dark:text-slate-400",
                                                                currentRefreshingId === item.id && "bg-green-100",
                                                            )}>
                                                                <div className="pb-1">
                                                                    {
                                                                        editItem && editItem.id === item.id && editKey === key ? <input
                                                                            ref={editInputRef}
                                                                            className="border-2 bottom-slate-500"
                                                                            value={editItem[key]}
                                                                            onChange={(e) => {
                                                                                setEditItem({
                                                                                    ...editItem,
                                                                                    [key]: e.target.value,
                                                                                });
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    editInputRef.current?.blur();
                                                                                }
                                                                                if (e.key === 'Escape') {
                                                                                    setEditItem(undefined);
                                                                                    setEditKey(undefined);
                                                                                }
                                                                            }}
                                                                            onBlur={async () => {
                                                                                const value = editItem[key];
                                                                                if (value === originalValue) {
                                                                                    setEditItem(undefined);
                                                                                    setEditKey(undefined);
                                                                                    setOriginalValue(undefined);
                                                                                    return;
                                                                                }
                                                                                if (!Number.isNaN(Number(value))) {
                                                                                    editItem[key] = Number(value);
                                                                                }
                                                                                if (value === 'true' || value === 'false') {
                                                                                    editItem[key] = value === 'true';
                                                                                }
                                                                                if (value === 'null') {
                                                                                    editItem[key] = null;
                                                                                }
                                                                                if (value === 'undefined') {
                                                                                    editItem[key] = undefined;
                                                                                }
                                                                                editItem._id = editItem.id;
                                                                                editItem._rev = editItem.rev;
                                                                                delete editItem.id;
                                                                                delete editItem.rev;
                                                                                const originalDoc = await db.get(editItem._id)
                                                                                const newItem = {
                                                                                    _id: editItem._id,
                                                                                    _rev: originalDoc._rev,
                                                                                    ...editItem,
                                                                                };
                                                                                await db.put(newItem).catch((err: any) => {
                                                                                    setAlert(<Alert type="error" message={err.message}></Alert>);
                                                                                    setShowAlert(true);
                                                                                    setTimeout(() => {
                                                                                        setAlert(undefined);
                                                                                        setShowAlert(false);
                                                                                    }, 4000);
                                                                                });
                                                                                setOriginalValue(undefined);
                                                                                await getModels(currentCollection as Collection);

                                                                                setAlert(<Alert type="success" message={'Updated successfully'}></Alert>);
                                                                                setShowAlert(true);
                                                                                setTimeout(() => {
                                                                                    setAlert(undefined);
                                                                                    setShowAlert(false);
                                                                                }, 4000);
                                                                            }}
                                                                        /> : <pre
                                                                            onClick={() => {
                                                                                // cannot edit id and rev
                                                                                if (key === 'id' || key === 'rev') {
                                                                                    return;
                                                                                }
                                                                                if (!editItem || item.id !== editItem?.id) {
                                                                                    setEditItem(item);
                                                                                }
                                                                                setEditKey(key);
                                                                                setOriginalValue(item[key]);

                                                                                setTimeout(() => {
                                                                                    editInputRef.current?.focus();
                                                                                }, 100);
                                                                            }}
                                                                            style={{
                                                                                color: getColor(item[key]),
                                                                            }}
                                                                        >
                                                                            {formatValue(key, item[key])}
                                                                        </pre>
                                                                    }
                                                                </div>
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

    </>);
}

export default HomePage;