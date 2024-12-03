
export let template = `
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


color_general_white = convert_hsl_to_colorshade(0, 100, 100)
color_general_black = convert_hsl_to_colorshade(0, 0, 0)

color_gray_05 = convert_hsl_to_colorshade(0, 0, 5)
color_gray_16 = convert_hsl_to_colorshade(0, 0, 16)
color_gray_21 = convert_hsl_to_colorshade(0, 0, 21)
color_gray_27 = convert_hsl_to_colorshade(0, 0, 27)
color_gray_39 = convert_hsl_to_colorshade(0, 0, 39)
color_gray_45 = convert_hsl_to_colorshade(0, 0, 45)
color_gray_58 = convert_hsl_to_colorshade(0, 0, 58)
color_gray_64 = convert_hsl_to_colorshade(0, 0, 64)
color_gray_80 = convert_hsl_to_colorshade(0, 0, 80)


color_green_hue = 90

color_green_51_27 = convert_hsl_to_colorshade(color_green_hue, 51, 27)
color_green_80_26 = convert_hsl_to_colorshade(color_green_hue, 80, 26)
color_green_60_35 = convert_hsl_to_colorshade(color_green_hue, 60, 35)
color_green_43_52 = convert_hsl_to_colorshade(color_green_hue, 43, 52)

color_red_hue = 0

color_red_51_27 = convert_hsl_to_colorshade(color_red_hue, 51, 27)
color_red_80_26 = convert_hsl_to_colorshade(color_red_hue, 80, 26)
color_red_60_35 = convert_hsl_to_colorshade(color_red_hue, 60, 35)
color_red_43_52 = convert_hsl_to_colorshade(color_red_hue, 43, 52)

color_orange_hue = 35

color_orange_51_27 = convert_hsl_to_colorshade(color_orange_hue, 51, 27)
color_orange_80_26 = convert_hsl_to_colorshade(color_orange_hue, 80, 26)
color_orange_60_35 = convert_hsl_to_colorshade(color_orange_hue, 60, 35)
color_orange_43_52 = convert_hsl_to_colorshade(color_orange_hue, 43, 52)

color_blue_hue = 238

color_blue_51_27 = convert_hsl_to_colorshade(color_blue_hue, 51, 27)
color_blue_80_26 = convert_hsl_to_colorshade(color_blue_hue, 80, 26)
color_blue_60_35 = convert_hsl_to_colorshade(color_blue_hue, 60, 35)
color_blue_43_52 = convert_hsl_to_colorshade(color_blue_hue, 43, 52)

color_cool_blue_hue = 189
color_cool_blue_45 = convert_hsl_to_colorshade(color_cool_blue_hue, 6, 45)
`
