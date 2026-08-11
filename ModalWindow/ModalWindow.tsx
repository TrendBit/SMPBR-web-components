import {
    createContext,
    createSignal,
    Show,
    useContext,
    type JSXElement,
} from "solid-js";
import { Mutex } from "../other/objects/mutex";
import styles from "./ModalWindow.module.css";
import { Icon } from "../../../components/Icon/Icon";
import { Button } from "../Button/Button";
import { DeferredPromise } from "../other/objects/deferredPromise";

interface ModalWindowProps {
    content: ()=>JSXElement;
    closeCallback: () => Promise<void>;
}

function ModalWindow(props: ModalWindowProps) {
    return (
        <div class={styles.background}>
            <div class={styles.container}>
                <div class={styles.header}>
                    <div>

                    </div>
                    <Button flat={true} tooltip="close this window" callback={props.closeCallback}>
                        <Icon class={styles.close_button} name="cancel"></Icon>
                    </Button>
                </div>
                <div class={styles.content}>
                    {props.content()}
                </div>
            </div>
        </div>
    );
}

interface ModalWindowProviderProps {
    children: JSXElement;
}

export type ModalWindowContextValue = {
    popup: (content: ()=>JSXElement) => Promise<void>;
    close: () => Promise<void>
};

const ModalWindowContext = createContext<ModalWindowContextValue>();

export function ModalWindowProvider(props: ModalWindowProviderProps) {
    const [windowContent, setWindowContent] = createSignal<(()=>JSXElement )| undefined>(undefined);
    let accessMutex = new Mutex();
    let unlockCallback: (() => void) | undefined = undefined

    let closedPromise : undefined | DeferredPromise = undefined

    async function close() {
        if (unlockCallback) {
            setWindowContent(undefined);

            closedPromise?.resolve()
            closedPromise = undefined

            unlockCallback()
        }
    }

    async function popup(content: (()=>JSXElement)) {
        console.log("waiting to show modal window");
        unlockCallback = await accessMutex.lock();
        console.log("showing modal window");

        // wrap so the function is stored as a value, not treated as an updater
        setWindowContent(() => content);
        closedPromise = new DeferredPromise()

        await closedPromise.promise
    }

    return (
        <ModalWindowContext.Provider
            value={{
                popup: popup,
                close: close
            }}
        >
            <Show when={windowContent() !== undefined}>
                <ModalWindow
                    closeCallback={close}
                    content={windowContent() as ()=>JSXElement}
                ></ModalWindow>
            </Show>
            {props.children}
        </ModalWindowContext.Provider>
    );
}

export const useModalWindow = () => useContext(ModalWindowContext);
