type SuperAdminParams = Record<string, unknown>;

type TerminalParams = SuperAdminParams & {
    command?: string;
    background?: string;
    timeoutMs?: string | number;
};

type TerminalSessionParams = SuperAdminParams & {
    sessionId: string;
};

type TerminalWaitParams = TerminalSessionParams & {
    timeoutMs?: string | number;
};

type TerminalInputParams = TerminalSessionParams & {
    input?: string;
    control?: string;
};

type TerminalCommandType = "powershell" | "bash" | "shell";

type PersistedTerminalOutput = {
    command: string;
    output: string;
    exitCode: unknown;
    sessionId: unknown;
    timedOut: boolean;
    context_preserved: boolean;
    output_saved_to: string;
    output_chars: number;
    operit_clean_on_exit_dir: string;
    hint: string;
    platform: string;
    terminal: string;
    terminalType: string;
    terminalEnvironment?: unknown;
    timeoutMsUsed?: number;
};

/* METADATA
{
    "name": "super_admin",

    "display_name": {
        "zh": "Super admin",
        "en": "Super Admin"
    },
    "description": { "zh": "Super admin toolkit providing advanced terminal command and session control features.", "en": "Super admin toolkit providing advanced terminal command and session control capabilities." },
    "enabledByDefault": true,
    "category": "System",
    "tools": [
        {
            "name": "terminal_wait",
            "description": { "zh": "Wait until the previous command in the same terminal session finishes. Unlike sleep, this tool returns early as soon as the command actually completes instead of a fixed sleep. On timeout, the currently executing command is cancelled and the terminal session is kept.", "en": "Wait until the previous command in the same terminal session finishes. Unlike sleep, this tool can return early as soon as the command actually completes. On timeout, the currently executing command is cancelled and the terminal session is kept." },
            "parameters": [
                {
                    "name": "sessionId",
                    "description": { "zh": "Target terminal session ID.", "en": "Target terminal session ID." },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "timeoutMs",
                    "description": { "zh": "Optional timeout in milliseconds, minimum 3000ms. Defaults to 300000ms (5 minutes) if omitted.", "en": "Optional timeout (ms, minimum 3000ms). Defaults to 300000ms (5 minutes) if omitted." },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "get_screen",
            "description": { "zh": "Get visible screen content of the current terminal session (single screen only, no scrollback history).", "en": "Get the current visible screen content for the active terminal session (single screen only, no scrollback history)." },
            "parameters": [
                {
                    "name": "sessionId",
                    "description": { "zh": "Target terminal session ID.", "en": "Target terminal session ID." },
                    "type": "string",
                    "required": true
                }
            ]
        },
        {
            "name": "input",
            "description": { "zh": "Write input to the current terminal session. Provide at least one of input or control. Typical usage: write input first, then control=enter to submit; control=ctrl with input=c sends Ctrl+C.", "en": "Write input to the active terminal session. Provide at least one of input or control. Typical usage: send input first, then control=enter to submit; use control=ctrl with input=c for Ctrl+C." },
            "parameters": [
                {
                    "name": "sessionId",
                    "description": { "zh": "Target terminal session ID.", "en": "Target terminal session ID." },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "input",
                    "description": { "zh": "Text to write to the terminal.", "en": "Text to write to terminal." },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "control",
                    "description": { "zh": "Control key, e.g. enter / tab / esc / ctrl.", "en": "Control key, e.g. enter / tab / esc / ctrl." },
                    "type": "string",
                    "required": false
                }
            ]
        }
    ],
    "states": [
        {
            "id": "windows",
            "condition": "platform.windows",
            "inheritTools": true,
            "tools": [
                {
                    "name": "powershell",
                    "description": { "zh": "Execute a command in a Windows PowerShell terminal session and collect output. The session is maintained per chat and preserves context. Strongly recommended to pass timeoutMs explicitly every time to avoid hangs. Foreground defaults to 15 seconds without timeoutMs; background=true does not use that default timeout. When a command times out, it is cancelled and the terminal session is kept.", "en": "Execute commands in a Windows PowerShell terminal session and collect output. The session is maintained per chat and preserves context. Strongly recommend explicitly passing timeoutMs every time to avoid hangs. Foreground mode defaults to 15s timeout when timeoutMs is omitted; background=true does not use this default timeout. When a command times out, the current command is cancelled and the terminal session is kept." },
                    "parameters": [
                        {
                            "name": "command",
                            "description": { "zh": "PowerShell command to execute.", "en": "PowerShell command to execute." },
                            "type": "string",
                            "required": true
                        },
                        {
                            "name": "background",
                            "description": { "zh": "Whether to run the command in background. \"true\" runs in background and returns immediately, suitable for long-running tasks such as starting servers (the AI will not receive the command output); \"false\" or omitted runs in foreground, waits, and returns the command result.", "en": "Run command in background. 'true' runs in background and returns immediately (good for long-running tasks like servers; AI will not receive output). 'false' or omitted runs in foreground and returns the command result." },
                            "type": "string",
                            "required": false
                        },
                        {
                            "name": "timeoutMs",
                            "description": { "zh": "Optional timeout in milliseconds, minimum 3000ms. Strongly recommended to pass explicitly; if omitted, foreground defaults to 15000ms and background=true does not use the default timeout.", "en": "Optional timeout (ms, minimum 3000ms). Strongly recommended to pass explicitly; if omitted, foreground defaults to 15000ms, and background=true does not use the default timeout." },
                            "type": "string",
                            "required": false
                        }
                    ]
                },
                {
                    "name": "bash",
                    "description": { "zh": "Execute a command in a Windows Git Bash terminal session and collect output. The session is maintained per chat and preserves context. Strongly recommended to pass timeoutMs explicitly every time to avoid hangs. Foreground defaults to 15 seconds without timeoutMs; background=true does not use that default timeout. When a command times out, it is cancelled and the terminal session is kept.", "en": "Execute commands in a Windows Git Bash terminal session and collect output. The session is maintained per chat and preserves context. Strongly recommend explicitly passing timeoutMs every time to avoid hangs. Foreground mode defaults to 15s timeout when timeoutMs is omitted; background=true does not use this default timeout. When a command times out, the current command is cancelled and the terminal session is kept." },
                    "parameters": [
                        {
                            "name": "command",
                            "description": { "zh": "Bash command to execute.", "en": "Bash command to execute." },
                            "type": "string",
                            "required": true
                        },
                        {
                            "name": "background",
                            "description": { "zh": "Whether to run the command in background. \"true\" runs in background and returns immediately, suitable for long-running tasks such as starting servers (the AI will not receive the command output); \"false\" or omitted runs in foreground, waits, and returns the command result.", "en": "Run command in background. 'true' runs in background and returns immediately (good for long-running tasks like servers; AI will not receive output). 'false' or omitted runs in foreground and returns the command result." },
                            "type": "string",
                            "required": false
                        },
                        {
                            "name": "timeoutMs",
                            "description": { "zh": "Optional timeout in milliseconds, minimum 3000ms. Strongly recommended to pass explicitly; if omitted, foreground defaults to 15000ms and background=true does not use the default timeout.", "en": "Optional timeout (ms, minimum 3000ms). Strongly recommended to pass explicitly; if omitted, foreground defaults to 15000ms, and background=true does not use the default timeout." },
                            "type": "string",
                            "required": false
                        }
                    ]
                }
            ]
        },
        {
            "id": "linux",
            "condition": "platform.linux",
            "inheritTools": true,
            "tools": [
                {
                    "name": "bash",
                    "description": { "zh": "Execute a command in a Bash terminal session and collect output. The session is maintained per chat and preserves context. Strongly recommended to pass timeoutMs explicitly every time to avoid hangs. Foreground defaults to 15 seconds without timeoutMs; background=true does not use that default timeout. When a command times out, it is cancelled and the terminal session is kept.", "en": "Execute commands in a Bash terminal session and collect output. The session is maintained per chat and preserves context. Strongly recommend explicitly passing timeoutMs every time to avoid hangs. Foreground mode defaults to 15s timeout when timeoutMs is omitted; background=true does not use this default timeout. When a command times out, the current command is cancelled and the terminal session is kept." },
                    "parameters": [
                        {
                            "name": "command",
                            "description": { "zh": "Bash command to execute.", "en": "Bash command to execute." },
                            "type": "string",
                            "required": true
                        },
                        {
                            "name": "background",
                            "description": { "zh": "Whether to run the command in background. \"true\" runs in background and returns immediately, suitable for long-running tasks such as starting servers (the AI will not receive the command output); \"false\" or omitted runs in foreground, waits, and returns the command result.", "en": "Run command in background. 'true' runs in background and returns immediately (good for long-running tasks like servers; AI will not receive output). 'false' or omitted runs in foreground and returns the command result." },
                            "type": "string",
                            "required": false
                        },
                        {
                            "name": "timeoutMs",
                            "description": { "zh": "Optional timeout in milliseconds, minimum 3000ms. Strongly recommended to pass explicitly; if omitted, foreground defaults to 15000ms and background=true does not use the default timeout.", "en": "Optional timeout (ms, minimum 3000ms). Strongly recommended to pass explicitly; if omitted, foreground defaults to 15000ms, and background=true does not use the default timeout." },
                            "type": "string",
                            "required": false
                        }
                    ]
                }
            ]
        },
        {
            "id": "macos",
            "condition": "platform.macos",
            "inheritTools": true,
            "tools": [
                {
                    "name": "bash",
                    "description": { "zh": "Execute a command in a macOS Bash terminal session and collect output. The session is maintained per chat and preserves context. Strongly recommended to pass timeoutMs explicitly every time to avoid hangs. Foreground defaults to 15 seconds without timeoutMs; background=true does not use that default timeout. When a command times out, it is cancelled and the terminal session is kept.", "en": "Execute commands in a macOS Bash terminal session and collect output. The session is maintained per chat and preserves context. Strongly recommend explicitly passing timeoutMs every time to avoid hangs. Foreground mode defaults to 15s timeout when timeoutMs is omitted; background=true does not use this default timeout. When a command times out, the current command is cancelled and the terminal session is kept." },
                    "parameters": [
                        {
                            "name": "command",
                            "description": { "zh": "Bash command to execute.", "en": "Bash command to execute." },
                            "type": "string",
                            "required": true
                        },
                        {
                            "name": "background",
                            "description": { "zh": "Whether to run the command in background. \"true\" runs in background and returns immediately, suitable for long-running tasks such as starting servers (the AI will not receive the command output); \"false\" or omitted runs in foreground, waits, and returns the command result.", "en": "Run command in background. 'true' runs in background and returns immediately (good for long-running tasks like servers; AI will not receive output). 'false' or omitted runs in foreground and returns the command result." },
                            "type": "string",
                            "required": false
                        },
                        {
                            "name": "timeoutMs",
                            "description": { "zh": "Optional timeout in milliseconds, minimum 3000ms. Strongly recommended to pass explicitly; if omitted, foreground defaults to 15000ms and background=true does not use the default timeout.", "en": "Optional timeout (ms, minimum 3000ms). Strongly recommended to pass explicitly; if omitted, foreground defaults to 15000ms, and background=true does not use the default timeout." },
                            "type": "string",
                            "required": false
                        }
                    ]
                }
            ]
        },
        {
            "id": "ios",
            "condition": "platform.ios",
            "inheritTools": true,
            "tools": [
                {
                    "name": "shell",
                    "description": { "zh": "Execute a command in an iOS Shell terminal session and collect output. The default backend is the iSH Alpine Linux Shell; a system shell can also be used with suitable privileges. The session is maintained per chat and preserves context. Strongly recommended to pass timeoutMs explicitly every time to avoid hangs. Foreground defaults to 15 seconds without timeoutMs; background=true does not use that default timeout. When a command times out, it is cancelled and the terminal session is kept.", "en": "Execute commands in an iOS shell terminal session and collect output. The default backend is the iSH Alpine Linux shell; a system shell may also be available on privileged hosts. The session is maintained per chat and preserves context. Strongly recommend explicitly passing timeoutMs every time to avoid hangs. Foreground mode defaults to 15s timeout when timeoutMs is omitted; background=true does not use this default timeout. When a command times out, the current command is cancelled and the terminal session is kept." },
                    "parameters": [
                        {
                            "name": "command",
                            "description": { "zh": "Shell command to execute.", "en": "Shell command to execute." },
                            "type": "string",
                            "required": true
                        },
                        {
                            "name": "background",
                            "description": { "zh": "Whether to run the command in background. \"true\" runs in background and returns immediately, suitable for long-running tasks such as starting servers (the AI will not receive the command output); \"false\" or omitted runs in foreground, waits, and returns the command result.", "en": "Run command in background. 'true' runs in background and returns immediately (good for long-running tasks like servers; AI will not receive output). 'false' or omitted runs in foreground and returns the command result." },
                            "type": "string",
                            "required": false
                        },
                        {
                            "name": "timeoutMs",
                            "description": { "zh": "Optional timeout in milliseconds, minimum 3000ms. Strongly recommended to pass explicitly; if omitted, foreground defaults to 15000ms and background=true does not use the default timeout.", "en": "Optional timeout (ms, minimum 3000ms). Strongly recommended to pass explicitly; if omitted, foreground defaults to 15000ms, and background=true does not use the default timeout." },
                            "type": "string",
                            "required": false
                        }
                    ]
                }
            ]
        },
        {
            "id": "android",
            "condition": "platform.android",
            "inheritTools": true,
            "tools": [
                {
                    "name": "bash",
                    "description": { "zh": "Execute a command in an Android proot Linux Bash terminal session and collect output. The session is maintained per chat and preserves context. Strongly recommended to pass timeoutMs explicitly every time to avoid hangs. Foreground defaults to 15 seconds without timeoutMs; background=true does not use that default timeout. When a command times out, it is cancelled and the terminal session is kept.", "en": "Execute commands in an Android proot Linux Bash terminal session and collect output. The session is maintained per chat and preserves context. Strongly recommend explicitly passing timeoutMs every time to avoid hangs. Foreground mode defaults to 15s timeout when timeoutMs is omitted; background=true does not use this default timeout. When a command times out, the current command is cancelled and the terminal session is kept." },
                    "parameters": [
                        {
                            "name": "command",
                            "description": { "zh": "Bash command to execute.", "en": "Bash command to execute." },
                            "type": "string",
                            "required": true
                        },
                        {
                            "name": "background",
                            "description": { "zh": "Whether to run the command in background. \"true\" runs in background and returns immediately, suitable for long-running tasks such as starting servers (the AI will not receive the command output); \"false\" or omitted runs in foreground, waits, and returns the command result.", "en": "Run command in background. 'true' runs in background and returns immediately (good for long-running tasks like servers; AI will not receive output). 'false' or omitted runs in foreground and returns the command result." },
                            "type": "string",
                            "required": false
                        },
                        {
                            "name": "timeoutMs",
                            "description": { "zh": "Optional timeout in milliseconds, minimum 3000ms. Strongly recommended to pass explicitly; if omitted, foreground defaults to 15000ms and background=true does not use the default timeout.", "en": "Optional timeout (ms, minimum 3000ms). Strongly recommended to pass explicitly; if omitted, foreground defaults to 15000ms, and background=true does not use the default timeout." },
                            "type": "string",
                            "required": false
                        }
                    ]
                },
                {
                    "name": "shell",
                    "description": { "zh": "Execute a command in an Android adb shell terminal session and collect output. The session is maintained per chat and preserves context. Strongly recommended to pass timeoutMs explicitly every time to avoid hangs. Foreground defaults to 15 seconds without timeoutMs; background=true does not use that default timeout. When a command times out, it is cancelled and the terminal session is kept.", "en": "Execute commands in an Android adb shell terminal session and collect output. The session is maintained per chat and preserves context. Strongly recommend explicitly passing timeoutMs every time to avoid hangs. Foreground mode defaults to 15s timeout when timeoutMs is omitted; background=true does not use this default timeout. When a command times out, the current command is cancelled and the terminal session is kept." },
                    "parameters": [
                        {
                            "name": "command",
                            "description": { "zh": "Shell command to execute.", "en": "Shell command to execute." },
                            "type": "string",
                            "required": true
                        },
                        {
                            "name": "background",
                            "description": { "zh": "Whether to run the command in background. \"true\" runs in background and returns immediately, suitable for long-running tasks such as starting servers (the AI will not receive the command output); \"false\" or omitted runs in foreground, waits, and returns the command result.", "en": "Run command in background. 'true' runs in background and returns immediately (good for long-running tasks like servers; AI will not receive output). 'false' or omitted runs in foreground and returns the command result." },
                            "type": "string",
                            "required": false
                        },
                        {
                            "name": "timeoutMs",
                            "description": { "zh": "Optional timeout in milliseconds, minimum 3000ms. Strongly recommended to pass explicitly; if omitted, foreground defaults to 15000ms and background=true does not use the default timeout.", "en": "Optional timeout (ms, minimum 3000ms). Strongly recommended to pass explicitly; if omitted, foreground defaults to 15000ms, and background=true does not use the default timeout." },
                            "type": "string",
                            "required": false
                        }
                    ]
                }
            ]
        },
        {
            "id": "web",
            "condition": "platform.web",
            "inheritTools": true,
            "tools": [
                {
                    "name": "shell",
                    "description": { "zh": "Execute a command in a browser-local Linux VM shell session and collect output. The session is maintained per chat and preserves context. Strongly recommended to pass timeoutMs explicitly every time to avoid hangs. Foreground defaults to 15 seconds without timeoutMs; background=true does not use that default timeout. When a command times out, the currently executing command is cancelled and the terminal session is kept.", "en": "Execute commands in a browser-local Linux VM shell session and collect output. The session is maintained per chat and preserves context. Strongly recommend explicitly passing timeoutMs every time to avoid hangs. Foreground mode defaults to 15s when timeoutMs is omitted; background=true does not use the default timeout. When a command times out, the current command is cancelled and the terminal session is kept." },
                    "parameters": [
                        {
                            "name": "command",
                            "description": { "zh": "Shell command to execute.", "en": "Shell command to execute." },
                            "type": "string",
                            "required": true
                        },
                        {
                            "name": "background",
                            "description": { "zh": "Whether to run the command in background. \"true\" runs the command in the background and returns immediately, suitable for long-running servers; \"false\" or omitted waits for and returns the command result.", "en": "Run command in background. 'true' runs the command in the background and returns immediately, suitable for long-running servers. 'false' or omitted waits for and returns the command result." },
                            "type": "string",
                            "required": false
                        },
                        {
                            "name": "timeoutMs",
                            "description": { "zh": "Optional timeout in milliseconds (minimum 3000ms). Strongly recommended; foreground defaults to 15000ms when omitted, and background=true does not use a default.", "en": "Optional timeout in milliseconds (minimum 3000ms). Strongly recommended; foreground defaults to 15000ms when omitted, and background=true does not use a default." },
                            "type": "string",
                            "required": false
                        }
                    ]
                }
            ]
        }
    ]
}*/

