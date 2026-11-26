import { apiUploadProgress } from "../../common-types/Utility"
import { formatBytes, timeElapsedString } from "../other/utils"
import { ProgressBar } from "../ProgressBar/ProgressBar"
import styles from "./UploadProgress.module.css"



interface UploadProgressProps {
    value: apiUploadProgress | undefined
}

function getTimeElapsed(elapsed: number | undefined) {
    if (elapsed === undefined) {
        return ""
    }
    elapsed = Math.ceil(elapsed/1000)*1000
    return timeElapsedString(elapsed, {
        shortLabels: true,
        excludeLabel: true
    })
}

export function UploadProgress(props : UploadProgressProps) {
    return (
        <div class={styles.progress}>
            <ProgressBar
                value={props.value?.percent ?? 0}
            ></ProgressBar>
            <div class={styles.progress_details}>
                <p>{formatBytes(props.value?.loaded)} / {formatBytes(props.value?.total)}</p>
                <p>{formatBytes(props.value?.bytesPerSecond)}/s</p>
            </div>
            <div class={styles.progress_details}>
                <p>elapsed: {getTimeElapsed(props.value?.timeElapsed).trim()}</p>
                <p>ETA: {getTimeElapsed(props.value?.timeRemaining)}</p>
            </div>
        </div>
    )
}