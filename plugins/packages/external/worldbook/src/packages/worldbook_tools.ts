/* METADATA
{
  "name": "worldbook_tools",
  "display_name": {
    "zh": "World Book Tools",
    "en": "World Book Tools"
  },
  "description": {
    "zh": "CRUD tools for world book entries with keyword matching, regex support, and always-active mode.",
    "en": "CRUD tools for world book entries with keyword matching, regex support, and always-active mode."
  },
  "category": "Utility",
  "tools": [
    {
      "name": "list_entries",
      "description": {
        "zh": "List summaries for all world book entries.",
        "en": "List summaries for all world book entries."
      },
      "parameters": []
    },
    {
      "name": "get_entry",
      "description": {
        "zh": "Get the full details of a world book entry.",
        "en": "Get the full details of a world book entry."
      },
      "parameters": [
        {
          "name": "id",
          "description": {
            "zh": "Entry ID",
            "en": "Entry ID"
          },
          "type": "string",
          "required": true
        }
      ]
    },
    {
      "name": "create_entry",
      "description": {
        "zh": "Create a new world book entry.",
        "en": "Create a new world book entry."
      },
      "parameters": [
        {
          "name": "name",
          "description": {
            "zh": "Entry name",
            "en": "Entry name"
          },
          "type": "string",
          "required": true
        },
        {
          "name": "content",
          "description": {
            "zh": "Injected content",
            "en": "Injected content"
          },
          "type": "string",
          "required": true
        },
        {
          "name": "keywords",
          "description": {
            "zh": "Comma-separated keywords",
            "en": "Comma-separated keywords"
          },
          "type": "string",
          "required": false
        },
        {
          "name": "is_regex",
          "description": {
            "zh": "Whether keywords are regular expressions",
            "en": "Whether keywords are regular expressions"
          },
          "type": "boolean",
          "required": false
        },
        {
          "name": "case_sensitive",
          "description": {
            "zh": "Whether keyword matching is case sensitive",
            "en": "Whether keyword matching is case sensitive"
          },
          "type": "boolean",
          "required": false
        },
        {
          "name": "always_active",
          "description": {
            "zh": "Whether the entry is always active",
            "en": "Whether the entry is always active"
          },
          "type": "boolean",
          "required": false
        },
        {
          "name": "enabled",
          "description": {
            "zh": "Whether the entry is enabled",
            "en": "Whether the entry is enabled"
          },
          "type": "boolean",
          "required": false
        },
        {
          "name": "priority",
          "description": {
            "zh": "Priority",
            "en": "Priority"
          },
          "type": "number",
          "required": false
        },
        {
          "name": "scan_depth",
          "description": {
            "zh": "Scan depth",
            "en": "Scan depth"
          },
          "type": "number",
          "required": false
        },
        {
          "name": "inject_target",
          "description": {
            "zh": "Injection target: system or user (default system)",
            "en": "Injection target: system or user (default system)"
          },
          "type": "string",
          "required": false
        },
        {
          "name": "character_card_id",
          "description": {
            "zh": "Bound character card ID; when set, the entry only works for that character card",
            "en": "Bound character card ID; when set, the entry only works for that character card"
          },
          "type": "string",
          "required": false
        }
      ]
    },
    {
      "name": "update_entry",
      "description": {
        "zh": "Update an existing world book entry.",
        "en": "Update an existing world book entry."
      },
      "parameters": [
        {
          "name": "id",
          "description": {
            "zh": "Entry ID",
            "en": "Entry ID"
          },
          "type": "string",
          "required": true
        },
        {
          "name": "name",
          "description": {
            "zh": "New name",
            "en": "New name"
          },
          "type": "string",
          "required": false
        },
        {
          "name": "content",
          "description": {
            "zh": "New injected content",
            "en": "New injected content"
          },
          "type": "string",
          "required": false
        },
        {
          "name": "keywords",
          "description": {
            "zh": "New comma-separated keywords",
            "en": "New comma-separated keywords"
          },
          "type": "string",
          "required": false
        },
        {
          "name": "is_regex",
          "description": {
            "zh": "Whether keywords are regular expressions",
            "en": "Whether keywords are regular expressions"
          },
          "type": "boolean",
          "required": false
        },
        {
          "name": "case_sensitive",
          "description": {
            "zh": "Whether keyword matching is case sensitive",
            "en": "Whether keyword matching is case sensitive"
          },
          "type": "boolean",
          "required": false
        },
        {
          "name": "always_active",
          "description": {
            "zh": "Whether the entry is always active",
            "en": "Whether the entry is always active"
          },
          "type": "boolean",
          "required": false
        },
        {
          "name": "enabled",
          "description": {
            "zh": "Whether the entry is enabled",
            "en": "Whether the entry is enabled"
          },
          "type": "boolean",
          "required": false
        },
        {
          "name": "priority",
          "description": {
            "zh": "Priority",
            "en": "Priority"
          },
          "type": "number",
          "required": false
        },
        {
          "name": "scan_depth",
          "description": {
            "zh": "Scan depth",
            "en": "Scan depth"
          },
          "type": "number",
          "required": false
        },
        {
          "name": "inject_target",
          "description": {
            "zh": "Injection target: system or user",
            "en": "Injection target: system or user"
          },
          "type": "string",
          "required": false
        },
        {
          "name": "character_card_id",
          "description": {
            "zh": "Bound character card ID; when set, the entry only works for that character card",
            "en": "Bound character card ID; when set, the entry only works for that character card"
          },
          "type": "string",
          "required": false
        }
      ]
    },
    {
      "name": "delete_entry",
      "description": {
        "zh": "Delete a world book entry.",
        "en": "Delete a world book entry."
      },
      "parameters": [
        {
          "name": "id",
          "description": {
            "zh": "Entry ID",
            "en": "Entry ID"
          },
          "type": "string",
          "required": true
        }
      ]
    },
    {
      "name": "toggle_entry",
      "description": {
        "zh": "Toggle a world book entry's enabled state.",
        "en": "Toggle a world book entry's enabled state."
      },
      "parameters": [
        {
          "name": "id",
          "description": {
            "zh": "Entry ID",
            "en": "Entry ID"
          },
          "type": "string",
          "required": true
        }
      ]
    },
    {
      "name": "import_entries",
      "description": {
        "zh": "Import entries from a world book JSON file or JSON content. Supports Operit, SillyTavern lorebooks, and embedded character_book formats.",
        "en": "Import entries from a world book JSON file or JSON content. Supports Operit, SillyTavern lorebooks, and embedded character_book formats."
      },
      "parameters": [
        {
          "name": "path",
          "description": {
            "zh": "Import file path, supports normal file paths or content:// URIs; mutually exclusive with content.",
            "en": "Import file path, supports normal file paths or content:// URIs; mutually exclusive with content."
          },
          "type": "string",
          "required": false
        },
        {
          "name": "content",
          "description": {
            "zh": "Raw JSON text; mutually exclusive with path.",
            "en": "Raw JSON text; mutually exclusive with path."
          },
          "type": "string",
          "required": false
        },
        {
          "name": "character_card_id",
          "description": {
            "zh": "Optional; bind all imported entries to the specified character card.",
            "en": "Optional; bind all imported entries to the specified character card."
          },
          "type": "string",
          "required": false
        }
      ]
    },
    {
      "name": "list_character_cards_proxy",
      "description": {
        "zh": "List all character cards through a proxy for world book UI selection.",
        "en": "List all character cards through a proxy for world book UI selection."
      },
      "parameters": []
    }
  ]
}
*/

