import { ipcRenderer } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './app.global.css';
import persistentStore from './utils/store';
import { ADD_LOG } from './actions/pconsole';
import { updateTaskstateAction } from './actions/task-state.actions';

const store = configureStore({
    counter: 0,
    consoles: [
        {
            id: 'main-console',
            name: 'Main Console',
            logs: [],
            nsColours: {}
        }
    ],
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
ipcRenderer.on('consolewindow:log', (_, taskId, ns, log) => {
    store.dispatch({
        type: ADD_LOG,
        id: 'main-console', // Add log to main console.
        ns,
        log
    });
});

ipcRenderer.on('taskstates', (_, state, task: TaskType) => {
    updateTaskstateAction({
        id: task.id,
        state
    })(store.dispatch);
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
