export enum Language {
    JSON = "json",
}

export enum PreferencePropertyTypes {
    IFRAME = "iframe",
}

export enum MessageEvents {
    FORMAT = "FORMAT",
    FORMAT_RESULT = "FORMAT_RESULT",
    PREFERENCES_CHANGED = "PREFERENCES_CHANGED",
}

export type FileDescription = {
    name: string
    data: object
    serializedData: string
}