import { AccountNode } from "./accountNode";

export interface QueryDurationEvent{
    node:AccountNode;
    duration:number;
    isFirstNode:boolean;
}