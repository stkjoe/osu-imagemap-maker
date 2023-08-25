import {ChangeEvent, MouseEvent, useEffect, useRef, useState} from 'react';
import {Rnd} from 'react-rnd';

/**
 * Defines a rectangular area within an image that hyperlinks to (ideally) an osu! profile page.
 * @param x the pixel x-coordinate of the top-left of the area.
 * @param y the pixel y-coordinate of the top-left of the area.
 * @param width the pixel width of the area.
 * @param height the pixel height of the area.
 * @param link the link to go to upon clicking.
 * @param name the tooltip text to display on hover.
 */
interface LinkArea {
    x: number
    y: number
    width: number
    height: number
    link: string
    name: string
}

function App() {
    // The loaded image URL.
    const [imageUrl, setImageUrl] = useState<string>('')
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

    const INPUT_IMAGE_URL_ID = 'image-url-input'

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
                coords[1] = Math.max(0, Math.min(coords[1], imageRef.current?.height!))
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
                    Math.min(startingCoordinate[0], currentCoordinate[0]),
                    Math.min(startingCoordinate[1], currentCoordinate[1]),
                    Math.abs(currentCoordinate[0] - startingCoordinate[0]),
                    Math.abs(currentCoordinate[1] - startingCoordinate[1]),
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

    /**
     * Fetch the image from the provided URL.
     * Also clears existing link areas.
     */
    function fetchImageUrlAndClearLinkAreas(event: ChangeEvent<HTMLFormElement>) {
        event.preventDefault()
        setLinkAreas([])
        const url = (new FormData(event.target)).get(INPUT_IMAGE_URL_ID) as string
        setImageUrl(url)
    }

    /**
     * Round numbers to 4 d.p. if required, then return.
     * @param number the number to round to 4dp if required.
     */
    function formatNumberToPrecisionString(number: number): string {
        return (Math.round(number * 10000) / 10000).toString()
    }

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
        const lines = []
        lines.push('[imagemap]')

        // Add image source
        lines.push(imageUrl)
        // Add link areas
        const imageWidth = imageRef.current?.width!
        const imageHeight = imageRef.current?.height!
        linkAreas.forEach((linkArea) => {
            const line = []
            line.push(formatNumberToPrecisionString((linkArea.x / imageWidth * 100)))
            line.push(formatNumberToPrecisionString((linkArea.y / imageHeight * 100)))
            line.push(formatNumberToPrecisionString(linkArea.width / imageWidth * 100))
            line.push(formatNumberToPrecisionString(linkArea.height / imageHeight * 100))
            line.push(linkArea.link != '' ? linkArea.link : 'https://example.com')
            line.push(linkArea.name != '' ? linkArea.name : 'Sample text')
            lines.push(line.join(' '))
        })

        lines.push('[/imagemap]')
        return lines.join('\n')
    }

    /**
     * Get x-y coordinates for any given click on the loaded image.
     */
    function getImagePointerCoordinates(event: MouseEvent<HTMLImageElement, MouseEvent>) {
        console.log([event.clientX - imageRef.current!.x, event.clientY - imageRef.current!.y])
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
        navigator.clipboard.writeText(generateCode()).then(() => {
            alert('Copied to clipboard')
        })
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
    }

    return (
        <div className='min-h-screen bg-stone-800 text-gray-100 flex flex-col'>
            <div>
                <h2 className='text-lg p-4 w-screen bg-stone-900'>
                    osu! imagemap mapper
                </h2>
            </div>
            <div
                className='mx-auto max-w-5xl w-screen flex-grow lg:flex-grow-0 lg:mt-4 py-8 px-6 bg-stone-700 lg:rounded-lg space-y-3 flex flex-col'>
                <a
                    className='text-center'>
                    This is a tool used to easily generate BBCode image maps for osu! pages.
                    <br/>
                    This is not an image uploader site. You will need to upload the image first to an image host.
                    <br/>
                    <b>Note: Imgur doesn't work for some reason so don't use that</b>

                </a>
                <label htmlFor={INPUT_IMAGE_URL_ID}>
                    1. Paste Image URL below and click 'Upload'
                </label>
                <form
                    className='flex'
                    onSubmit={fetchImageUrlAndClearLinkAreas}
                >
                    <input
                        placeholder='https://...'
                        className='bg-stone-800 rounded-lg p-2 flex-1'
                        id={INPUT_IMAGE_URL_ID}
                        name={INPUT_IMAGE_URL_ID}
                    />
                    <button
                        className='justify-self-center ml-3 bg-blue-600 py-2 px-12 rounded-lg max-w-sm'
                    >
                        Upload
                    </button>
                </form>
                {imageUrl &&
                    <>
                        <span>
                            2. Create link areas by click and dragging on the uploaded image.
                        </span>
                        <div className='w-auto flex justify-center'>
                            <div className='relative'>
                                <img
                                    alt={''}
                                    onMouseDown={onMouseDown}
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
                                {linkAreas.map((linkArea: LinkArea, index: number) => {
                                    return <Rnd
                                        key={index}
                                        className='bg-black bg-opacity-50 outline-white outline-1 relative'
                                        position={{
                                            x: linkArea.x,
                                            y: linkArea.y
                                        }}
                                        size={{
                                            width: linkArea.width,
                                            height: linkArea.height
                                        }}
                                        bounds='parent'
                                        onDragStop={(_, d) =>
                                            updateLinkArea(
                                                index,
                                                {
                                                    ...linkArea,
                                                    x: Math.min(Math.max(d.x, 0), imageRef.current!.width - linkArea.width),
                                                    y: Math.min(Math.max(d.y, 0), imageRef.current!.height - linkArea.height),
                                                }
                                            )
                                        }
                                        onResizeStop={(_, __, ___, d, p) => {
                                            updateLinkArea(
                                                index,
                                                {
                                                    ...linkArea,
                                                    width: linkArea.width + d.width,
                                                    height: linkArea.height + d.height,
                                                    x: p.x,
                                                    y: p.y,
                                                }
                                            )
                                        }

                                        }
                                    >
                                    <span className='italic text-sm ml-2 opacity-50'>
                                        {linkArea.name != '' ? linkArea.name : (index + 1)}
                                    </span>
                                    </Rnd>
                                })
                                }
                            </div>
                        </div>
                        <span>
                            3. Fill in the osu!user URLs and names below.
                        </span>
                        {linkAreas.map((linkArea: LinkArea, index: number) => {
                            return <div key={index} className='flex flex-row space-x-2 items-center'>
                                <span>{index + 1}</span>
                                <input
                                    placeholder='osu!user URL'
                                    className='bg-stone-800 rounded-lg p-2 flex-1'
                                    value={linkArea.link}
                                    onChange={(event) =>
                                        updateLinkArea(index, {
                                            ...linkArea,
                                            link: event.target.value
                                        })
                                    }
                                />
                                <input
                                    placeholder='osu!user name'
                                    className='bg-stone-800 rounded-lg p-2 flex-1'
                                    value={linkArea.name}
                                    onChange={(event) =>
                                        updateLinkArea(index, {
                                            ...linkArea,
                                            name: event.target.value
                                        })
                                    }
                                />
                                <button
                                    className='bg-red-600 opacity-75 hover:opacity-100 rounded aspect-square w-9'
                                    onClick={() => {
                                        removeLinkAreaByIndex(index)
                                    }}
                                >
                                    ✗
                                </button>
                            </div>
                        })
                        }
                        <span>
                            4. When complete, copy the generated code below to your osu! page
                        </span>
                        <textarea rows={3} className='whitespace-pre bg-stone-800 p-2 rounded-lg font-mono'
                                  value={generateCode()} readOnly/>
                        <button
                            className='bg-blue-600 py-2 px-12 rounded-lg'
                            onClick={copyCodeToClipboard}
                        >
                            Copy Generated BBCode to Clipboard
                        </button>
                    </>
                }
            </div>
        </div>
    )
}

export default App
