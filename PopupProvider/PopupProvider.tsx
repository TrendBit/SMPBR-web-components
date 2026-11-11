import { createContext, useContext, createSignal, onMount, onCleanup, JSXElement, JSX } from "solid-js";
import { For } from "solid-js";

import styles from "./PopupProvider.module.css"
import { isString, waitForNextFrame } from "../../../lib/web-components/other/utils";

type Severity = "error" | "warning" | "info"
type PopupID = number
type Popup = {
    id: PopupID,
    lastInteract: {
        set: (value: Date | undefined) => void,
        get: () => Date | undefined
    },
    value: any,
    title: string
    severity: Severity
}
export type PopupOptions = {
    value: any,
    severity: Severity,
    title: string
}
export type PopupContextValue = {
    popups: () => Popup[],
    actions: {
        push: (options: PopupOptions) => void,
        clearAll: () => void
    }
}

type CustomPopupBodyRenderer = (value: any) => JSXElement | undefined

function renderPopupBody(value: any, customRenderer: CustomPopupBodyRenderer | undefined): JSXElement{
    console.error(value);
    const customRender = customRenderer?.(value);
    if (customRender !== undefined) {
        return customRender
    }
    if (isString(value)) {
        return <p>{value}</p>
    }
    if (value instanceof Error) {
        return <p>{value.message}</p>
    }
    return <></>
}

interface PopupElementProps {
    target: Popup, 
    customRenderer: CustomPopupBodyRenderer | undefined, 
    onHoverStart: () => void, 
    onHoverEnd: () => void,
    close: () => void,
    timeout: number,
    isLeaving: () => boolean
}

const FLIP_DURATION_MS = 300;
const EXIT_DURATION_MS = 300;

function flip(container: HTMLElement | undefined, mutate: () => void) {
    if (container === undefined) {
        mutate();
        return;
    }

    const first = new Map<string, number>();
    for (const child of Array.from(container.children) as HTMLElement[]) {
        const id = child.dataset.popupId;
        if (id !== undefined) {
            first.set(id, child.getBoundingClientRect().top);
        }
    }

    mutate();

    requestAnimationFrame(() => {
        for (const child of Array.from(container.children) as HTMLElement[]) {
            const id = child.dataset.popupId;
            if (id === undefined) {
                continue;
            }
            const before = first.get(id);
            if (before === undefined) {
                continue;
            }
            const dy = before - child.getBoundingClientRect().top;
            if (Math.abs(dy) < 1) {
                continue;
            }
            child.animate(
                [
                    { transform: "translateY(" + dy.toString() + "px)" },
                    { transform: "translateY(0)" }
                ],
                { duration: FLIP_DURATION_MS, easing: "ease-in-out" }
            );
        }
    });
}

function getStyles(progress: number | undefined, timeout: number): JSX.CSSProperties {
    if (progress === undefined) {
        return {
            width: "0%",
            transition: "width 0s ease-in-out"
        }
    }
    
    return {
        width: progress + "%",
        transition: "width " + (timeout / 1000).toString() + "s linear"
    }
}

function PopupElement(props: PopupElementProps) {
    const [progress, setProgress] = createSignal<number | undefined>(0);
    const [secondFrame, setSecondFrame] = createSignal<boolean>(false);

    onMount(async () => {
        await waitForNextFrame();
        setProgress(100);
        setSecondFrame(true);
    })

    return (
        <div
            data-popup-id={props.target.id}
            classList={{
                [styles.popup]: true,
                [styles[props.target.severity]]: true,
                [styles.second_frame]: secondFrame(),
                [styles.leaving]: props.isLeaving()
            }}
            onMouseEnter={() => { props.onHoverStart(); setProgress(undefined); }}
            onMouseLeave={() => { props.onHoverEnd(); setProgress(100); }}
        >
            <div class={styles.header}>
                <p>{props.target.title}</p>
                <button
                    class={styles.close_button}
                    onclick={props.close}
                >
                    <p>X</p>
                </button>
            </div>
            <div class={styles.progress_container}>
                <div class={styles.progress} style={getStyles(progress(),props.timeout)}>
                    
                </div>
            </div>
            <div class={styles.body}>
                {renderPopupBody(props.target.value, props.customRenderer)}
            </div>
        </div>
    )
}

const DEFAULT_POPUP_TIMEOUT: number = 3000;

interface PopupProviderProps {
    children: any;
    timeout?: number;
    customPopupBodyRenderer?: CustomPopupBodyRenderer
}
const PopupContext = createContext<PopupContextValue>();

