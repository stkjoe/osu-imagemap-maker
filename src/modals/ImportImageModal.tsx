import {BaseModal, BaseModalSettings} from "./BaseModal.tsx";
import {useEffect, useState} from "react";
import {URL_PATTERN} from "../utils/BBCodeUtils.ts";
import {toast} from "react-toastify";

interface ImportImageModalProps extends BaseModalSettings {
    setUrl: (url: string) => void
}

const INPUT_LABEL: string = 'import-image-modal-url-input'

export function ImportImageModal(props: ImportImageModalProps) {

    const [inputFieldValue, setInputFieldValue] = useState<string>("")

    useEffect(() => {
        setInputFieldValue("")
    }, [props.showModal]);

    return (
        <BaseModal
            showModal={props.showModal}
            closeModal={props.closeModal}
            title={props.title}
        >
            <label htmlFor={INPUT_LABEL}>
                Paste Image URL below and click 'Load Image'
            </label>
            <div
                className='flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0'
            >
                <input
                    placeholder='https://...'
                    autoComplete='off'
                    autoFocus
                    className='bg-stone-800 rounded-lg p-2 sm:flex-1'
                    id={INPUT_LABEL}
                    name={INPUT_LABEL}
                    value={inputFieldValue}
                    onChange={(event) => setInputFieldValue(event.currentTarget.value)}
                />
                <button
                    className='justify-self-center bg-blue-600 hover:bg-blue-400 sm:w-48 py-2 rounded-lg'
                    onClick={() => {
                        if (!URL_PATTERN.test(inputFieldValue)) {
                            toast.error("Invalid URL. Please check then try again.")
                            return
                        }
                        props.setUrl(inputFieldValue)
                    }}
                >
                    Load Image
                </button>
            </div>
        </BaseModal>
    )
}