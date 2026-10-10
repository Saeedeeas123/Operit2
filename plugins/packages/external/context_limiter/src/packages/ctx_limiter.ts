/* METADATA
{
    "name": "ctx_limiter",
    "display_name": {
        "zh": "Context Limiter",
        "en": "Context Limiter"
    },
    "description": {
        "zh": "Keep SYSTEM messages and only the latest N USER/ASSISTANT turns. Works especially well with non-cached APIs.",
        "en": "Keep SYSTEM messages and only the latest N USER/ASSISTANT turns. Works especially well with non-cached APIs."
    },
    "enabledByDefault": true,
    "env": [
        {
            "name": "CTX_LIMITER_FLOOR_LIMIT",
            "description": {
                "zh": "How many recent turns to keep, default 5",
                "en": "How many recent turns to keep, default 5"
            },
            "required": false
        },
        {
            "name": "CTX_LIMITER_ENABLED",
            "description": {
                "zh": "Whether the limiter is enabled, true/false, default true",
                "en": "Whether the limiter is enabled, true/false, default true"
            },
            "required": false
        }
    ],
    "tools": [
        {
            "name": "set_floor_limit",
            "description": {
                "zh": "Set how many recent turns to keep",
                "en": "Set how many recent turns to keep"
            },
            "parameters": [
                {
                    "name": "n",
                    "description": {
                        "zh": "Keep the latest N turns (default 5)",
                        "en": "Keep the latest N turns (default 5)"
                    },
                    "type": "number",
                    "required": true
                }
            ]
        },
        {
            "name": "get_floor_limit",
            "description": {
                "zh": "Get the current turn limit",
                "en": "Get the current turn limit"
            },
            "parameters": []
        }
    ]
}
*/

import { DEFAULT_FLOOR_LIMIT, ENV_KEYS } from "../constants";

interface FloorLimitParams {
  n?: string | number;
}

function normalizeLimit(value: string | number | undefined): number {
  const parsed = Number.parseInt(String(value), 10);
  return parsed;
}

export function set_floor_limit(params: FloorLimitParams) {
  const limit = normalizeLimit(params.n);
  if (!Number.isFinite(limit) || limit < 1) {
    complete({ success: false, error: "n 必须是大于 0 的整数" });
    return;
  }

  Tools.SoftwareSettings.writeEnvironmentVariable(ENV_KEYS.floorLimit, String(limit))
    .then(() => {
      complete({
        success: true,
        floor_limit: limit,
        message: `已设置保留最近 ${limit} 个楼层`,
      });
    })
    .catch((error: unknown) => {
      complete({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    });
}

export function get_floor_limit() {
  let current = DEFAULT_FLOOR_LIMIT;
  if (typeof getEnv === "function") {
    const raw = getEnv(ENV_KEYS.floorLimit);
    const parsed = Number.parseInt(String(raw ?? ""), 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      current = parsed;
    }
  }

  complete({
    success: true,
    floor_limit: current,
    message: `当前保留最近 ${current} 个楼层`,
  });
}
