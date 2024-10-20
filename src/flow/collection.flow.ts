import { QueryBuilder } from "pocketto";
import { Collection } from "src/models/Collection";

export function getCollections(query?: (query: QueryBuilder<Collection>) => QueryBuilder<Collection>) {
    if (!query) return Collection.all();
    return Collection.where(query).get();
}