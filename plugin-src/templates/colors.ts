
export function getTemplate(colorsVars: string) {
    return `
import colorsys

from omni.ui import color as cl

rgb_max = 255
hue_max = 360
saturation_max = 100
lightness_max = 100


def convert_hsl_to_colorshade(hue: float, saturation: float, lightness: float):
    r, g, b = colorsys.hls_to_rgb(
        h=hue / hue_max,
        s=saturation / saturation_max,
        l=lightness / lightness_max,
    )
    return cl(r, g, b)


${colorsVars}
`
}
