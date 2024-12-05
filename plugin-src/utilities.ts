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

export function rgbaToHsla(r: number, g: number, b: number, a: number) {
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    let l = (max + min) / 2

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h /= 6
    }

    const hNorm = h * 360
    const sNorm = s * 100
    const lNorm = l * 100

    return { h: hNorm, s: sNorm, l: lNorm, a }
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