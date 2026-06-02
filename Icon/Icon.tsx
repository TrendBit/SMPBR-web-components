/**
 * This file contains tools for using material icons, with optimized loading to reduce net usage.
 * 
 * Use the following factory methods to create variants of IconStyles and Icon.
 */
import styles from './Icon.module.css'

/**
 * @brief should be placed on the start of page. Initializes the icons font;
 */
export function createIconStylesComponent<
    Tnames extends string,
    Tdict extends Record<Tnames, string>
>(
    iconCharacters: Tdict
) {
    function getUnicodeRange(chars: readonly string[]) {
        const result = chars.map(char => {
            const code = char.charCodeAt(0);
            const hex = code.toString(16).toUpperCase().padStart(4, '0');
            return `U+${hex}`;
        }).join(", ");
        return result;
    }
    function IconStyles() {
        return (
            <style>{
                `@font - face {
                font-family: 'Material Icons';
                font-style: normal;
                src: url('/fonts/GoogleMaterialIcons.woff2') format('woff2');
                unicode-range: ${getUnicodeRange(Object.values(iconCharacters))};
                }`
            }</style>
        )
    }
    
    return IconStyles;
}

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
