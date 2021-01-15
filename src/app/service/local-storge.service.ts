import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { AccountNode } from '../models/accountNode';

declare var CircularJSON

@Injectable({
    providedIn: 'root'
})
export class LocalStorgeService {

    public localStorage: any;

    constructor() {
        if (!window.localStorage) {
            throw new Error('Current browser does not support Local Storage');
        }
        this.localStorage = window.localStorage;
    }

    public set(key: string, value: string): void {
        this.localStorage[key] = value;
    }

    public get(key: string): string {
        return this.localStorage[key] || null;
    }

    public setObject(key: string, value: any): void {
        console.log('save',value)
        this.localStorage[key] = CircularJSON.stringify(value);
    }

    public getObject(key: string): any {
        let nodes: Array<AccountNode> = CircularJSON.parse(this.localStorage[key] || null);
        if (!nodes) return null;
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            for (let j = 0; j < node.tradeTimes.length; j++) {
                let time = node.tradeTimes[j];
                node.tradeTimes[j]=moment(time);
            }
        }
        return nodes;
    }

    public remove(key: string): any {
        this.localStorage.removeItem(key);
    }
}
