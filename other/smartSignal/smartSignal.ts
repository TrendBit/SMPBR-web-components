import { Accessor, createSignal, Setter, Signal } from "solid-js";



export type ReconcilerResult<T> = { changed: true, value: T } | { changed: false }

export class Reconciler<T>{
    protected oldVal: T | undefined = undefined;
    
    reconcile(newVal: T): ReconcilerResult<T> {        
        return {
            changed: true,
            value: newVal
        }
    }
}

function setterWrapper<T>(setter: Setter<T>, reconciler: Reconciler<T>) : (value: T) => void {
    return (value: T) => {
        const result = reconciler.reconcile(value);
        if (result.changed === true) {
            setter(result.value as Exclude<T, Function>)
        }
    }
}

export function smartWrapSignal<T>(signal: Signal<T>, reconciler: Reconciler<T>) : [get: Accessor<T>, set: (value:T)=>void] {
    return [
        signal[0],
        setterWrapper(signal[1], reconciler)
    ];
}

export function createSmartSignal<T>(value: T, reconciler: Reconciler<T>) {
    return smartWrapSignal(createSignal<T>(value), reconciler)
}