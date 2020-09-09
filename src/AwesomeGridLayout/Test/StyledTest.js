import React from "react";
import styled from "styled-components";
import {JSToCSS} from "../AwesomeGridLayoutUtils";

export function getTag(tagAs) {
    return styled(tagAs)`
        ${props => JSToCSS(props.theme)};
    `;
}