export function PopupProvider(props: PopupProviderProps) {
    const [popups, setPopups] = createSignal<Popup[]>([]);
    const [leaving, setLeaving] = createSignal<Set<PopupID>>(new Set());
    const timers = new Map<PopupID, ReturnType<typeof setTimeout>>();
    const exitTimers = new Map<PopupID, ReturnType<typeof setTimeout>>();
    const timeout = props.timeout ?? DEFAULT_POPUP_TIMEOUT;
    let currId = 0;
    let popupsRef!: HTMLDivElement;
    let clearAllExitTimer: ReturnType<typeof setTimeout> | undefined;

    function untrackLeaving(id: PopupID) {
        setLeaving((current) => {
            const next = new Set(current);
            next.delete(id);
            return next;
        });
    }

    function schedule(popup: Popup) {
        if (popup.lastInteract.get() === undefined) {
            return;
        }

        const current = timers.get(popup.id);
        if (current !== undefined) {
            clearTimeout(current);
        }

        timers.set(popup.id, setTimeout(() => remove(popup.id), timeout));
    }

    function remove(id: PopupID) {
        if (leaving().has(id)) {
            return;
        }

        const timer = timers.get(id);
        if (timer !== undefined) {
            clearTimeout(timer);
            timers.delete(id);
        }

        setLeaving((current) => new Set(current).add(id));

        const exitTimer = setTimeout(() => {
            exitTimers.delete(id);
            flip(popupsRef, () => setPopups((current) => current.filter((item) => item.id !== id)));
            untrackLeaving(id);
        }, EXIT_DURATION_MS);

        exitTimers.set(id, exitTimer);
    }

    function push(options: PopupOptions) {
        const [lastInteract, setLastInteract] = createSignal<Date>(new Date());
        const popup: Popup = {
            id: currId,
            lastInteract: {
                get: lastInteract,
                set: setLastInteract
            },
            value: options.value,
            severity: options.severity,
            title: options.title
        };
        
        currId += 1;

        flip(popupsRef, () => setPopups((current) => [...current, popup]));
        schedule(popup);
    }

    function clearAll() {
        for (const timer of timers.values()) {
            clearTimeout(timer);
        }
        timers.clear();

        for (const timer of exitTimers.values()) {
            clearTimeout(timer);
        }
        exitTimers.clear();

        if (clearAllExitTimer !== undefined) {
            clearTimeout(clearAllExitTimer);
            clearAllExitTimer = undefined;
        }

        const ids = popups().map((popup) => popup.id);
        if (ids.length === 0) {
            return;
        }

        setLeaving(new Set(ids));

        clearAllExitTimer = setTimeout(() => {
            clearAllExitTimer = undefined;
            flip(popupsRef, () => setPopups((current) => current.filter((item) => !ids.includes(item.id))));
            setLeaving(new Set<PopupID>());
        }, EXIT_DURATION_MS);
    }

    function interactStart(popup: Popup) {
        if (!popups().some((item) => item.id === popup.id) || leaving().has(popup.id)) {
            return;
        }

        const timer = timers.get(popup.id);
        if (timer !== undefined) {
            clearTimeout(timer);
            timers.delete(popup.id);
        }

        popup.lastInteract.set(undefined);
    }

    function interactEnd(popup: Popup) {
        if (!popups().some((item) => item.id === popup.id) || leaving().has(popup.id)) {
            return;
        }

        popup.lastInteract.set(new Date());
        schedule(popup);
    }

    onCleanup(() => {
        for (const timer of timers.values()) {
            clearTimeout(timer);
        }
        timers.clear();

        for (const timer of exitTimers.values()) {
            clearTimeout(timer);
        }
        exitTimers.clear();

        if (clearAllExitTimer !== undefined) {
            clearTimeout(clearAllExitTimer);
            clearAllExitTimer = undefined;
        }
    });


    return (
        <PopupContext.Provider value={{
            popups: popups,
            actions: {
                push: push,
                clearAll: clearAll
            }
        }}>
            {props.children}
            <div class={styles.popups_container}>
                <div class={styles.popups} ref={popupsRef}>
                    <For each={popups()}>
                        {(popup) => (
                            <PopupElement
                                target={popup}
                                onHoverStart={() => interactStart(popup)}
                                onHoverEnd={() => interactEnd(popup)}
                                close={() => remove(popup.id)}
                                customRenderer={props.customPopupBodyRenderer}
                                timeout={timeout}
                                isLeaving={() => leaving().has(popup.id)}
                            ></PopupElement>
                        )}
                    </For>
                </div>
            </div>
        </PopupContext.Provider>
    );
}

export const usePopupContext = () => useContext(PopupContext);
