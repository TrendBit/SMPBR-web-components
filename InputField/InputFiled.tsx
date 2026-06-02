import { enforceMax, enforceMin } from "../other/inputFilters";
import styles from "./InputField.module.css"


interface InputElementProps{
    unit : string;
    setter : (value : number) => void;
    getter : () => number;
    min? : number;
    max? : number;
}


export function InputField(props: InputElementProps) {
    return (
        <div class={styles.input_container}>
            <input
                class={"button"}
                type="text"
                onInput={e => {
                    if (props.max) {
                        e.currentTarget.value = enforceMax(e.currentTarget.value,props.max);
                    }
                }}
                onChange={e => {
                    if (props.min) {
                        e.currentTarget.value = enforceMin(e.currentTarget.value,props.min);
                    }
                    props.setter(+e.currentTarget.value)
                }}
                value={props.getter()}
            ></input>
            <div class={styles.input_unit}>
                <p>
                    {props.unit}
                </p>
            </div>
        </div>
    )
}
