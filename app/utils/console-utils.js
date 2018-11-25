module.exports = {
    decorateAnsiColours,
    parseAnsiCursorCommands,
    decorateLinks
};

/**
 * http://tldp.org/HOWTO/Bash-Prompt-HOWTO/x361.html
 * <N>A: Move N line up
 * <N>B: Move N line down
 * K: Erase to end of line
 * @param {string} data
 */
function parseAnsiCursorCommands(data) {
    return (
        data
            // will break to new line
            // .replace(/\n/g, '::')
            // eslint-disable-next-line no-control-regex
            .replace(/\u001B\[(\d+)([A-BK])/g, (_, line, command) => {
                switch (command) {
                    case 'A':
                        return '::UP::';
                    case 'B':
                        return '::DOWN::';
                    case 'K':
                        return '::CLEAR_LINE::';
                    default:
                        console.log(`Unknown Command: ${command}`);
                }
            })
            .split('::')
    );
}

function decorateAnsiColours(message) {
    // eslint-disable-next-line no-control-regex
    const match = message.match(/\u001B\[((?:\d+;)*\d+)m/);
    let classNames = [];
    if (match) {
        const capture = match[1];
        // 0 is reset all
        if (capture === '0') {
            classNames.push('ansi-reset');
        } else {
            classNames = capture.split(';').map(code => {
                switch (+code) {
                    case 1:
                        return 'ansi-bold';
                    case 31:
                        return 'ansi-red';
                    case 32:
                        return 'ansi-green';
                    case 33:
                        return 'ansi-yellow';
                    case 34:
                        return 'ansi-blue';
                    case 36:
                        return 'ansi-cyan';
                    case 39:
                        return 'ansi-white';
                    default:
                        console.log(`Unknown code: ${code}`);
                        return 'ansi-default';
                }
            });
        }

        const preTag = `<span class="${classNames.join(' ')}" >`;
        const postTag = '</span>';
        return decorateAnsiColours(message.replace(match[0], preTag) + postTag);
    }
    return message;
}

function decorateLinks(data) {
    return data.replace(/(http[^\s\n<]+)/, '<a href="$1">$1</a>');
}
