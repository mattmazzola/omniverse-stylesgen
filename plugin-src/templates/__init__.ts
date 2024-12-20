export let template = `
from .tokens import *

general_styles = {}

label_styles = {
    "Label": {
        "font_size": token_font_size_default,
    },
    "Label::h1": {
        "font_size": token_font_size_h1,
    },
    "Label::h2": {
        "font_size": token_font_size_h2,
    },
    "Label::h3_field": {
        "font_size": token_font_size_h3,
        "color": token_text_color_secondary,
    },
    "Label::h3": {
        "font_size": token_font_size_h3,
    },
    "Label::h4_field": {
        "font_size": token_font_size_h4,
        "color": token_text_color_secondary,
    },
    "Label::h4": {
        "font_size": token_font_size_h4,
    },
    "Label::sm": {
        "font_size": token_font_size_sm,
    },
    "Label::xs": {
        "font_size": token_font_size_xs,
    },
}

button_styles = {
    "Button": {
        "padding": token_button_padding,
        "border_radius": token_button_radius,
        "color": token_text_color_default,
        "background_color": token_buttons_normal_default,
    },
    "Button:hovered": {
        "background_color": token_buttons_normal_hover,
    },
    "Button:pressed": {
        "background_color": token_buttons_normal_pressed,
    },
    "Button:checked": {
        "background_color": token_buttons_normal_checked,
    },
    "Button:disabled": {
        "background_color": token_buttons_normal_disabled,
    },
    "Button.Label": {
        "font_size": token_font_size_default,
        "color": token_text_color_default,
    },
    "Button.Label:hovered": {
        "color": token_text_color_default,
    },
    "Button.Label:checked": {
        "color": token_text_color_isaac_disabled,
    },
    "Button.Label:disabled": {
        "color": token_text_color_isaac_disabled,
    },
}

button_primary_styles = {
    "Button::primary": {
        "background_color": token_buttons_primary_default,
    },
    "Button::primary:hovered": {
        "background_color": token_buttons_primary_hover,
    },
    "Button::primary:pressed": {
        "background_color": token_buttons_primary_pressed,
    },
    "Button::primary:checked": {
        "background_color": token_buttons_primary_checked,
    },
    "Button::primary:disabled": {
        "background_color": token_buttons_primary_disabled,
    },
}

button_secondary_styles = {
    "Button::secondary": {
        "background_color": token_buttons_secondary_default,
    },
    "Button::secondary:hovered": {
        "background_color": token_buttons_secondary_hover,
    },
    "Button::secondary:pressed": {
        "background_color": token_buttons_secondary_pressed,
    },
    "Button::secondary:checked": {
        "background_color": token_buttons_secondary_checked,
    },
    "Button::secondary:disabled": {
        "background_color": token_buttons_secondary_disabled,
    },
}

button_warning_styles = {
    "Button::warning": {
        "background_color": token_buttons_warning_default,
    },
    "Button::warning:hovered": {
        "background_color": token_buttons_warning_hover,
    },
    "Button::warning:pressed": {
        "background_color": token_buttons_warning_pressed,
    },
    "Button::warning:checked": {
        "background_color": token_buttons_warning_checked,
    },
    "Button::warning:disabled": {
        "background_color": token_buttons_warning_disabled,
    },
}

button_danger_styles = {
    "Button::danger": {
        "background_color": token_buttons_danger_default,
    },
    "Button::danger:hovered": {
        "background_color": token_buttons_danger_hover,
    },
    "Button::danger:pressed": {
        "background_color": token_buttons_danger_pressed,
    },
    "Button::danger:checked": {
        "background_color": token_buttons_danger_checked,
    },
    "Button::danger:disabled": {
        "background_color": token_buttons_danger_disabled,
    },
}

button_outcome_success = {
    "Button::success": {
        "background_color": token_buttons_primary_default,
    },
    "Button::success:hovered": {
        "background_color": token_buttons_primary_hover,
    },
    "Button::success:pressed": {
        "background_color": token_buttons_primary_pressed,
    },
    "Button::success:disabled": {
        "background_color": token_buttons_primary_disabled,
    },
}

button_outcome_success_with_corrections = {
    "Button::success_with_corrections": {
        "background_color": token_buttons_secondary_default,
    },
    "Button::success_with_corrections:hovered": {
        "background_color": token_buttons_secondary_hover,
    },
    "Button::success_with_corrections:pressed": {
        "background_color": token_buttons_secondary_pressed,
    },
    "Button::success_with_corrections:disabled": {
        "background_color": token_buttons_secondary_disabled,
    },
}

button_outcome_failed = {
    "Button::failed": {
        "background_color": token_buttons_danger_default,
    },
    "Button::failed:hovered": {
        "background_color": token_buttons_danger_pressed,
    },
    "Button::failed:pressed": {
        "background_color": token_buttons_danger_pressed,
    },
    "Button::failed:disabled": {
        "background_color": token_buttons_danger_disabled,
    },
}

button_outcome_mark_for_deletion = {
    "Button::mark_for_deletion": {
        "background_color": token_buttons_warning_default,
    },
    "Button::mark_for_deletion:hovered": {
        "background_color": token_buttons_warning_hover,
    },
    "Button::mark_for_deletion:pressed": {
        "background_color": token_buttons_warning_pressed,
    },
    "Button::mark_for_deletion:disabled": {
        "background_color": token_buttons_warning_disabled,
    },
}

button_outcome_styles = {
    **button_outcome_success,
    **button_outcome_success_with_corrections,
    **button_outcome_failed,
    **button_outcome_mark_for_deletion,
}

radio_button_styles = {
    "RadioButton:hovered": {
        "background_color": token_radiobuttons_normal_hover,
    },
    "RadioButton:disabled": {
        "background_color": token_radiobuttons_normal_disabled,
    },
}

combobox_styles = {
    "ComboBox": {
        "padding": token_combobox_padding,
        "border_radius": token_combobox_radius,
        "color": token_text_color_default,
        "font_size": token_font_size_default,
    },
    "ComboBox:hovered": {
        "color": token_text_color_default,
    },
    "ComboBox:pressed": {
        "background_color": token_text_color_custom_pressed,
    },
    "ComboBox:disabled": {
        "color": token_text_color_isaac_disabled,
    },
}

combobox_styles_secondary = {
    "ComboBox::secondary": {
        "background_color": token_combobox_secondary_default,
    },
    "ComboBox::secondary:hovered": {
        "background_color": token_combobox_secondary_hover,
    },
    "ComboBox::secondary:pressed": {
        "background_color": token_combobox_secondary_pressed,
    },
    "ComboBox::secondary:disabled": {
        "background_color": token_combobox_secondary_disabled,
    },
}

demonstration_outcome_indicators = {
    "Rectangle::success": {
        "background_color": token_demonstration_outcome_success,
    },
    "Rectangle::success_with_corrections": {
        "background_color": token_demonstration_outcome_success_with_corrections,
    },
    "Rectangle::failed": {
        "background_color": token_demonstration_outcome_failed,
    },
    "Rectangle::mark_for_deletion": {
        "background_color": token_demonstration_outcome_mark_for_deletion,
    },
}

styles = {
    **general_styles,
    **label_styles,
    **button_styles,
    **button_primary_styles,
    **button_secondary_styles,
    **button_warning_styles,
    **button_danger_styles,
    **button_outcome_styles,
    **radio_button_styles,
    **combobox_styles,
    **combobox_styles_secondary,
    **demonstration_outcome_indicators,
}
`