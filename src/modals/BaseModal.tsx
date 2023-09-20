import {PropsWithChildren} from "react";
import {Dialog} from "@headlessui/react";

export interface BaseModalSettings {
    showModal: boolean
    closeModal: () => void
    title: string
}

export interface BaseModalProps extends BaseModalSettings, PropsWithChildren {

}

export function BaseModal(props: BaseModalProps) {
    return (
        <Dialog className='relative z-50' open={props.showModal} onClose={() => props.closeModal()}>
            {/* The backdrop, rendered as a fixed sibling to the panel container */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            {/* Full-screen container to center the panel */}
            <div className="fixed inset-0 flex w-screen items-center justify-center">
                {/* The actual dialog panel  */}
                <div className='w-screen'>
                    <Dialog.Panel className='mx-auto w-full max-w-3xl text-gray-100 p-5'>
                        <Dialog.Title className='flex justify-between rounded-t-lg bg-stone-900 p-2'>
                            <span className='p-2'>{props.title}</span>
                            <button
                                className='rounded-lg hover:bg-stone-800 p-2'
                                onClick={props.closeModal}
                            >
                                ❌
                            </button>
                        </Dialog.Title>
                        <div className='p-4 flex flex-col space-y-2 bg-stone-600 rounded-b-xl'>
                            {props.children}
                        </div>
                    </Dialog.Panel>
                </div>
            </div>
        </Dialog>
    )
}