/**
 * Creates the super admin terminal tool exports.
 */
const superAdmin = (function () {
    const MAX_INLINE_TERMINAL_OUTPUT_CHARS = 12000;
    const DEFAULT_FOREGROUND_TIMEOUT_MS = 15000;
    const DEFAULT_WAIT_TIMEOUT_MS = 300000;
    const MIN_TIMEOUT_MS = 3000;
    const DEFAULT_TERMINAL_SESSION_PREFIX = "super_admin_default_session";
    const BACKGROUND_TERMINAL_SESSION_PREFIX = "super_admin_background";

    /**
     * Returns a stable foreground session name scoped to the chat and interpreter type.
     */
    function getDefaultTerminalSessionName(type: TerminalCommandType): string {
        return `${DEFAULT_TERMINAL_SESSION_PREFIX}_${type}_${getChatId()}`;
    }

    /**
     * Returns a distinct background session name scoped to the chat and interpreter type.
     */
    function getBackgroundTerminalSessionName(type: TerminalCommandType): string {
        return `${BACKGROUND_TERMINAL_SESSION_PREFIX}_${type}_${getChatId()}_${Date.now()}`;
    }

    /**
     * Saves oversized terminal output to a temporary file and returns its summary.
     */
    async function persistTerminalOutputIfTooLong(command: string, result: any): Promise<PersistedTerminalOutput | null> {
        const outputStr = typeof result?.output === "string"
            ? result.output
            : String(result?.output ?? "");
        if (outputStr.length <= MAX_INLINE_TERMINAL_OUTPUT_CHARS) {
            return null;
        }
        await Tools.Files.mkdir(OPERIT_CLEAN_ON_EXIT_DIR, true);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const rand = Math.floor(Math.random() * 1000000);
        const filePath = `${OPERIT_CLEAN_ON_EXIT_DIR}/terminal_output_${timestamp}_${rand}.log`;
        await Tools.Files.write(filePath, outputStr, false);
        return {
            command,
            output: "(saved_to_file)",
            exitCode: result?.exitCode,
            sessionId: result?.sessionId,
            platform: result.platform,
            terminal: result.terminal,
            terminalType: result.terminalType,
            timedOut: result?.timedOut === true,
            context_preserved: result?.timedOut !== true,
            output_saved_to: filePath,
            output_chars: outputStr.length,
            operit_clean_on_exit_dir: OPERIT_CLEAN_ON_EXIT_DIR,
            hint: "Output is large and saved to file. Use read_file_part or grep_code to inspect it.",
        };
    }
    /**
     * Executes a terminal command and returns output plus terminal environment details.
     * @param command - Command to execute.
     * @param background - "true" starts a background terminal command and returns immediately.
     * @param timeoutMs - Optional timeout in milliseconds, with a minimum of 3000ms.
     */
    async function runTerminalCommand(params: TerminalParams, type: TerminalCommandType) {
        try {
            if (!params.command) {
                throw new Error("Command cannot be empty");
            }
            const command = params.command;
            const background = params.background;
            const timeoutMs = params.timeoutMs;
            const terminalInfo = await Tools.System.terminal.info();
            console.log(`Executing terminal command: ${command}`);
            const isBackground = background === "true";
            let timeout;
            if (!isBackground) {
                if (timeoutMs !== undefined) {
                    const parsedTimeout = parseInt(String(timeoutMs), 10);
                    if (!Number.isFinite(parsedTimeout) || parsedTimeout < MIN_TIMEOUT_MS) {
                        throw new Error(`timeoutMs must be an integer no less than ${MIN_TIMEOUT_MS} ms`);
                    }
                    timeout = parsedTimeout;
                }
                else {
                    timeout = DEFAULT_FOREGROUND_TIMEOUT_MS;
                }
            }
            if (isBackground) {
                const session = await Tools.System.terminal.create(getBackgroundTerminalSessionName(type), type);
                const terminalEnvironment = {
                    ...terminalInfo,
                    platform: session.platform,
                    terminal: session.terminal,
                    terminalType: session.terminalType
                };
                const sessionId = session.sessionId;
                /**
                 * Runs the background terminal command inside the created session.
                 */
                (async () => {
                    try {
                        await Tools.System.terminal.exec(sessionId, command);
                    }
                    catch (error) {
                        console.error(`[terminal/background] Error: ${error.message}`);
                        console.error(error.stack);
                    }
                })();
                return {
                    command: command,
                    background: true,
                    sessionId: sessionId,
                    started: true,
                    platform: session.platform,
                    terminal: session.terminal,
                    terminalType: session.terminalType,
                    terminalEnvironment
                };
            }
            const session = await Tools.System.terminal.create(getDefaultTerminalSessionName(type), type);
            const sessionId = session.sessionId;
            const result = await Tools.System.terminal.exec(sessionId, command, timeout);
            const terminalEnvironment = {
                ...terminalInfo,
                platform: result.platform,
                terminal: result.terminal,
                terminalType: result.terminalType
            };
            const timedOut = result.timedOut === true;
            const persistedResult = await persistTerminalOutputIfTooLong(command, result);
            if (persistedResult) {
                persistedResult.timeoutMsUsed = timeout;
                persistedResult.terminalEnvironment = terminalEnvironment;
                return persistedResult;
            }
            return {
                command: command,
                output: result.output,
                exitCode: result.exitCode,
                sessionId: result.sessionId,
                platform: result.platform,
                terminal: result.terminal,
                terminalType: result.terminalType,
                timedOut: timedOut,
                timeoutMsUsed: timeout,
                terminalEnvironment,
                context_preserved: !timedOut
            };
        }
        catch (error) {
            console.error(`[${type}] Error: ${error.message}`);
            console.error(error.stack);
            throw error;
        }
    }

    /**
     * Executes a command through the shared terminal implementation for PowerShell tools.
     */
    async function powershell(params: TerminalParams) {
        return runTerminalCommand(params, "powershell");
    }

    /**
     * Executes a command through the shared terminal implementation for Bash tools.
     */
    async function bash(params: TerminalParams) {
        return runTerminalCommand(params, "bash");
    }

    /**
     * Executes a command in an Android shell terminal session.
     */
    async function shell(params: TerminalParams) {
        return runTerminalCommand(params, "shell");
    }

    /**
     * Waits until prior work in the same terminal session has completed.
     * @param sessionId - Target session ID.
     * @param timeoutMs - Optional timeout in milliseconds, with a minimum of 3000ms.
     */
    async function terminal_wait(params: TerminalWaitParams) {
        try {
            const timeoutMs = params.timeoutMs;
            let timeout = DEFAULT_WAIT_TIMEOUT_MS;
            if (timeoutMs !== undefined) {
                const parsedTimeout = parseInt(String(timeoutMs), 10);
                if (!Number.isFinite(parsedTimeout) || parsedTimeout < MIN_TIMEOUT_MS) {
                    throw new Error(`timeoutMs must be an integer no less than ${MIN_TIMEOUT_MS} ms`);
                }
                timeout = parsedTimeout;
            }
            const sessionId = params.sessionId;
            const marker = `__OPERIT_TERMINAL_WAIT_DONE_${Date.now()}_${Math.floor(Math.random() * 1000000)}__`;
            const waitCommand = `printf '${marker}\\n'`;
            const startedAt = Date.now();
            const result = await Tools.System.terminal.exec(sessionId, waitCommand, timeout);
            const elapsedMs = Date.now() - startedAt;
            const timedOut = result?.timedOut === true;
            const outputStr = typeof result?.output === "string"
                ? result.output
                : String(result?.output ?? "");
            const markerSeen = outputStr.includes(marker);
            return {
                sessionId,
                timedOut,
                timeoutMsUsed: timeout,
                elapsedMs,
                waitCompleted: !timedOut && markerSeen,
                markerSeen,
                exitCode: result?.exitCode,
                context_preserved: !timedOut
            };
        }
        catch (error) {
            console.error(`[terminal_wait] Error: ${error.message}`);
            console.error(error.stack);
            throw error;
        }
    }
    /**
     * Gets the visible screen content for a terminal session.
     * @param sessionId - Target session ID.
     */
    async function get_screen(params: TerminalSessionParams) {
        try {
            const sessionId = params.sessionId;
            const result = await Tools.System.terminal.screen(sessionId);
            return {
                sessionId: result.sessionId,
                terminalType: result.terminalType,
                rows: result.rows,
                cols: result.cols,
                content: result.content,
                commandRunning: result.commandRunning
            };
        }
        catch (error) {
            console.error(`[get_screen] Error: ${error.message}`);
            console.error(error.stack);
            throw error;
        }
    }
    /**
     * Writes input or a control key to a terminal session.
     * @param sessionId - Target session ID.
     * @param input - Text input.
     * @param control - Control key.
     */
    async function input(params: TerminalInputParams) {
        try {
            if (params.input === undefined && params.control === undefined) {
                throw new Error("input and control: at least one must be provided");
            }
            const sessionId = params.sessionId;
            const result = await Tools.System.terminal.input(sessionId, {
                input: params.input,
                control: params.control
            });
            return {
                sessionId: sessionId,
                input: params.input,
                control: params.control,
                result
            };
        }
        catch (error) {
            console.error(`[input] Error: ${error.message}`);
            console.error(error.stack);
            throw error;
        }
    }
    return {
        powershell,
        bash,
        shell,
        terminal_wait,
        get_screen,
        input
    };
})();
// Export one by one
exports.powershell = superAdmin.powershell;
exports.bash = superAdmin.bash;
exports.shell = superAdmin.shell;
exports.terminal_wait = superAdmin.terminal_wait;
exports.get_screen = superAdmin.get_screen;
exports.input = superAdmin.input;
