/* METADATA
{
    "name": "extended_http_tools",

    "display_name": {
        "zh": "Extended HTTP Tools",
        "en": "Extended HTTP Tools"
    },
    "description": {
        "zh": "Allows file uploads and direct network access operations such as GET/POST.",
        "en": "Allows file uploads and direct network access operations such as GET/POST."
    },
    "enabledByDefault": true,
    "category": "Network",
    "tools": [
        {
            "name": "http_request",
            "description": { "zh": "Send an HTTP request.", "en": "Send an HTTP request." },
            "parameters": [
                { "name": "url", "description": { "zh": "Request URL", "en": "Request URL" }, "type": "string", "required": true },
                { "name": "method", "description": { "zh": "Method: GET/POST/PUT/DELETE", "en": "Method: GET/POST/PUT/DELETE" }, "type": "string", "required": true },
                { "name": "headers", "description": { "zh": "Optional: headers (JSON object string)", "en": "Optional: headers (JSON object string)" }, "type": "string", "required": false },
                { "name": "body", "description": { "zh": "Optional: body (string)", "en": "Optional: body (string)" }, "type": "string", "required": false },
                { "name": "body_type", "description": { "zh": "Optional: json/form/text/xml", "en": "Optional: json/form/text/xml" }, "type": "string", "required": false },
                { "name": "ignore_ssl", "description": { "zh": "Optional: ignore HTTPS certificate verification (true/false)", "en": "Optional: ignore HTTPS certificate verification (true/false)" }, "type": "boolean", "required": false }
            ]
        },
        {
            "name": "multipart_request",
            "description": { "zh": "Upload files (multipart).", "en": "Upload files (multipart)." },
            "parameters": [
                { "name": "url", "description": { "zh": "Request URL", "en": "Request URL" }, "type": "string", "required": true },
                { "name": "method", "description": { "zh": "Method: POST/PUT", "en": "Method: POST/PUT" }, "type": "string", "required": true },
                { "name": "headers", "description": { "zh": "Optional: headers (JSON object string)", "en": "Optional: headers (JSON object string)" }, "type": "string", "required": false },
                { "name": "form_data", "description": { "zh": "Optional: form_data (string)", "en": "Optional: form_data (string)" }, "type": "string", "required": false },
                { "name": "files", "description": { "zh": "Optional: files (JSON array string)", "en": "Optional: files (JSON array string)" }, "type": "string", "required": false },
                { "name": "ignore_ssl", "description": { "zh": "Optional: ignore HTTPS certificate verification (true/false)", "en": "Optional: ignore HTTPS certificate verification (true/false)" }, "type": "boolean", "required": false }
            ]
        },
        {
            "name": "manage_cookies",
            "description": { "zh": "Manage cookies.", "en": "Manage cookies." },
            "parameters": [
                { "name": "action", "description": { "zh": "Action: get/set/clear", "en": "Action: get/set/clear" }, "type": "string", "required": true },
                { "name": "domain", "description": { "zh": "Optional: domain", "en": "Optional: domain" }, "type": "string", "required": false },
                { "name": "cookies", "description": { "zh": "Optional: cookies (string)", "en": "Optional: cookies (string)" }, "type": "string", "required": false }
            ]
        }
    ]
}*/

