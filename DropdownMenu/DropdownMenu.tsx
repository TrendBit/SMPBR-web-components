import { createEffect, For } from "solid-js";

interface DropdownMenuProps<T extends readonly string[]>{
    options: {value: T[number], label: string}[],
    getter: () => T[number];
    setter: (value: T[number]) => void;
    class?: string,
    onChange?: (value: T[number])=>void
}

export function DropdownMenu<T extends readonly string[]>(props: DropdownMenuProps<T>) {
    let el: HTMLSelectElement | undefined;
    let lastOption : T[number] | undefined;
    createEffect(() => {
        if (el) {
            const currOption = props.getter();
            if (lastOption === currOption) {
                return;
            }
            lastOption = currOption;
            for (let i = 0; i < el.options.length; i++){
                if (el.options[i].value === currOption) {
                    el.selectedIndex = i;
                }
            }
        }
    })
    
    function updateSelection(value : string){
        props.setter(value as T[number]);
    }
    return(
        <select ref={el} onChange={(e) => { updateSelection(e.currentTarget.value); props.onChange?.(e.currentTarget.value as T[number])}} class={props.class}>
            <For each={props.options}>
                {(option) => (
                    <option
                        value={option.value}
                    >{option.label}</option>
                )}
            </For>
        </select>
    )
}
