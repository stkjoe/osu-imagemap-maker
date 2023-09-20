import {MouseEvent, useEffect, useRef, useState} from 'react';
import {Rnd} from 'react-rnd';

import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {copyToClipboard} from "./utils/CommonUtils.ts";
import {convertPercentageToSize, convertSizeToPercentage} from "./utils/NumberUtils.ts";
import {generateImageMapBbCode, LinkArea, parseBBCode, URL_PATTERN} from "./utils/BBCodeUtils.ts";
import {ImportImageModal} from "./modals/ImportImageModal.tsx";
import {ImportBBCodeModal} from "./modals/ImportBBCodeModal.tsx";


function App() {
    // The loaded image URL.
    const [imageUrl, _setImageUrl] = useState<string>('')
    // A React reference to the image.
    const imageRef = useRef<HTMLImageElement>(null)
    // The starting coordinate for a new link area.
    const [startingCoordinate, setStartingCoordinate] = useState<number[]>([])
    // The current coordinate for a new link area.
    const [currentCoordinate, setCurrentCoordinate] = useState<number[]>([])
    // Whether a new link area is currently being created.
    const [creatingNewLinkArea, setCreatingNewLinkArea] = useState<boolean>(false)
    // The currently defined link areas.
    const [linkAreas, setLinkAreas] = useState<LinkArea[]>([])
    // The last modified link area index.
    const [lastModifiedLinkAreaIndex, setLastModifiedLinkAreaIndex] = useState<number>(-1)
    const [imageLoaded, setImageLoaded] = useState<boolean>(false)

    // Modal display states
    const [showImportImageModal, setShowImportImageModal] = useState<boolean>(false)
    const [showImportBBCodeModal, setShowImportBBCodeModal] = useState<boolean>(false)

    const MIN_LINK_AREA_SIZE = 30

    useEffect(() => {
        const bbCode = localStorage.getItem("bbCode")
        if (bbCode != null) {
            const parsedBBCode = parseBBCode(bbCode)
            setImageUrl(parsedBBCode.imageUrl)
            setLinkAreas(parsedBBCode.linkAreas)
        }
    }, []);

    /**
     * Add event listeners for mouse controls.
     */
    useEffect(() => {
        /**
         * When moving the mouse and in the middle of creating a new link area,
         * update the current coordinate.
         * @param event
         */
        const handleMouseMove = (event: any) => {
            if (creatingNewLinkArea) {
                const coords = getImagePointerCoordinates(event)
                coords[0] = Math.max(0, Math.min(coords[0], imageRef!.current?.width!))
                coords[1] = Math.max(0, Math.min(coords[1], imageRef!.current?.height!))
                setCurrentCoordinate(coords)
            }
        }

        /**
         * When the mouse button is released and in the middle of creating a new link area,
         * create the new link area.
         */
        const handleMouseUp = () => {
            if (creatingNewLinkArea) {
                setCreatingNewLinkArea(false)

                createNewLinkArea(
                    convertSizeToPercentage(
                        Math.min(startingCoordinate[0], currentCoordinate[0], imageRef!.current?.width! - MIN_LINK_AREA_SIZE),
                        imageRef!.current?.width!
                    ),

                    convertSizeToPercentage(
                        Math.min(startingCoordinate[1], currentCoordinate[1], imageRef!.current?.height! - MIN_LINK_AREA_SIZE),
                        imageRef!.current?.height!
                    ),
                    convertSizeToPercentage(
                        Math.max(MIN_LINK_AREA_SIZE, Math.abs(currentCoordinate[0] - startingCoordinate[0])),
                        imageRef!.current?.width!
                    ),
                    convertSizeToPercentage(
                        Math.max(MIN_LINK_AREA_SIZE, Math.abs(currentCoordinate[1] - startingCoordinate[1])),
                        imageRef!.current?.height!
                    )
                )
            }
        }

        document.addEventListener('mouseup', handleMouseUp)
        document.addEventListener('mousemove', handleMouseMove)

        return () => {
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('mousemove', handleMouseMove)
        }
    }, [creatingNewLinkArea, startingCoordinate, currentCoordinate])

    useEffect(() => {
        if (imageLoaded && imageUrl != '') {
            localStorage.setItem("bbCode", generateImageMapBbCode(linkAreas, imageUrl, false))
        }
    }, [linkAreas, imageUrl, imageLoaded]);

    function setImageUrl(url: string) {
        setImageLoaded(url != '' && (imageUrl == url || false))
        _setImageUrl(url)
        setShowImportImageModal(false)
        setLinkAreas([])
        localStorage.removeItem("bbCode")
    }

    /**
     * Event listener to force re-render on resize.
     */
    useEffect(() => {
        const handleResize = () => {
            setLinkAreas((prevState) => [...prevState])
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    /**
     * Update the linkArea settings at the given index.
     * @param index specifies which of the existing LinkAreas to update.
     * @param newLinkArea specified the new settings to override the existing LinkArea.
     */
    function updateLinkArea(index: number, newLinkArea: LinkArea) {
        const newLinkAreas = [...linkAreas]
        newLinkAreas[index] = newLinkArea
        setLinkAreas(newLinkAreas)
    }

    /**
     * Removes the LinkArea at the given index.
     * @param index identifies the LinkArea by index to remove.
     */
    function removeLinkAreaByIndex(index: number) {
        const newLinkAreas = [...linkAreas]
        newLinkAreas.splice(index, 1)
        setLinkAreas(newLinkAreas)
    }

    /**
     * Generate osu! BBCode code to use to display image map.
     */
    function generateCode(): string {
        return generateImageMapBbCode(linkAreas, imageUrl)
    }

    /**
     * Get x-y coordinates for any given click on the loaded image.
     */
    function getImagePointerCoordinates(event: MouseEvent<HTMLImageElement, MouseEvent>) {
        return [event.clientX - imageRef.current!.x, event.clientY - imageRef.current!.y]
    }

    /**
     * On mouse down, set creating new link area status to true, and set coordinates.
     */
    function onMouseDown(event: any) {
        setCreatingNewLinkArea(true)
        setCurrentCoordinate(getImagePointerCoordinates(event))
        setStartingCoordinate(getImagePointerCoordinates(event))
    }

    /**
     * Copy generated code to clipboard.
     */
    function copyCodeToClipboard() {
        copyToClipboard(generateCode())
    }

    /**
     * Create new link area
     * @param x the pixel x-coordinate of the top left corner of the link area.
     * @param y the pixel y-coordinate of the top left corner of the link area.
     * @param width the pixel width of the link area.
     * @param height the pixel height of the link area.
     */
    function createNewLinkArea(x: number, y: number, width: number, height: number) {
        setLinkAreas((prevState) => [
            ...prevState,
            {
                x: x,
                y: y,
                width: width,
                height: height,
                link: '',
                name: ''
            } as LinkArea
        ])
        setLastModifiedLinkAreaIndex(linkAreas.length)
    }

    const allUrlsValid = linkAreas.find(it => !URL_PATTERN.test(it.link)) == undefined

    return (
        <div className='min-h-screen bg-stone-800 text-gray-100 flex flex-col'>
            <header className='flex flex-row bg-stone-900 w-screen p-2 justify-between'>
                <a href=''>
                    <h2 className='text-lg p-2 select-none'>
                        osu! imagemap mapper
                    </h2>
                </a>
                <a href='https://github.com/stkjoe/osu-imagemap-maker' title='View Repo in Github'
                   className='hover:bg-stone-700 p-2 rounded-xl flex items-center'
                >
                    <svg aria-hidden="true" height="24" viewBox="0 0 16 16" version="1.1" width="24"
                         className="fill-white">
                        <path
                            d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                    </svg>
                </a>
            </header>
            <main className='flex-grow'>
                <div
                    className='mx-auto max-w-5xl w-screen lg:flex-grow-0 lg:my-4 py-8 px-6 bg-stone-700 lg:rounded-lg space-y-3 flex flex-col'>
                    {!imageUrl && !imageLoaded &&
                        <>
                            <a
                                className='text-center'>
                                This is a tool used to easily generate BBCode image maps for osu! pages.
                                <br/>
                                This is not an image uploader site. You will need to upload the image first to an image host.
                                <br/>
                                <b>Note: Imgur doesn't work for some reason so don't use that</b>

                            </a>
                            <div
                                className='bg-stone-800 p-4 rounded-xl flex flex-col sm:flex-row sm:justify-center space-y-2 sm:space-y-0 sm:space-x-8'>
                                <button
                                    className='justify-self-center bg-blue-600 hover:bg-blue-400 w-full sm:w-48 py-2 rounded-lg'
                                    onClick={() => setShowImportImageModal(true)}
                                >
                                    Load Image from URL
                                </button>
                                <button
                                    className='justify-self-center bg-blue-600 hover:bg-blue-400 w-full sm:w-48 py-2 rounded-lg'
                                    onClick={() => setShowImportBBCodeModal(true)}
                                >
                                    Import existing BBCode
                                </button>
                            </div>
                        </>
                    }
                    {imageUrl &&
                        <>
                            <button
                                className='py-2 px-12 rounded-lg bg-red-500 hover:bg-red-400'
                                onClick={() => setImageUrl('')}
                            >
                                Start Over
                            </button>
                            <span>
                                Create link areas by click and dragging on the uploaded image.
                            </span>
                            <div className='w-auto flex justify-center'>
                                <div className='relative'>
                                    <img
                                        alt={''}
                                        onMouseDown={onMouseDown}
                                        onLoad={() => setImageLoaded(true)}
                                        ref={imageRef}
                                        src={imageUrl}
                                        className='object-scale-down select-none'
                                        draggable={false}
                                    />
                                    {
                                        // Highlight area
                                        creatingNewLinkArea &&
                                        <div className='bg-black opacity-50 absolute' style={{
                                            left: Math.min(startingCoordinate[0], currentCoordinate[0]),
                                            top: Math.min(startingCoordinate[1], currentCoordinate[1]),
                                            width: Math.abs(currentCoordinate[0] - startingCoordinate[0]),
                                            height: Math.abs(currentCoordinate[1] - startingCoordinate[1])
                                        }}/>
                                    }
                                    {imageLoaded && linkAreas.map((linkArea: LinkArea, index: number) => {
                                        let nameToUse = (linkArea.name == '' || linkArea.name == undefined) ? (index + 1) : linkArea.name
                                        return <Rnd
                                            title={nameToUse}
                                            key={index}
                                            className={'flex p-1.5 items-center justify-center w-full h-full bg-black/50 relative' + (lastModifiedLinkAreaIndex == index ? ' z-10 outline outline-stone-400/50' : '')}
                                            position={{
                                                x: convertPercentageToSize(linkArea.x, imageRef!.current?.width!),
                                                y: convertPercentageToSize(linkArea.y, imageRef!.current?.height!)
                                            }}
                                            size={{
                                                width: convertPercentageToSize(linkArea.width, imageRef!.current?.width!),
                                                height: convertPercentageToSize(linkArea.height, imageRef!.current?.height!)
                                            }}
                                            resizeHandleClasses={{
                                                bottomRight: lastModifiedLinkAreaIndex == index ? 'rounded-full z-10 border-stone-400/50 border-opacity-75 border-2 opacity-100 w-full h-full bg-white' : undefined
                                            }}
                                            bounds='parent'
                                            onDragStart={() => setLastModifiedLinkAreaIndex(index)}
                                            onDragStop={(_, d) =>
                                                updateLinkArea(
                                                    index,
                                                    {
                                                        ...linkArea,
                                                        x: convertSizeToPercentage(Math.min(Math.max(d.x, 0), imageRef.current!.width - linkArea.width), imageRef.current!.width),
                                                        y: convertSizeToPercentage(Math.min(Math.max(d.y, 0), imageRef.current!.height - linkArea.height), imageRef.current!.height)
                                                    }
                                                )
                                            }
                                            onResizeStart={() => setLastModifiedLinkAreaIndex(index)}
                                            onResizeStop={(_, __, ___, d, p) =>
                                                updateLinkArea(
                                                    index,
                                                    {
                                                        ...linkArea,
                                                        width: linkArea.width + convertSizeToPercentage(d.width, imageRef!.current?.width!),
                                                        height: linkArea.height + convertSizeToPercentage(d.height, imageRef!.current?.height!),
                                                        x: convertSizeToPercentage(p.x, imageRef!.current?.width!),
                                                        y: convertSizeToPercentage(p.y, imageRef!.current?.height!),
                                                    }
                                                )
                                            }
                                        >
                                    <div className='w-full h-full outline-dashed outline-[2px] outline-blue-200/75'>
                                        <span className='italic text-sm ml-1 truncate'>
                                            {nameToUse}
                                        </span>
                                    </div>

                                        </Rnd>
                                    })
                                    }
                                </div>
                            </div>
                        </>
                    }
                    {linkAreas.length > 0 && imageLoaded &&
                        <>
                            <span>
                                Fill in the URLs and display names below. Make sure all URLs are populated and valid.
                            </span>
                            {
                                linkAreas.length > 0 &&
                                <div
                                    className='space-y-3 max-h-56 overflow-auto border-stone-600 border rounded-xl p-2'>
                                    {linkAreas.map((linkArea: LinkArea, index: number) => {
                                        return <div key={index}
                                                    className='flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 items-center'>
                                            <button
                                                className='bg-blue-600 hover:bg-blue-400 rounded-lg p-2 w-10 text-center'
                                                onClick={() => setLastModifiedLinkAreaIndex((prevState) => prevState == index ? -1 : index)}
                                            >
                                                {index + 1}
                                            </button>
                                            <input
                                                placeholder='URL'
                                                className='bg-stone-800 rounded-lg p-2 flex-1 w-full m-0'
                                                value={linkArea.link}
                                                onChange={(event) =>
                                                    updateLinkArea(index, {
                                                        ...linkArea,
                                                        link: event.target.value.replace(" ", "")
                                                    })
                                                }
                                            />
                                            <input
                                                placeholder='Display Name (e.g. osu! name)'
                                                className='bg-stone-800 rounded-lg p-2 flex-1 w-full'
                                                value={linkArea.name}
                                                onChange={(event) =>
                                                    updateLinkArea(index, {
                                                        ...linkArea,
                                                        name: event.target.value
                                                    })
                                                }
                                            />
                                            <button
                                                className='bg-red-500 hover:bg-red-400 rounded-lg p-2 w-full sm:w-auto'
                                                onClick={() => {
                                                    removeLinkAreaByIndex(index)
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    })
                                    }
                                </div>
                            }
                            <button
                                title={allUrlsValid ? '' : 'Fix all invalid URLs'}
                                className={'py-2 px-12 rounded-lg' + (allUrlsValid ? ' bg-blue-600 hover:bg-blue-400' : ' bg-blue-400 cursor-not-allowed')}
                                onClick={copyCodeToClipboard}
                                disabled={!allUrlsValid}
                            >
                                Copy Generated BBCode to Clipboard
                            </button>
                            <textarea rows={3} className={'whitespace-pre bg-stone-800 p-2 rounded-lg font-mono'}
                                      value={!allUrlsValid ? '' : generateCode()} readOnly/>
                        </>
                    }
                </div>
            </main>
            <footer
                className='flex flex-row text-sm p-4 w-screen bg-stone-900 items-center justify-center space-x-2'>
                <h2>
                    This page is not affiliated with osu!
                </h2>
            </footer>
            <ImportImageModal
                title='Load Image From URL'
                closeModal={() => setShowImportImageModal(false)}
                showModal={showImportImageModal}
                setUrl={setImageUrl}
            />
            <ImportBBCodeModal
                title='Import existing BBCode'
                closeModal={() => setShowImportBBCodeModal(false)}
                showModal={showImportBBCodeModal}
                setUrl={setImageUrl}
                setLinkAreas={setLinkAreas}
            />
            <ToastContainer bodyClassName='text-gray-100' toastClassName='bg-stone-900'
                            progressClassName='bg-stone-200 bg-none'/>
        </div>
    )
}

export default App