const ExtendedHttpTools = (function () {

    const MAX_INLINE_HTTP_RESPONSE_CHARS = 12_000;

    interface ToolResponse {
        success: boolean;
        message: string;
        data?: any;
    }

    async function http_request(params: {
        url: string;
        method: string;
        headers?: string;
        body?: string;
        body_type?: string;
        ignore_ssl?: boolean;
    }): Promise<ToolResponse> {
        const toolParams: ToolParams = {
            url: params.url,
            method: params.method,
        };
        if (params.headers !== undefined) toolParams.headers = params.headers;
        if (params.body !== undefined) toolParams.body = params.body;
        if (params.body_type !== undefined) toolParams.body_type = params.body_type;
        if (params.ignore_ssl !== undefined) toolParams.ignore_ssl = params.ignore_ssl;

        const result = await toolCall({ name: "http_request", params: toolParams });
        const success = result.statusCode >= 200 && result.statusCode < 400;

        const contentStr = typeof result?.content === "string" ? result.content : "";
        if (contentStr.length > MAX_INLINE_HTTP_RESPONSE_CHARS) {
            await Tools.Files.mkdir(OPERIT_CLEAN_ON_EXIT_DIR, true);

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const rand = Math.floor(Math.random() * 1_000_000);

            let ext = "txt";
            const ct = typeof result?.contentType === "string" ? result.contentType.toLowerCase() : "";
            if (ct.includes("json")) ext = "json";
            else if (ct.includes("html")) ext = "html";
            else if (ct.includes("xml")) ext = "xml";

            const filePath = `${OPERIT_CLEAN_ON_EXIT_DIR}/http_response_${timestamp}_${rand}.${ext}`;
            await Tools.Files.write(filePath, contentStr, false);

            const resultMeta = {
                url: result?.url,
                statusCode: result?.statusCode,
                statusMessage: result?.statusMessage,
                headers: result?.headers,
                contentType: result?.contentType,
                size: result?.size,
                content: "(saved_to_file)",
            };

            return {
                success,
                message: `HTTP 请求完成；响应内容过大，已保存到文件：${filePath}。请使用 read_file_part 读取指定行范围，或用 grep_code 在该文件中检索关键字。`,
                data: {
                    result: resultMeta,
                    content_saved_to: filePath,
                    operit_clean_on_exit_dir: OPERIT_CLEAN_ON_EXIT_DIR,
                },
            };
        }

        return { success, message: 'HTTP 请求完成', data: result };
    }

    async function multipart_request(params: {
        url: string;
        method: string;
        headers?: string;
        form_data?: string;
        files?: string;
        ignore_ssl?: boolean;
    }): Promise<ToolResponse> {
        const toolParams: ToolParams = {
            url: params.url,
            method: params.method,
        };
        if (params.headers !== undefined) toolParams.headers = params.headers;
        if (params.form_data !== undefined) toolParams.form_data = params.form_data;
        if (params.files !== undefined) toolParams.files = params.files;
        if (params.ignore_ssl !== undefined) toolParams.ignore_ssl = params.ignore_ssl;

        const result = await toolCall({ name: "multipart_request", params: toolParams });
        const success = result.statusCode >= 200 && result.statusCode < 400;
        return { success, message: '文件上传完成', data: result };
    }

    async function manage_cookies(params: { action: string; domain?: string; cookies?: string }): Promise<ToolResponse> {
        const toolParams: ToolParams = {
            action: params.action,
        };
        if (params.domain !== undefined) toolParams.domain = params.domain;
        if (params.cookies !== undefined) toolParams.cookies = params.cookies;

        const result = await toolCall({ name: "manage_cookies", params: toolParams });
        const success = result.statusCode >= 200 && result.statusCode < 400;
        return { success, message: 'Cookies 操作完成', data: result };
    }

    async function wrapToolExecution<P>(func: (params: P) => Promise<ToolResponse>, params: P) {
        try {
            const result = await func(params);
            complete(result);
        } catch (error: any) {
            console.error(`Tool ${func.name} failed unexpectedly`, error);
            complete({
                success: false,
                message: `工具执行时发生意外错误: ${error.message}`,
            });
        }
    }

    async function main() {
        const results: any[] = [];

        // 这些工具可能对外发请求 / 写 cookies，默认不做自动化演示。
        results.push({ tool: 'http_request', result: { success: null, message: '未测试（会对外发起网络请求）' } });
        results.push({ tool: 'multipart_request', result: { success: null, message: '未测试（会上传文件/对外发起网络请求）' } });
        results.push({ tool: 'manage_cookies', result: { success: null, message: '未测试（会读写 cookies）' } });

        complete({
            success: true,
            message: "拓展 HTTP 工具包加载完成（未执行网络请求测试）",
            data: { results }
        });
    }

    return {
        http_request: (params: {
            url: string;
            method: string;
            headers?: string;
            body?: string;
            body_type?: string;
            ignore_ssl?: boolean;
        }) => wrapToolExecution(http_request, params),
        multipart_request: (params: {
            url: string;
            method: string;
            headers?: string;
            form_data?: string;
            files?: string;
            ignore_ssl?: boolean;
        }) => wrapToolExecution(multipart_request, params),
        manage_cookies: (params: { action: string; domain?: string; cookies?: string }) => wrapToolExecution(manage_cookies, params),
        main,
    };
})();

exports.http_request = ExtendedHttpTools.http_request;
exports.multipart_request = ExtendedHttpTools.multipart_request;
exports.manage_cookies = ExtendedHttpTools.manage_cookies;
exports.main = ExtendedHttpTools.main;
