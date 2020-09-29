import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import EditorBoundary from "./AwesomeGridLayout/Editor/EditorBoundary";
import EditorContextProvider from "./AwesomeGridLayout/Editor/EditorContext";

ReactDOM.render(
    <EditorContextProvider>
        <EditorBoundary />
    </EditorContextProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
