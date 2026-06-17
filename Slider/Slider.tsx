import styles from "./Slider.module.css"
import { createEffect, For, Show } from "solid-js"
import { mapRangeToRange } from "../other/utils"
import { isChromium, isSafari } from "@solid-primitives/platform";

function chromeFix_Slider(element : HTMLInputElement, vertical : boolean){
    if((window.webkitURL != null)){
        const progress = mapRangeToRange(+element.value,Number(element.getAttribute("max")),Number(element.getAttribute("min")),100,0) 
        if(vertical){
            element.style.background = "linear-gradient(0deg, var(--acc-color-2) "+progress+"%, var(--bg-color-3) "+progress+"%)";
        }else{
            element.style.background = "linear-gradient(90deg, var(--acc-color-2) "+progress+"%, var(--bg-color-3) "+progress+"%)";
        }
    }
}

interface SliderSimpleProps{
    direction : "H"|"V";
    bounds : {
        min : number,
        max : number
    };
    setter : (value: number) => void;
    getter : () => number;
    step? : number
}

export function SliderSimple(props:SliderSimpleProps){
    let slider : HTMLInputElement | undefined = undefined;

    if(isChromium || isSafari){
        createEffect(() => {
            if(slider){
                props.getter();
                chromeFix_Slider(slider,props.direction == "V");
            }
        })
    }

    return (
        <input 
            class={styles.slider + " " + styles[props.direction]}
            type="range"
            min={props.bounds.min}
            max={props.bounds.max}
            value={props.getter()}
            step={props.step}
            ref={slider}
            onInput={e => {
                props.setter(+e.currentTarget.value);
                chromeFix_Slider(e.currentTarget, props.direction == "V");
            }}
        ></input>
    )
}


interface SliderProps{
    title : string,
    direction : "H"|"V",
    class? : string,
    setter : (value: number) => void,
    getter : () => number,
    bounds : {
        min: number,
        minDecimals?: number
        max : number,
        maxDecimals?: number
        show?: boolean,
        labelOffset?: string
    }
    deadzones?: {
        snapPoint: number,
        range: number
    }[]
    decimals?:number,
    step? : number,
    unit?: string,
    onChange? : (value : number)=>void,
    onInput? : (value : number)=>void,
    displayModifier? : (value : number)=>number
}

export function Slider(props : SliderProps){
    let slider: HTMLInputElement | undefined = undefined;
    let lastInputIsKey: boolean = false;

    if(isChromium || isSafari){
        createEffect(() => {
            if(slider){
                props.getter();
                chromeFix_Slider(slider,props.direction == "V");
            }
        })
    }

    return (
        <div class={styles.container + " " + styles[props.direction] + " "+props.class}>
            <div class={styles.header}>
                <p class={styles.label}>{props.title}</p>
                <p class={styles.value}>{
                    ((props.displayModifier)?(
                        props.displayModifier(props.getter())
                    ):(
                        props.getter()
                    )).toFixed(props.decimals??2)
                    
                    + (props.unit ?? " ")
                }</p>
            </div>
            <div class={styles.body}>
                <Show when={props.bounds.show!=undefined?props.bounds.show:true}>
                    <div class={styles.minmax} style={{left: `calc(50% - ${props.bounds.labelOffset ?? "20px"})`}}>
                        <p>{
                            (props.bounds.minDecimals) ?
                                props.bounds.min.toFixed(props.bounds.minDecimals) :
                                props.bounds.min
                        }</p>
                        <p>{
                            (props.bounds.maxDecimals) ?
                                props.bounds.max.toFixed(props.bounds.maxDecimals) :
                                props.bounds.max
                        }</p>
                    </div>
                </Show>
                <div class={styles.slider_container}>
                    <Show when={props.deadzones !== undefined}>
                        <div class={styles.ticks}>
                            <For each={props.deadzones ?? []}>
                                {(e) => (
                                    <div
                                        style={(props.direction == "H") ?
                                            { left: ((e.snapPoint - props.bounds.min) / (props.bounds.max  - props.bounds.min))*100 + "%" } : 
                                            { bottom: ((e.snapPoint - props.bounds.min) / (props.bounds.max  - props.bounds.min))*100 + "%" }
                                        }
                                        class={styles.tick}
                                    ></div>
                                )}
                            </For>
                        </div>
                    </Show>
                    <input 
                        class={styles.slider + " " + styles[props.direction]}
                        ref={slider}
                        type="range"
                        min={props.bounds.min}
                        max={props.bounds.max}
                        value={props.getter()}
                        step={props.step}
                        onPointerDown={() => {lastInputIsKey=false;}}
                        onKeyDown={() => {lastInputIsKey=true;}}
                        onInput={e => {
                            let value = +e.currentTarget.value;
                            if (!lastInputIsKey) {
                                for (let deadzone of props.deadzones ?? []) {
                                    if (Math.abs(value - deadzone.snapPoint) < deadzone.range) {
                                        e.currentTarget.value = deadzone.snapPoint.toString();
                                        value = deadzone.snapPoint;
                                        break;
                                    }
                                }
                            }
                            props.setter(value);
                            props.onInput?.(value);
                        }}
                        onChange={e => {
                            props.onChange?.(+e.currentTarget.value)
                        }}
                    ></input>
                </div>
            </div>
        </div>
    )
}
