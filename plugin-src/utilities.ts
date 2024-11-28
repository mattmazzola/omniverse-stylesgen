
export function rgbToHex({ r, g, b, a }: RGBA) {
    // If the alpha is not 1, return an rgba string since hex doesn't support alpha
    if (a !== 1) {
        // Convert rgb floats to integers
        const colorInts = [r, g, b].map((n) => Math.round(n * 255))

        return `rgba(${colorInts.join(", ")}, ${a.toFixed(4)})`
    }

    const hex = [toHex(r), toHex(g), toHex(b)].join("")
    return `#${hex}`
}

export function toHex(float: number) {
    const hex = Math.round(float * 255).toString(16)
    return hex.padStart(2, "0")
}