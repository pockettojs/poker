import { onDocChange } from "pocketto";
import { useEffect, useState } from "react";

export function useRealtime(collectionName?: string) {
    const [needRefresh, setNeedRefresh] = useState(false);

    useEffect(() => {
        onDocChange((id) => {
            console.log('id: ', id);
            if (id.startsWith(collectionName || '')) {
                setNeedRefresh(true);
                setTimeout(() => {
                    setNeedRefresh(false);
                }, 1);
            }
        });
    }, [collectionName]);

    return needRefresh;
}