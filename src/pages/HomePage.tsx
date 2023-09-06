import { DatabaseManager } from "pocket";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "src/components/Alert";
import { getCollections } from "src/flow/collection.flow";
import { getConnection } from "src/flow/login.flow";
import { decrypt } from "src/helpers/encryption";
import { Collection } from "src/models/Collection";
import { Connection } from "src/models/Connection";
import AsyncLock from 'async-lock';
import { Delete16Filled, Dismiss16Filled } from "@ricons/fluent";
import Dialog from "src/components/Dialog";
import Button from "src/components/Button";

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

    const navigate = useNavigate();

    useMemo(() => {
        window.matchMedia('(prefers-color-scheme: dark)').matches ? setColorScheme('dark') : setColorScheme('light');

        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', event => {
                const colorScheme = event.matches ? "dark" : "light";
                console.log('colorScheme: ', colorScheme);
                setColorScheme(colorScheme);
            });
    }, []);

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
        lock.acquire(LOCK_KEY, async (done) => {
            try {
                const result = output.docs.map((item: any) => {
                    const newItem = { id: item._id, rev: item._rev, ...decrypt(item.payload), };
                    delete newItem.payload;
                    delete newItem._revisions;
                    return newItem;
                })

                result.sort((a: any, b: any) => {
                    return a.updatedAt > b.updatedAt ? -1 : 1;
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
                    if (currentAttr.length < attr.length) {
                        currentAttr = attr;
                        setAttributes(currentAttr);
                        setSearchAttributes(currentAttr.map(() => ''));
                    }
                }

                setResults(result);
                setFilteredResults(result);
                setEditItem(undefined);
                setEditKey(undefined);
                done();
            } catch (error) {
                setAlert(<Alert type="error" message={'The database encryption key is wrong, please check'}></Alert>);
                setShowAlert(true);
                setTimeout(() => {
                    setAlert(undefined);
                    setShowAlert(false);
                }, 4000);
                done(error as Error);
            }
        });

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
            json = JSON.stringify(json, undefined, 4);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const pattern = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|\{|\}|\[|\]|,)/g;
        return json.replace(pattern, function (match: string) {
            var cls = 'white';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = KEY_TEXT_COLOR_LIGHT;
                } else {
                    cls = STRING_TEXT_COLOR_LIGHT;
                }
            } else if (/^-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?$/.test(match)) {
                cls = NUMBER_TEXT_COLOR_LIGHT;
            } else if (/true|false/.test(match)) {
                cls = BOOLEAN_TEXT_COLOR_LIGHT;
            } else if (/null/.test(match)) {
                cls = NULL_TEXT_COLOR;
            } else if (/undefined/.test(match)) {
                cls = UNDEFINED_TEXT_COLOR;
            } else {
                console.log('colorScheme: ', colorScheme);
                if (colorScheme === 'dark') {
                    cls = 'white';
                } else {
                    cls = 'black';
                }
            }
            return '<span style="color: ' + cls + ';">' + match + '</span>';
        });
    }

    return (<>
        <Dialog show={!!deleteItem}>
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
                <div className="text-[13px] border border-slate-200 dark:border-slate-900 w-full h-auto p-4 rounded-md dark:bg-slate-800 bg-slate-100">
                    <pre dangerouslySetInnerHTML={{ __html: deleteItem && syntaxHighlight(deleteItem) }}></pre>
                </div>
                <div className="h-8"></div>
                <div className="w-full flex justify-end gap-4">
                    {
                        colorScheme === 'light' ? <Button size="sm" type="text" color="black" onClick={() => {
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
        <div className="w-screen h-screen bg-slate-100 dark:bg-slate-900 flex">
            {
                showAlert && alert
            }
            <div className="w-1/6 p-4">
                <div className="ml-2 mb-4 dark:text-slate-400 font-bold">{connection?.name || ''}</div>
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
                        <div className="p-2 pb-8 text-2xl dark:text-slate-400">{currentCollection?.id || ''}</div>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="mt-[48px]" style={{
                            height: 'calc(100vh - 48px)',
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
                                            <th></th>
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
                                                    <td>
                                                        <Delete16Filled className="mt-[-8px] w-4 h-4 text-red-500 cursor-pointer" onClick={() => {
                                                            setDeleteItem(item);
                                                        }} />
                                                    </td>
                                                    {
                                                        attributes.map((key, indexJ) => {
                                                            return <td key={indexJ} valign="top" className="px-2 pb-2 text-slate-900 text-xs dark:text-slate-400">
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