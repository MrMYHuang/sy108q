import { Bookmark } from "./Bookmark";

export interface Settings {
    version: number;
    hasAppLog: boolean;
    theme: number;
    uiFontSize: number;
    voiceURI: string | null;
    speechRate: number;
    bookmarks: Bookmark[];
    dictionaryHistory: string[];
}

export const defaultSettings = {
    version: 1,
    hasAppLog: true,
    theme: 2,
    uiFontSize: 32,
    voiceURI: null,
    speechRate: 0.8,
    bookmarks: [],
    dictionaryHistory: [],
} as Settings;
