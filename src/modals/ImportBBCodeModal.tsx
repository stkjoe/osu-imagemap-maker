import {useEffect, useState} from "react";
import {BaseModal, BaseModalSettings} from "./BaseModal.tsx";
import {LinkArea, parseBBCode, validateBBCode} from "../utils/BBCodeUtils.ts";
import {toast} from "react-toastify";

interface ImportImageModalProps extends BaseModalSettings {
    setUrl: (url: string) => void
    setLinkAreas: (linkAreas: LinkArea[]) => void
}

const INPUT_LABEL: string = 'import-bbcode-modal-input'

export function ImportBBCodeModal(props: ImportImageModalProps) {

    const [inputFieldValue, setInputFieldValue] = useState<string>("")

    useEffect(() => {
        setInputFieldValue("")
    }, [props.showModal]);
    
    function onClick() {
        if (!validateBBCode(inputFieldValue)) {
            toast.error("BBCode validation failed. Please check format and try again.")
            return
        }
        const parsedBBCode = parseBBCode(inputFieldValue)
        props.setUrl(parsedBBCode.imageUrl)
        props.setLinkAreas(parsedBBCode.linkAreas)
        props.closeModal()
    }

    return (
        <BaseModal
            showModal={props.showModal}
            closeModal={props.closeModal}
            title={props.title}
        >
            <label htmlFor={INPUT_LABEL}>
                Paste BBCode below and click 'Import BBCode'
            </label>
            <div
                className='flex flex-col space-y-2'
            >
                <textarea
                    placeholder='[imagemap]&#13;&#10;https//a.ppy.sh&#13;&#10;0 0 0 0 https://osu.ppy.sh username&#13;&#10;[/imagemap]'
                    autoComplete='off'
                    autoFocus
                    rows={4}
                    className='bg-stone-800 rounded-lg p-2 resize-none'
                    id={INPUT_LABEL}
                    name={INPUT_LABEL}
                    value={inputFieldValue}
                    onChange={(event) => setInputFieldValue(event.currentTarget.value)}
                />
                <button
                    className='justify-self-center bg-blue-600 hover:bg-blue-400 py-2 rounded-lg'
                    onClick={() => onClick()}
                >
                    Import BBCode
                </button>
            </div>
        </BaseModal>
    )
}