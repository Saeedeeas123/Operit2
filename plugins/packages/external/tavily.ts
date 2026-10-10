/* METADATA
{
    "name": "tavily",

    "display_name": {
        "zh": "Tavily 搜索",
        "en": "Tavily Search"
    },
    "description": {
        "zh": "使用Tavily API执行高级网络搜索、内容提取、网站爬取和站点地图生成。",
        "en": "Use the Tavily API for advanced web search, content extraction, website crawling, and sitemap generation."
    },
    "env": [
        "TAVILY_API_KEY"
    ],
    "category": "Search",
    "tools": [
        {
            "name": "search",
            "description": { "zh": "Powerful web search using Tavily's AI search engine for comprehensive, up-to-date results.", "en": "Powerful web search using Tavily's AI search engine for comprehensive, up-to-date results." },
            "parameters": [
                { "name": "query", "description": { "zh": "Search query", "en": "Search query" }, "type": "string", "required": true },
                { "name": "search_depth", "description": { "zh": "Search depth: 'basic' or 'advanced'", "en": "Search depth: 'basic' or 'advanced'" }, "type": "string", "required": false, "default": "basic" },
                { "name": "topic", "description": { "zh": "Search topic: 'general' or 'news'", "en": "Search topic: 'general' or 'news'" }, "type": "string", "required": false, "default": "general" },
                { "name": "days", "description": { "zh": "Number of past days to include in results", "en": "Number of past days to include in results" }, "type": "number", "required": false },
                { "name": "max_results", "description": { "zh": "Maximum number of search results", "en": "Maximum number of search results" }, "type": "number", "required": false, "default": 10 },
                { "name": "include_images", "description": { "zh": "Include a list of images related to the query in the response", "en": "Include a list of images related to the query in the response" }, "type": "boolean", "required": false, "default": false },
                { "name": "include_raw_content", "description": { "zh": "Include cleaned and parsed HTML content for each search result", "en": "Include cleaned and parsed HTML content for each search result" }, "type": "boolean", "required": false, "default": false },
                { "name": "include_domains", "description": { "zh": "Domain list to specifically include in results", "en": "Domain list to specifically include in results" }, "type": "array", "required": false, "default": [] },
                { "name": "exclude_domains", "description": { "zh": "Domain list to specifically exclude from results", "en": "Domain list to specifically exclude from results" }, "type": "array", "required": false, "default": [] }
            ]
        },
        {
            "name": "extract",
            "description": { "zh": "Extract web content from specified URLs and process the raw content.", "en": "Extract web content from specified URLs and process the raw content." },
            "parameters": [
                { "name": "urls", "description": { "zh": "List of URLs to extract content from", "en": "List of URLs to extract content from" }, "type": "array", "required": true },
                { "name": "extract_depth", "description": { "zh": "Extraction depth: 'basic' or 'advanced'", "en": "Extraction depth: 'basic' or 'advanced'" }, "type": "string", "required": false, "default": "basic" },
                { "name": "include_images", "description": { "zh": "Include a list of images extracted from the URL(s)", "en": "Include a list of images extracted from the URL(s)" }, "type": "boolean", "required": false, "default": false },
                { "name": "format", "description": { "zh": "Output format: 'markdown' or 'text'", "en": "Output format: 'markdown' or 'text'" }, "type": "string", "required": false, "default": "markdown" }
            ]
        },
        {
            "name": "crawl",
            "description": { "zh": "Structured website crawler starting from a base URL.", "en": "Structured website crawler starting from a base URL." },
            "parameters": [
                { "name": "url", "description": { "zh": "Root URL to start crawling from", "en": "Root URL to start crawling from" }, "type": "string", "required": true },
                { "name": "max_depth", "description": { "zh": "Maximum crawl depth", "en": "Maximum crawl depth" }, "type": "number", "required": false, "default": 1 },
                { "name": "max_breadth", "description": { "zh": "Maximum number of links to follow per depth level", "en": "Maximum number of links to follow per depth level" }, "type": "number", "required": false, "default": 20 },
                { "name": "limit", "description": { "zh": "Total number of links the crawler will process", "en": "Total number of links the crawler will process" }, "type": "number", "required": false, "default": 50 },
                { "name": "instructions", "description": { "zh": "Natural-language instructions for the crawler", "en": "Natural-language instructions for the crawler" }, "type": "string", "required": false },
                { "name": "allow_external", "description": { "zh": "Whether to allow following links to external domains", "en": "Whether to allow following links to external domains" }, "type": "boolean", "required": false, "default": false },
                { "name": "format", "description": { "zh": "Output format: 'markdown' or 'text'", "en": "Output format: 'markdown' or 'text'" }, "type": "string", "required": false, "default": "markdown" }
            ]
        },
        {
            "name": "map",
            "description": { "zh": "Generate a structured sitemap of website URLs.", "en": "Generate a structured sitemap of website URLs." },
            "parameters": [
                { "name": "url", "description": { "zh": "Root URL to start mapping from", "en": "Root URL to start mapping from" }, "type": "string", "required": true },
                { "name": "max_depth", "description": { "zh": "Maximum mapping depth", "en": "Maximum mapping depth" }, "type": "number", "required": false, "default": 1 },
                { "name": "max_breadth", "description": { "zh": "Maximum number of links to follow per depth level", "en": "Maximum number of links to follow per depth level" }, "type": "number", "required": false, "default": 20 },
                { "name": "limit", "description": { "zh": "Total number of links the crawler will process", "en": "Total number of links the crawler will process" }, "type": "number", "required": false, "default": 50 }
            ]
        }
    ]
}*/

