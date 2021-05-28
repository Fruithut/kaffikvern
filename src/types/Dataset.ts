import {Product} from "./Product";

export interface Dataset {
    timestamp: number,
    itemCount: number,
    dataset: Array<Product>
}
