import {Browser} from "puppeteer";
import {Product} from "./Product";

export interface Strategy {
    vendor: string,
    execute(browser: Browser) : Promise<Product[]>
}
