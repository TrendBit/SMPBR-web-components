/**
 * This file contains tools for using material icons.
 * 
 * Use the following factory method to create a variant of Icon.
 */
import styles from './Icon.module.css'

/**
 * @brief used for creating a component, displaying a single icon
 */
export function createIconComponent<
    Tnames extends string,
    Tdict extends Record<Tnames, string>
>(
    iconDictionary: Tdict
) {
    interface IconProps {
        name: Tnames;
        filled?: boolean;
        color?: string;
        class?: string;
        scale?: number;
        animateColor?: boolean;
    }
    
    function Icon(props: IconProps) {
        return (
            <span
                class={props.class}
                classList={{
                    [styles.icon]: true,
                    [styles.filled]: props.filled ?? true,
                    [styles.color_animated]: props.animateColor ?? false,
                    ["icon"]: true
                }}
                style={{
                    color: props.color,
                    scale: props.scale
                }}
            >
                {iconDictionary[props.name]}
            </span>
        )
    };
    
    return Icon;
}
