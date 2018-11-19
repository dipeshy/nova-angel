// @flow

import { ADD_LOG } from '../actions/pconsole';
import { parseAnsiCursorCommands } from "../utils/console-utils";

export default function consoles(_state = [], action: Action) {
    let state;
    switch (action.type) {
        case ADD_LOG:
            state = _state.map((x) => {
                const { id, logs } = x;
                // Push to correct entry
                if (id !== action.id) {
                    return x;
                }
                parseAnsiCursorCommands(action.log).forEach((line) => {
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
                                log: line,
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
