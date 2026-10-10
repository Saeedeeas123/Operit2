/* METADATA
{
    "name": "operit_editor",
    "display_name": {
        "zh": "Operit platform editor",
        "en": "Operit Platform Editor"
    },
    "description": {
        "zh": "Operit2 platform editing and troubleshooting manual. Use the current-version core command to manage packages and configuration, and verify real state.",
        "en": "Operit2 platform editing and troubleshooting guide for the current core command surface."
    },
    "enabledByDefault": false,
    "category": "System",
    "tools": [
        {
            "name": "operit_editor",
            "description": {
                "zh": "Read the Operit2 platform editing manual. For actual configuration, package, Skill, MCP, model, chat, and workspace operations, call the system tool execute_cli_command directly.",
                "en": "Read the Operit2 platform editing guide. Use the system execute_cli_command tool for package, skill, MCP, model, chat, and workspace operations."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": {
                        "zh": "Optional: describes what to edit or troubleshoot this time.",
                        "en": "Optional editing or troubleshooting target."
                    },
                    "type": "string",
                    "required": false
                }
            ]
        }
    ]
}*/

type OperitEditorParams = {
    query?: string;
};

const OPERIT_EDITOR_GUIDE = `
# Operit2 platform editor

This package only provides the current Operit2 platform editing manual. For execution actions, use the system tool execute_cli_command; the parameter is an array of CLI strings, without the operit2 executable name. In script terms this corresponds to Tools.SoftwareSettings.exec(args). A core command is not a terminal shell command, and this package provides no script-snippet execution tool.

ToolPkg API versions and cross-platform requirements:

- New Operit2 ToolPkgs must explicitly declare api_version as 2.0.0; its loading support for 1.0.0 and 1.0.1 is incomplete. Operit1 fully supports 1.0.0 and 1.0.1, which mainly target Android and are legacy API forms.
- 2.0.0 authors must prioritize cross-platform compatibility. Nearly all public interfaces are multi-platform compatible; use unified interfaces for common functionality. When encountering platform-specific interfaces, state the applicable scope clearly, and consider and verify installation, UI, and core functionality on other platforms.
- schema_version is the manifest format version, api_version is the API contract version, and version is the release version of the plugin itself. When migrating old packages, check actual interfaces, paths, and platform behavior; never just change version numbers or claim full compatibility merely because the import succeeds.

Common entry points:

- Help: an empty array shows the main entry; ["package", "help"] shows package commands; ["skill"], ["tool"], ["workspace"] show usage of the corresponding commands.
- Package management: ["package", "dir"], ["package", "import", "<artifact-host-path>"], ["package", "delete", "<name>"], ["package", "list"], ["package", "more"], ["package", "load", "<name>"], ["package", "show", "<name>"], ["package", "enable", "<name>"], ["package", "disable", "<name>"], ["package", "use", "<name>"], ["package", "exec", "<package:tool>", "<params-json>"].
- Skill: ["skill", "dir"], ["skill", "list"], ["skill", "show", "<name>"], ["skill", "visible", "<name>", "true"], ["skill", "visible", "<name>", "false"], ["skill", "errors"].
- MCP: ["mcp", "dir"], ["mcp", "list"], ["mcp", "show", "<name>"], ["mcp", "enable", "<name>"], ["mcp", "disable", "<name>"], ["mcp", "start", "<name>"], ["mcp", "tools", "<name>"].
- Models: ["model", "list"], ["model", "show", "<id>"], ["model", "function-list"], ["model", "function-show", "<type>"], ["model", "function-set", "<type>", "<provider-id>", "<model-id>"].
- Preferences: ["prefs", "show"], ["prefs", "thinking", "on"], ["prefs", "stream", "on"], ["prefs", "media-history", "<image-user-turns>", "<media-user-turns>"], ["prefs", "mcp-timeout", "<seconds>"].
- Logs: ["log", "show"], ["log", "package"], ["log", "path"], ["log", "clear"].
- Tools: ["tool", "list", "public"], ["tool", "show", "<name>"], ["tool", "exec", "<name>", "<params-json>"].
- Workspaces: ["workspace", "list"], ["workspace", "commands", "<chat-id>"], ["workspace", "run", "<chat-id>", "<command-id>"], ["workspace", "bind-default", "<chat-id>"].

Plugin authoring conventions:

- Use the current-version type definitions bundled with the PackageBuilder skill.
- First read PackageBuilder/references/PLUGIN_CREATION_WORKFLOW.md, confirm the real Skill directory with ["skill", "show", "PackageBuilder"], read the terminal host information, and verify the actual writable development directory. Do not hard-code platform paths.
- Distinguish between Tools.Files VFS paths, terminal paths, and the FileSystemHost paths used by package import, and check which real files they point to. package dir is the installation storage directory, not the source directory.
- An installed PackageBuilder does not auto-update its attachments. Before updating materials, back up user modifications and obtain confirmation, then use skill delete/load/visible/show to reinstall and verify explicitly.
- The package id stays unchanged once it has been decided for the first time.
- Use the terminal for source development and builds; use the core command of the current runtime for installation, configuration verification, and tool testing.
- First installation goes through package import; afterwards enable it and re-read package list to verify the enabled state; use package show to get the actual tool names, then test with package exec. Verify UI, hooks, and providers in their application scenarios, and view logs with log package.
- package import rejects duplicate package names. Updating the same ID requires completing the build first, recording the enabled configuration, and obtaining user confirmation for deletion, re-import, and configuration restore; stop at any failed step.
- Debug small snippets as a test package with METADATA and an exported function, verified through the installation and execution flow above.

Package system notes:

- Built-in packages come from the built-in resources of the app.
- Quasi-builtin packages come from external candidates among app resources; view them with ["package", "more"] and add them to the load list with ["package", "load", "<name>"].
- Before calling a package in the current session, use ["package", "use", "<name>"] to let the runtime activate it.
- ToolPkg sub-packages are resolved and displayed by the package system; do not hand-write another recognition layer.

Execution principles:

- First use the corresponding core command to check real state before running modification commands; never treat a completed call or a command echo as an actually successful operation.
- When changing user configuration, enabling/disabling packages or MCP, or deleting resources, confirm with the user first.
- Do not pull PackageBuilder types from the cloud; use the types bundled with the current software.
`.trim();

/** Returns the current platform-editing guide without executing mutations. */
async function operit_editor(params: OperitEditorParams = {}) {
    const query = params.query?.trim();
    if (!query) {
        return OPERIT_EDITOR_GUIDE;
    }
    return `Target: ${query}\n\n${OPERIT_EDITOR_GUIDE}`;
}

exports.operit_editor = operit_editor;
exports.main = operit_editor;
