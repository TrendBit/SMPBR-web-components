import { For } from 'solid-js'
import styles from './PopupPanel.module.css'

export interface Popup {
  message: string,
  details: string,
  severity: "error" | "warning" | "info",
}

export interface PopupPanelProps {
    getter : () => Array<Popup>
    setter : (value : Array<Popup>) => void
    timeout?: number
    width ?: string
    autoHide?: boolean
}

export function PopupPanel(props : PopupPanelProps){
    function removePopup(index : number){
        let newArr = props.getter();
        console.error(newArr);
        newArr = newArr.filter((_,i)=>(i!==index)); 
        console.error(newArr);
        props.setter(newArr);
    }

    return (
        <div 
            classList={{
                [styles.popup_panel]:true,
                [styles.hidden]:props.getter().length == 0 && (props.autoHide ?? true)
            }}
            style={{
                width: props.width
            }}
        >
            <p class={styles.close_text}>click on a popup to close it</p>
            <For each={props.getter()}>
                {(el,index)=>(
                    <button 
                        classList={{
                            [styles.popup]:true,
                            [styles.info]:el.severity == "info",
                            [styles.warning]:el.severity == "warning",
                            [styles.error]:el.severity == "error"
                        }}
                        onclick={e=>removePopup(index())}
                    >
                        <p class={styles.error_text}>{el.message}</p>
                        <p class={styles.message_text}>{el.details}</p>
                    </button>
                )}
            </For>
        </div>
    )
}
