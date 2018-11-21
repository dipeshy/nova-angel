// @flow

import { ADD_LOG } from '../actions/pconsole';
import { parseAnsiCursorCommands } from '../utils/console-utils';

export default function consoles(_state = [], action: Action) {
    let state;

    switch (action.type) {
        case ADD_LOG:
            state = _state.map(x => {
                const { id, logs, nsColours } = x;
                // Push to correct entry
                if (id !== action.id) {
                    return x;
                }

                const nsColourClass = (nsColours[action.ns] =
                    nsColours[action.ns] || getRandomColorClass());
                parseAnsiCursorCommands(action.log).forEach(line => {
                    let selectIdx;
                    let logWrapper;
                    switch (line) {
                        case '':
                            // IGNORE
                            break;
                        case 'UP':
                            selectIdx = logs.length - 1;
                            break;
                        case 'DOWN':
                            // IGNORE
                            break;
                        case 'CLEAR_LINE':
                            // IGNORE
                            break;
                        default:
                            logWrapper = {
                                id: `log-${x.logs.length}`,
                                // Add namespace to line
                                log: `<span class="ansi-hl ${nsColourClass}">${
                                    action.ns
                                }</span><pre>${line}</pre>`
                            };
                            if (selectIdx) {
                                logs[selectIdx] = logWrapper;
                            } else {
                                logs.push(logWrapper);
                            }
                    }
                });
                return x;
            });
            break;
        default:
            state = _state;
    }
    return state;
}

function getRandomColorClass() {
    const colourClasses = [
        'ansi-hl--1',
        'ansi-hl--2',
        'ansi-hl--3',
        'ansi-hl--4',
        'ansi-hl--5',
        'ansi-hl--6',
        'ansi-hl--7'
    ];

    const randomIdx = Math.floor(Math.random() * colourClasses.length);
    return colourClasses[randomIdx];
}
