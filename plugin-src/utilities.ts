
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

export function isObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item))
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function deepMerge(target: any, ...sources: any[]) {
    if (!sources.length) return target
    const source = sources.shift()

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            const sourceValue = source[key]
            // If sourceValue is object, recurievly apply deepMerge
            // Otherwise, assign the value to target
            if (isObject(sourceValue)) {
                // If target[key] doesn't exist, create an empty object
                if (!target[key]) {
                    Object.assign(target, { [key]: {} })
                }
                
                deepMerge(target[key], sourceValue)
            } else {
                Object.assign(target, { [key]: sourceValue })
            }
        }
    }

    return deepMerge(target, ...sources)
}