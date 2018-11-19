import { ipcRenderer } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './app.global.css';
import persistentStore from './utils/store';
import { ADD_LOG } from './actions/pconsole';

const store = configureStore({
    counter: 0,
    consoles: [{
        id: "hello", 
        name: "hello", 
        logs: []
    }],
    services: persistentStore.get('services')
});

ipcRenderer.on('message', (event, ...messages) => {
    console.log('main:', ...messages);
});
ipcRenderer.on('error', (event, ...messages) => {
    console.error('main:', ...messages);
});
ipcRenderer.on('tasks-snapshot', (_, runningtasks) => {
    console.log('tasks-snapshot:', runningtasks);
});
ipcRenderer.on('consolewindow:log', (_, log, ...args) => {
    console.log('consolewindow:log:', log, ...args);
    store.dispatch({
        type: ADD_LOG,
        id: "hello",
        log
    })
});



window.temp = store;

render(
    <AppContainer>
        <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
);

if (module.hot) {
    module.hot.accept('./containers/Root', () => {
        const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
        render(
            <AppContainer>
                <NextRoot store={store} history={history} />
            </AppContainer>,
            document.getElementById('root')
        );
    });
}