import {
  createWorldBookEntry,
  deleteWorldBookEntry,
  getWorldBookEntry,
  importWorldBookEntries,
  listWorldBookCharacterCards,
  listWorldBookEntries,
  toggleWorldBookEntry,
  updateWorldBookEntry,
  type WorldBookError,
  type WorldBookImportParams,
  type WorldBookMutationParams
} from "../shared/worldbook_service.js";
import { ensureWorldBookStorage } from "../shared/worldbook_storage.js";

async function wrap<TParams>(handler: (params: TParams) => Promise<unknown>, params: TParams) {
  try {
    const result = await handler(params);
    complete(result);
  } catch (error) {
    const handledError = error as WorldBookError;
    complete({ success: false, code: handledError.code, message: handledError.message });
  }
}

async function listEntries(): Promise<unknown> {
  const entries = await listWorldBookEntries();
  return { success: true, count: entries.length, entries };
}

async function getEntry(params: Pick<WorldBookMutationParams, "id">): Promise<unknown> {
  const entry = await getWorldBookEntry(String(params.id || ""));
  return { success: true, entry };
}

async function createEntry(params: WorldBookMutationParams): Promise<unknown> {
  const entry = await createWorldBookEntry(params);
  return { success: true, message: "条目已创建", entry };
}

async function updateEntry(params: WorldBookMutationParams): Promise<unknown> {
  const entry = await updateWorldBookEntry(params);
  return { success: true, message: "条目已更新", entry };
}

async function deleteEntry(params: Pick<WorldBookMutationParams, "id">): Promise<unknown> {
  const removed = await deleteWorldBookEntry(String(params.id || ""));
  return { success: true, message: `条目已删除: ${removed.name}` };
}

async function toggleEntry(params: Pick<WorldBookMutationParams, "id">): Promise<unknown> {
  const entry = await toggleWorldBookEntry(String(params.id || ""));
  return {
    success: true,
    message: `${entry.name} 已${entry.enabled ? "启用" : "禁用"}`,
    entry
  };
}

async function importEntries(params: WorldBookImportParams): Promise<unknown> {
  const result = await importWorldBookEntries(params);
  return {
    success: true,
    message:
      result.warning_count > 0
        ? `已导入 ${result.imported_count} 个条目，并产生 ${result.warning_count} 条兼容性提示`
        : `已导入 ${result.imported_count} 个条目`,
    result
  };
}

async function listCharacterCardsProxy(): Promise<unknown> {
  const cards = await listWorldBookCharacterCards();
  return { success: true, totalCount: cards.length, cards };
}

exports.list_entries = (params: never) => wrap(listEntries as (params: never) => Promise<unknown>, params);
exports.get_entry = (params: Pick<WorldBookMutationParams, "id">) => wrap(getEntry, params);
exports.create_entry = (params: WorldBookMutationParams) => wrap(createEntry, params);
exports.update_entry = (params: WorldBookMutationParams) => wrap(updateEntry, params);
exports.delete_entry = (params: Pick<WorldBookMutationParams, "id">) => wrap(deleteEntry, params);
exports.toggle_entry = (params: Pick<WorldBookMutationParams, "id">) => wrap(toggleEntry, params);
exports.import_entries = (params: WorldBookImportParams) => wrap(importEntries, params);
exports.list_character_cards_proxy = (params: never) =>
  wrap(listCharacterCardsProxy as (params: never) => Promise<unknown>, params);

void ensureWorldBookStorage();