const tavily = (function () {
    const client = OkHttp.newClient();
    const BASE_URLS = {
        search: 'https://api.tavily.com/search',
        extract: 'https://api.tavily.com/extract',
        crawl: 'https://api.tavily.com/crawl',
        map: 'https://api.tavily.com/map'
    };

    async function makeTavilyRequest(endpoint: string, params: any): Promise<any> {
        const apiKey = getEnv("TAVILY_API_KEY");
        if (!apiKey) {
            throw new Error("Tavily API key is not set. Please configure it in the environment variables.");
        }

        const requestBody = { ...params };

        const headers = {
            'accept': 'application/json',
            'content-type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };

        try {
            const request = client.newRequest()
                .url(endpoint)
                .method('POST')
                .headers(headers)
                .body(JSON.stringify(requestBody), 'json');

            const response = await request.build().execute();

            if (!response.isSuccessful()) {
                throw new Error(`Tavily API Error: ${response.statusCode} - ${response.content}`);
            }
            return JSON.parse(response.content);
        } catch (error: any) {
            console.error(`Tavily request failed: ${error.message}`);
            throw error;
        }
    }

    function formatSearchResults(response: any): string {
        const output: string[] = [];
        if (response.answer) {
            output.push(`Answer: ${response.answer}`);
        }
        output.push('Detailed Results:');
        response.results.forEach((result: any) => {
            output.push(`\nTitle: ${result.title}`);
            output.push(`URL: ${result.url}`);
            output.push(`Content: ${result.content}`);
            if (result.raw_content) {
                output.push(`Raw Content: ${result.raw_content}`);
            }
        });
        return output.join('\n');
    }

    function formatCrawlResults(response: any): string {
        const output: string[] = [];
        output.push(`Crawl Results:`);
        output.push(`Base URL: ${response.base_url}`);
        output.push('\nCrawled Pages:');
        response.results.forEach((page: any, index: number) => {
            output.push(`\n[${index + 1}] URL: ${page.url}`);
            if (page.raw_content) {
                const contentPreview = page.raw_content.length > 200
                    ? page.raw_content.substring(0, 200) + "..."
                    : page.raw_content;
                output.push(`Content: ${contentPreview}`);
            }
        });
        return output.join('\n');
    }

    function formatMapResults(response: any): string {
        const output: string[] = [];
        output.push(`Site Map Results:`);
        output.push(`Base URL: ${response.base_url}`);
        output.push('\nMapped Pages:');
        response.results.forEach((page: string, index: number) => {
            output.push(`\n[${index + 1}] URL: ${page}`);
        });
        return output.join('\n');
    }

    async function search(params: any) {
        const response = await makeTavilyRequest(BASE_URLS.search, params);
        return formatSearchResults(response);
    }

    async function extract(params: any) {
        const response = await makeTavilyRequest(BASE_URLS.extract, params);
        // Extract uses the same format as search
        return formatSearchResults(response);
    }

    async function crawl(params: any) {
        const response = await makeTavilyRequest(BASE_URLS.crawl, params);
        return formatCrawlResults(response);
    }

    async function map(params: any) {
        const response = await makeTavilyRequest(BASE_URLS.map, params);
        return formatMapResults(response);
    }

    async function wrap(func: (params: any) => Promise<any>, params: any, successMessage: string, failMessage: string) {
        try {
            const result = await func(params);
            complete({ success: true, message: successMessage, data: result });
        } catch (error: any) {
            console.error(`Function ${func.name} failed! Error: ${error.message}`);
            complete({ success: false, message: `${failMessage}: ${error.message}`, error_stack: error.stack });
        }
    }

    return {
        search: (p: any) => wrap(search, p, '搜索成功', '搜索失败'),
        extract: (p: any) => wrap(extract, p, '提取成功', '提取失败'),
        crawl: (p: any) => wrap(crawl, p, '爬取成功', '爬取失败'),
        map: (p: any) => wrap(map, p, '映射成功', '映射失败')
    };
})();

exports.search = tavily.search;
exports.extract = tavily.extract;
exports.crawl = tavily.crawl;
exports.map = tavily.map; 