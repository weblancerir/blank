import React from "react";
import styled, {ThemeProvider} from "styled-components";
import {JSToCSS} from "../AwesomeGridLayoutUtils";

export function getTag(tagAs) {
    return styled(tagAs)`
        ${props => JSToCSS(props.theme)};
    `;
}
