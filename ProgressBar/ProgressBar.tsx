import styles from "./ProgressBar.module.css"

interface ProgressBarProps {
    value: number,
    color?: string,
    large?: boolean,
    class?: string,
    direction?: "vertical" | "horizontal" | "verical-inverted" | "horizontal-inverted"
}

export function ProgressBar(props : ProgressBarProps) {
    return (
        <div classList={{
            [styles.container]: true,
            [styles.large]: props.large,
            [props.direction ?? "H"]: true
        }} class={props.class}>
            <div
                class={styles.progress_fill}
                style={{ width: (props.value) + "%", color: (props.color) }}
            ></div>
        </div>
    )
}