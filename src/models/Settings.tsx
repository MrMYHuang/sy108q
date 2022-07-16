import Globals from "../Globals";
import { Bookmark } from "./Bookmark";

export interface Settings {
    version: number;
    hasAppLog: boolean;
    theme: number;
    uiFontSize: number;
    useFontKai: boolean;
    voiceURI: string | null;
    speechRate: number;
    bookmarks: Bookmark[];
    qouteReads: boolean[];
    is27quotesRead: boolean;
    is54quotesRead: boolean;
    is81quotesRead: boolean;
    is108quotesRead: boolean;
}

export const defaultSettings = {
    version: 1,
    hasAppLog: true,
    theme: 2,
    uiFontSize: 32,
    useFontKai: false,
    voiceURI: null,
    speechRate: 0.8,
    bookmarks: [],
    qouteReads: new Array(Globals.quotes.length).fill(false),
    is27quotesRead: false,
    is54quotesRead: false,
    is81quotesRead: false,
    is108quotesRead: false,
} as Settings;
