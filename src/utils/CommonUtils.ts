import {toast} from "react-toastify";

/**
 * Copy content to clipboard.
 */
export function copyToClipboard(content: string) {
    navigator.clipboard.writeText(content).then(() => {
        toast.success("Successfully saved to clipboard!")
    })
}

export const TEXT_AREA_PLACEHOLDER_NEW_LINE = '&#13;&#10;';
