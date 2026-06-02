import { createSignal } from "solid-js";
import styles from "./ValueController.module.css"
import { enforceMax, enforceMin } from "../other/inputFilters";
import { ValueDisplay } from "../ValueDisplay/ValueDisplay";
import { Button } from "../Button/Button";
import { isNumber } from "../other/utils";

interface ValueControllerProps{
    title : string,
    valueName : string,
    buttonText : string,
    unit? : string,
    error? : boolean,
    
    getter : () => number | undefined,
    setter : (value : number | undefined) => void,

    onSubmit? : (value : number | undefined)=>Promise<void>,
    onChange? : (value : number | undefined)=>void,
    onInput? : (value : number | undefined)=>void,
    onClick? : () => Promise<boolean>
    buttonTooltip : string

    min?: number;
    max?: number;
}

function getInputPlaceholder(min?:number,max?:number,unit?:string){
    let unitStr = unit?(" " + unit):"";
    if(isNumber(min) && isNumber(max)){
        return `${min} - ${max}${unitStr}`
    }
    if(isNumber(min)){
        return `≤ ${max}${unitStr}`
    }
    if(isNumber(max)){
        return `≥ ${min}${unitStr}`
    }
}

export function ValueController(props : ValueControllerProps){
    const [input, setInput] = createSignal("");
    let inputField : HTMLInputElement | undefined;

    return (
        <div class={styles.container}>
            <div class={styles.top}>
                <p class={styles.label}>
                    {props.title}
                </p>
                <p class={styles.valueLabel}>
                    {(props.valueName || "current value") + ": "}
                    <ValueDisplay 
                        class={styles.value} 
                        value={props.getter()?.toString()} 
                        numberOnly={{decimalPlaces: 2}} 
                        unit={props.unit}
                        error={props.error}
                    ></ValueDisplay>
                </p>
            </div>
            <div class={styles.bottom}>
                <Button 
                    callback={props.onClick}
                    tooltip={props.buttonTooltip}
                >{props.buttonText}</Button>
                <div class={styles["input-container"]}>
                    <input 
                        class={"button " + styles.input}
                        type="text"
                        ref={inputField}
                        placeholder={
                            getInputPlaceholder(props.min,props.max,props.unit)
                        }
                        onInput={e => {
                            if(isNumber(props.max)){
                                e.currentTarget.value = enforceMax(e.currentTarget.value,props.max);
                            }
                            setInput(e.currentTarget.value);
                            props.onInput?.(props.getter());
                        }}
                        onChange={e => {
                            if(isNumber(props.min)){
                                e.currentTarget.value = enforceMin(e.currentTarget.value,props.min);
                            }
                            props.onChange?.(props.getter());
                        }}
                    ></input>

                    <Button 
                        disabled={input()===""}
                        class={"button " + styles["set-button"]}
                        tooltip="send the value to api"
                        disabledTooltip="no value set"
                        callback={async () => {
                            if(inputField){
                                if(inputField.value!=""){
                                    let val = +inputField.value;
                                    props.setter(val);
                                    await props.onSubmit?.(val);
                                }
                            }
                            return true;
                        }}
                    >set</Button>
                </div>
            </div>
        </div>
    )
}