import {formatNumberToPrecisionString} from "./NumberUtils.ts";

/**
 * Defines a rectangular area within an image that hyperlinks to (ideally) an osu! profile page.
 * @param x the percentage x-coordinate of the top-left of the area.
 * @param y the percentage y-coordinate of the top-left of the area.
 * @param width the percentage width of the area.
 * @param height the percentage height of the area.
 * @param link the link to go to upon clicking.
 * @param name the tooltip text to display on hover.
 */
export interface LinkArea {
    x: number
    y: number
    width: number
    height: number
    link: string
    name: string
}

/**
 * Generate osu! BBCode code to use to display image map.
 */
export function generateImageMapBbCode(linkAreas: LinkArea[], imageUrl: string, usingPlaceholders: boolean = true): string {
    const lines = []
    lines.push('[imagemap]')

    // Add image source
    lines.push(imageUrl)
    // Add link areas
    linkAreas.forEach((linkArea) => {
        const line = []
        line.push(formatNumberToPrecisionString(linkArea.x))
        line.push(formatNumberToPrecisionString(linkArea.y))
        line.push(formatNumberToPrecisionString(linkArea.width))
        line.push(formatNumberToPrecisionString(linkArea.height))
        line.push(linkArea.link ?? (usingPlaceholders ? 'https://example.com' : ''))
        line.push(linkArea.name ?? (usingPlaceholders ? 'Sample text' : ''))
        lines.push(line.join(' '))
    })

    lines.push('[/imagemap]')
    return lines.join('\n')
}

export interface ParsedBBCode {
    linkAreas: LinkArea[]
    imageUrl: string
}

export const URL_PATTERN = /^(https?:\/\/)(?=\S).*$/i

const BBCODE_FIRST_LINE_PATTERN = /^\[imagemap\]$/
const BBCODE_LAST_LINE_PATTERN = /^\[\/imagemap\]$/
const BBCODE_LINE_PATTERN = /^(\d+(\.\d+)?)\s(\d+(\.\d+)?)\s(\d+(\.\d+)?)\s(\d+(\.\d+)?)\s(https?:\/\/\S+)\s.*$/

export function validateBBCode(content: string): boolean {
    const lines = content.split("\n")

    if (lines.length < 4) {
        return false
    }

    if (!BBCODE_FIRST_LINE_PATTERN.test(lines[0])) {
        return false
    }

    if (!URL_PATTERN.test(lines[1])) {
        return false
    }

    if (!BBCODE_LAST_LINE_PATTERN.test(lines[lines.length - 1])) {
        return false
    }

    for (let i = 2; i < lines.length - 1; i++) {
        if (!BBCODE_LINE_PATTERN.test(lines[i])) {
            return false;
        }
    }

    return true;
}

export function parseBBCode(content: string): ParsedBBCode {
    const lines = content.split("\n")
    const linkAreas = []
    const imageUrl = lines[1]
    for (let i = 2; i < lines.length - 1; i++) {
        let args = lines[i].split(" ")
        args = [...args.slice(0, 5), args.slice(5).join(" ")]
        linkAreas.push({
            x: Number.parseFloat(args[0]),
            y:  Number.parseFloat(args[1]),
            width:  Number.parseFloat(args[2]),
            height:  Number.parseFloat(args[3]),
            link: args[4],
            name: args[5],
        } as LinkArea)
    }

    return (
        {
            imageUrl: imageUrl,
            linkAreas: linkAreas
        } as ParsedBBCode
    )
}