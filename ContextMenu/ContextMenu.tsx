import { createContext, useContext, createSignal, For, createEffect, onCleanup, onMount } from "solid-js";
import styles from "./ContextMenu.module.css"

export type MenuOption = {
    label: string;
    class?: string;
    action: () => void;
};

export type MenuPosition = {
    x: number;
    y: number;
};

export type alignType = "left-top" | "right-top" | "left-bottom" | "right-bottom"

export type ContextMenuValue = {
    isOpen: () => boolean;
    open: (options: MenuOption[], position: MenuPosition | HTMLElement, align?: alignType) => void;
};

interface ContextMenuProviderProps {
    children: any;
}

const ContextMenuContext = createContext<ContextMenuValue>();

export function ContextMenuProvider(props: ContextMenuProviderProps) {
    const [isOpen, setIsOpen] = createSignal(false);
    const [position, setPosition] = createSignal<MenuPosition>({ x: 0, y: 0 })
    const [align, setAlign] = createSignal<alignType>("left-top")
    const [options, setOptions] = createSignal<MenuOption[]>([])
    let element: HTMLDivElement | undefined;
    let anchor: HTMLDivElement | undefined;
    let firstClick: boolean = false;
    
    function open(options: MenuOption[], targetPosition: MenuPosition | HTMLElement, align: alignType = "left-top") {
        if (element === undefined || anchor === undefined) {
            return
        }
        if (targetPosition instanceof HTMLElement) {
            const elementPos = targetPosition.getBoundingClientRect();
            switch (align) {
                case "left-top":
                    targetPosition = { x: elementPos.left, y: elementPos.top };
                    break;
                case "right-top":
                    targetPosition = { x: elementPos.right, y: elementPos.top };
                    break;
                case "left-bottom":
                    targetPosition = { x: elementPos.left, y: elementPos.bottom };
                    break;
                case "right-bottom":
                    targetPosition = { x: elementPos.right, y: elementPos.bottom };
                    break;
            }
            
        }

        const offset = anchor.getBoundingClientRect();
        const lastPos = position()

        firstClick = true;
        
        setPosition({
            x: targetPosition.x - offset.x + lastPos.x,
            y: targetPosition.y - offset.y + lastPos.y
        })
        setAlign(align)
        setOptions(options)
    }

    function close() {
        setOptions([])
    }
    
    createEffect(() => {
        console.log("options changed: ",options(), "empty", options().length > 0)
        setIsOpen(options().length > 0)
    })

    onMount(() => {
        const handler = (e: MouseEvent) => {
            if (!element || !isOpen() || firstClick) {
                firstClick = false;
                return
            };
            const r = element.getBoundingClientRect();
            const hit =
                e.clientX >= r.left &&
                e.clientX <= r.right &&
                e.clientY >= r.top &&
                e.clientY <= r.bottom;
            if (!hit) {
                close()
            }
            console.log("Mouse clicked at: ",e, "\nis hit:",hit)
        };
        document.addEventListener("click", handler);
        onCleanup(() => document.removeEventListener("click", handler));
    });

    function toStylePosition(position: MenuPosition) {
        return {
            top: position.y + "px",
            left: position.x + "px",
        }
    }

    function toStyleAlign(align: alignType) {
        switch (align) {
            case "left-top":
                return {
                    left: "0px",
                    top: "0px"
                }
            case "right-top":
                return {
                    right: "0px",
                    top: "0px"
                }
            case "left-bottom":
                return {
                    left: "0px",
                    bottom: "0px"
                }
            case "right-bottom":
                return {
                    right: "0px",
                    bottom: "0px"
                }
        }
    }
    
    return (
        <ContextMenuContext.Provider
            value={{
                isOpen,
                open,
            }}
        >
            <div class={styles.anchor} ref={anchor} style={toStylePosition(position())}>
                <div classList={{
                    [styles.container]: true,
                    [styles.hidden]: !isOpen()
                }} ref={element} style={toStyleAlign(align())}>
                    <For each={options()}>
                        {(opt) => (
                            <p class={opt.class + " " + styles.option} onclick={(e) => { close(); opt.action(); e.stopPropagation(); }}>{opt.label}</p>
                        )}
                    </For>
                </div>
            </div>
            {props.children}
        </ContextMenuContext.Provider>
    );
}

export const useContextMenu = () => {
    const ctx = useContext(ContextMenuContext);
    if (ctx === undefined) {
        throw new Error("ContextMenu context is required!");
    }
    return ctx;
};
