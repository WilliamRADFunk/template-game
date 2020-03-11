import { LeftBottomMiddleTitleText } from "../controls/text/title/left-bottom-middle-title-text";
import { LeftBottomTitleText } from "../controls/text/title/left-bottom-title-text";
import { LeftTopTitleText } from "../controls/text/title/left-top-title-text";
import { LeftTopMiddleTitleText } from "../controls/text/title/left-top-middle-title-text";
import { RightBottomTitleText } from "../controls/text/title/right-bottom-title-text";
import { RightBottomMiddleTitleText } from "../controls/text/title/right-bottom-middle-title-text";
import { RightTopTitleText } from "../controls/text/title/right-top-title-text";
import { RightTopMiddleTitleText } from "../controls/text/title/right-top-middle-title-text";

export interface TextMap {
    [key: string]: (
        LeftBottomMiddleTitleText
        | LeftBottomTitleText
        | LeftTopTitleText
        | LeftTopMiddleTitleText
        | RightBottomTitleText
        | RightBottomMiddleTitleText
        | RightTopTitleText
        | RightTopMiddleTitleText)
}