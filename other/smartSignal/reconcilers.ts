import objectHash from "object-hash";
import { Reconciler, ReconcilerResult } from "./smartSignal";

export type ReconcilerElementID = string;


export class ArrayReconciler<U extends object> extends Reconciler<U[] | undefined>{
    protected hashes: Record<ReconcilerElementID, {hash: string, val: U}> = {};
    protected getID: (element: U) => ReconcilerElementID;

    constructor(getID: (element: U) => ReconcilerElementID) {
        super();
        this.getID = getID
    }

    addElement(value: U, valueHash: string, valueID: ReconcilerElementID, result: U[], newHashes: typeof this.hashes) {
        result.push(value)

        newHashes[valueID] = {
            hash: valueHash,
            val: value
        }
    }
    
    reconcile(newVal: U[]): ReconcilerResult<U[]> {
        let changed = false;

        if (newVal === undefined) {
            return {
                changed: true,
                value: newVal
            }
        }

        const result: U[] = [];
        const newHashes : typeof this.hashes = {}

        for (let val of newVal) {
            const id = this.getID(val);
            const last = this.hashes[id];
            const newHash = objectHash(val);

            if (last === undefined) {
                this.addElement(
                    val,
                    newHash,
                    id,
                    result,
                    newHashes
                )
                changed = true;
            } else {
                if (last.hash !== newHash) {
                    this.addElement(
                        val,
                        newHash,
                        id,
                        result,
                        newHashes
                    )
                    changed = true
                } else {
                    this.addElement(
                        last.val,
                        last.hash,
                        id,
                        result,
                        newHashes
                    )
                }
            }
        }
        
        if (changed) {
            this.hashes = newHashes
            return {
                changed: true,
                value: result
            }
        } else {
            return {
                changed: false,
            }
        }
    }
}


type RecordReconcilerU<U> = Record<ReconcilerElementID, U>;

export class RecordReconciler<U extends object> extends Reconciler<RecordReconcilerU<U> | undefined>{
    protected hashes: Record<ReconcilerElementID, {hash: string, val: U}> = {};

    constructor() {
        super();
    }

    addElement(value: U, valueHash: string, valueID: ReconcilerElementID, result: RecordReconcilerU<U>, newHashes: typeof this.hashes) {
        result[valueID] = value

        newHashes[valueID] = {
            hash: valueHash,
            val: value
        }
    }
    
    reconcile(newVal: RecordReconcilerU<U>): ReconcilerResult<RecordReconcilerU<U>> {
        let changed = false;
        let checked = false;

        if (newVal === undefined) {
            return {
                changed: true,
                value: newVal
            }
        }

        const result: RecordReconcilerU<U> = {};
        const newHashes : typeof this.hashes = {}

        for (let id in newVal) {
            checked = true;
            
            const val = newVal[id]
            const last = this.hashes[id];
            const newHash = objectHash(val);

            if (last === undefined) {
                this.addElement(
                    val,
                    newHash,
                    id,
                    result,
                    newHashes
                )
                changed = true;
            } else {
                if (last.hash !== newHash) {
                    this.addElement(
                        val,
                        newHash,
                        id,
                        result,
                        newHashes
                    )
                    changed = true
                } else {
                    this.addElement(
                        last.val,
                        last.hash,
                        id,
                        result,
                        newHashes
                    )
                }
            }
        }
        
        if (changed || !checked) {
            this.hashes = newHashes
            return {
                changed: true,
                value: result
            }
        } else {
            return {
                changed: false,
            }
        }
    }
}