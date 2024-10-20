import { onDocChange } from "pocketto";
import { useEffect, useState } from "react";

export function useRealtime(collectionName?: string) {
    const [needRefreshId, setNeedRefreshId] = useState<string>();

    useEffect(() => {
        onDocChange((id) => {
            if (id.startsWith(collectionName || '')) {
                setNeedRefreshId(id);
                setTimeout(() => {
                    setNeedRefreshId(undefined);
                }, 1);
            }
        });
    }, [collectionName]);

    return needRefreshId;
}