import { createUniqueId, For } from "solid-js";
import styles from "./RadialSelect.module.css"

interface RadialOptionProps{
    groupName : string;
    value: string;
    label: string;
    checked?:boolean;
    class?:string;
    onChange?: (value : string) => void;
}

export function RadialOption(props : RadialOptionProps) {
  const id = createUniqueId();

  return (
    <div class={props.class + " "+ styles.radial}>
      <input 
        type="radio" 
        id={id} 
        name={props.groupName} 
        value={props.value} 
        checked={props.checked}
        onChange={e => props.onChange?.(e.currentTarget.value)}
      />
      <label for={id}>{props.label}</label>
    </div>
  );
}

interface RadialSelectProps<T extends readonly string[]>{
    groupName : string;
    selections: {
        value: T[number];
        label: string;
    }[];
    defaultSelectedIndex?:number;
    getter: ()=>T[number];
    setter: (value: T[number])=>void;
}

export function RadialSelect<T extends readonly string[]>(props : RadialSelectProps<T>){
    function updateSelection(value : string){
        props.setter(value as T[number]);
    }
    return(
        <div class={styles.container}>
            <For each={props.selections}>
                {(selection, index) => (
                    <RadialOption
                        groupName={props.groupName}
                        value={selection.value}
                        label={selection.label}
                        checked={
                            props.getter() == selection.value
                        }
                        onChange={updateSelection}
                    ></RadialOption>
                )}
            </For>
        </div>
    )
}
