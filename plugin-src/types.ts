export enum Language {
    JSON = "json",
}

export type HSLA = {
    h: number
    s: number
    l: number
    a: number
}

export enum PreferencePropertyTypes {
    IFRAME = "iframe",
}

export enum MessageEvents {
    PREFERENCES_CHANGED = "PREFERENCES_CHANGED",
}

export type FileDescription = {
    name: string
    data: string
}

export type FileGroup = {
    variableRootType: string
    data: object
    jsonFile: FileDescription
    pythonFile: FileDescription
    serializer: (data: object) => Promise<string>
}
