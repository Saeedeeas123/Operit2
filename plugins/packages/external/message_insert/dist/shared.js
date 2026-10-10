"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_INJECTION_TIMEOUT_SECONDS = exports.MIN_INJECTION_TIMEOUT_SECONDS = void 0;
exports.logExtraInfoInjectionInfo = logExtraInfoInjectionInfo;
exports.logExtraInfoInjectionError = logExtraInfoInjectionError;
exports.resolveExtraInfoI18n = resolveExtraInfoI18n;
exports.createDefaultSettings = createDefaultSettings;
exports.loadSettings = loadSettings;
exports.applySettingsPatch = applySettingsPatch;
exports.saveSettings = saveSettings;
exports.getExtraInfoInjectionEnabled = getExtraInfoInjectionEnabled;
exports.setExtraInfoInjectionEnabled = setExtraInfoInjectionEnabled;
exports.containsExtraInfoAttachment = containsExtraInfoAttachment;
exports.appendExtraInfoToMessage = appendExtraInfoToMessage;
exports.buildExtraInfoAttachmentTags = buildExtraInfoAttachmentTags;
const SETTINGS_CONFIG_NAME = "settings";
const COMBINED_ATTACHMENT_FILE_NAME_PREFIX = "Time:";
const COMBINED_ATTACHMENT_ID_PREFIX = "message_insert_extra_bundle_";
const LEGACY_ATTACHMENT_FILE_NAMES = [
    "extra_info_time.txt",
    "extra_info_battery.txt",
    "extra_info_weather.txt",
    "extra_info_location.txt",
    "extra_info_notifications.txt",
];
const LEGACY_ATTACHMENT_ID_PREFIXES = [
    "message_insert_extra_time_",
    "message_insert_extra_battery_",
    "message_insert_extra_weather_",
    "message_insert_extra_location_",
    "message_insert_extra_notifications_",
];
const NOTIFICATION_FETCH_LIMIT = 5;
const APP_USAGE_FETCH_LIMIT = 3;
const LOG_PREFIX = "[message_insert]";
exports.MIN_INJECTION_TIMEOUT_SECONDS = 1;
exports.MAX_INJECTION_TIMEOUT_SECONDS = 120;
const DEFAULT_INJECTION_TIMEOUT_SECONDS = 8;
// Weather is a pre-send injection path, so the shared Hook deadline bounds its location and HTTP work.
const WEATHER_INJECTION_STEP_TIMEOUT_SECONDS = 5;
const ZH_CN_I18N = {
    menuTitle: "Extra Info Injection",
    menuDescription: "Automatically attach the time, battery, weather, location, notifications, memory and other extra info when sending a message, kept in sync with the switches on the settings page",
    toolboxTitle: "Extra Info Injection",
    toolboxSubtitle: "Inject the time, battery, weather, location, notifications and memory into the user message as explicit attachments, with independent control over whether they are saved together with the chat history.",
    toolboxBanner: "The toggles here and Extra Info Injection in the input menu share one state; you can control the injected items, whether the content is saved to disk, and whether memory retrieval may return duplicates.",
    masterSectionTitle: "Injection switches",
    masterToggleTitle: "Extra Info Injection",
    masterToggleDescription: "Fully in sync with the Extra Info Injection toggle in the input menu: flipping one flips the other.",
    persistToggleTitle: "Save injected content with the message",
    persistToggleDescription: "When off, the extra info is only injected for the model and is not written to the chat history.",
    itemsSectionTitle: "Injected items",
    timeToggleTitle: "Inject time",
    timeToggleDescription: "Insert a current-time attachment with every message you send.",
    batteryToggleTitle: "Inject battery",
    batteryToggleDescription: "Insert the current battery level and charging state with every message.",
    weatherToggleTitle: "Inject weather",
    weatherToggleDescription: "Insert the current weather information with every message.",
    locationToggleTitle: "Inject location",
    locationToggleDescription: "Insert the current position and address with every message.",
    preciseLocationToggleTitle: "Precise location",
    preciseLocationToggleDescription: "Only applies when injecting the location; when on, high-accuracy positioning is used, which can be slower and drain more battery.",
    currentScreenAppToggleTitle: "Inject current screen app",
    currentScreenAppToggleDescription: "Insert the app and Activity of the current screen with every message.",
    recentAppUsageToggleTitle: "Inject top app usage durations",
    recentAppUsageToggleDescription: "Insert the foreground usage time of the top apps over the last 24 hours with every message.",
    screenTextToggleTitle: "Inject screen text",
    screenTextToggleDescription: "Capture the current screen, run OCR on it and insert the extracted text as an attachment.",
    notificationsToggleTitle: "Inject notifications",
    notificationsToggleDescription: "Insert a summary of the most recent notifications with every message.",
    memoryToggleTitle: "Inject memory",
    memoryToggleDescription: "With every message, tokenize the current input, search the memory library automatically and attach the summaries of the matches.",
    memoryConfigTitle: "Memory retrieval settings",
    memoryConfigDescription: "Memory search uses the memory search settings of the app itself; here you only control same-conversation deduplication and how many entries are injected at most. By default the first six characters of the current conversation id are reused as the snapshot id; with Allow duplicate hits enabled the snapshot is no longer reused, so a memory can be retrieved again later.",
    memoryRepeatToggleTitle: "Allow the same memory to be hit again",
    memoryRepeatToggleDescription: "When on, a new memory query snapshot is used every time and memories already hit in this conversation are no longer excluded.",
    memoryLimitFieldLabel: "Memory limit",
    memoryLimitFieldDescription: "Default 3. Controls how many memories are injected at most each time.",
    memoryLimitFieldPlaceholder: "for example 3",
    memoryConfigApplyButton: "Save memory settings",
    invalidMemoryLimitMessage: "The memory limit must be an integer greater than or equal to 1",
    injectionTimeoutFieldLabel: "Injection timeout",
    injectionTimeoutFieldDescription: "Maximum wait time for the whole extra-info collection round, in seconds. Timed-out items are marked with timeout. The range is 1 to 120 seconds.",
    injectionTimeoutFieldPlaceholder: "for example 8",
    injectionTimeoutApplyButton: "Save timeout settings",
    invalidInjectionTimeoutMessage: "The injection timeout must be an integer number of seconds between 1 and 120",
    summarySectionTitle: "Current rules",
    summaryMasterEnabled: "Extra info injection: on",
    summaryMasterDisabled: "Extra info injection: off",
    summaryPersistEnabled: "Save policy: injected content is stored together with the message",
    summaryPersistDisabled: "Save policy: injected content is only sent to the model and is not written to the chat history",
    summaryTimeEnabled: "Time: injected with every message",
    summaryTimeDisabled: "Time: off",
    summaryBatteryEnabled: "Battery: injected with every message",
    summaryBatteryDisabled: "Battery: off",
    summaryWeatherEnabled: "Weather: injected with every message",
    summaryWeatherDisabled: "Weather: off",
    summaryLocationEnabled: "Location: injected with every message",
    summaryLocationDisabled: "Location: off",
    summaryPreciseLocationEnabled: "Precise location: high-accuracy positioning is used when injecting the location",
    summaryPreciseLocationDisabled: "Precise location: off",
    summaryCurrentScreenAppEnabled: "Current screen app: injected with every message",
    summaryCurrentScreenAppDisabled: "Current screen app: off",
    summaryRecentAppUsageEnabled: "App usage: the usage durations of the top apps are injected with every message",
    summaryRecentAppUsageDisabled: "App usage: off",
    summaryScreenTextEnabled: "Screen text: a screenshot is taken and OCR runs with every message",
    summaryScreenTextDisabled: "Screen text: off",
    summaryNotificationsEnabled: "Notifications: injected with every message",
    summaryNotificationsDisabled: "Notifications: off",
    summaryMemoryEnabled: "Memory: on, tokenized automatically from the current input",
    summaryMemoryDisabled: "Memory: off",
    summaryMemoryRepeatEnabled: "Memory dedup: duplicate hits are allowed",
    summaryMemoryRepeatDisabled: "Memory dedup: memories already hit in this conversation are excluded by default",
    summaryInjectionTimeout: "Injection timeout: {seconds} s",
    summaryRulesHint: "These settings directly affect how the explicit attachments in the user message are built.",
    saveErrorPrefix: "Save failed: ",
    attachmentTimeTitle: "[Current Time]",
    attachmentBatteryTitle: "[Current Battery]",
    attachmentWeatherTitle: "[Current Weather]",
    attachmentLocationTitle: "[Current Location]",
    attachmentCurrentScreenAppTitle: "[Current Screen App]",
    attachmentRecentAppUsageTitle: "[App Usage Time]",
    attachmentScreenTextTitle: "[Screen Text]",
    attachmentNotificationsTitle: "[Recent Notifications]",
    attachmentMemoryTitle: "[Related Memories]",
    timeZoneLabel: "Time zone",
    weekdayLabel: "Weekday",
    batteryLevelLabel: "Battery level",
    batteryStatusLabel: "Status",
    batteryCharging: "Charging",
    batteryNotCharging: "Not charging",
    batteryFull: "Fully charged",
    weatherLocationLabel: "Place",
    weatherConditionLabel: "Weather",
    weatherTemperatureLabel: "Temperature",
    weatherFeelsLikeLabel: "Feels like",
    weatherHumidityLabel: "Humidity",
    weatherWindLabel: "Wind speed",
    weatherSourceLabel: "Source",
    locationAddressLabel: "Address",
    locationCoordinatesLabel: "Coordinates",
    locationAccuracyLabel: "Accuracy",
    locationProviderLabel: "Provider",
    locationTimestampLabel: "Time",
    currentScreenAppLabel: "App",
    currentScreenPackageLabel: "Package name",
    currentScreenActivityLabel: "Activity",
    appUsageWindowLabel: "Window",
    appUsageDurationLabel: "Duration",
    appUsageLastUsedLabel: "Last used",
    appUsageEmpty: "There is no app usage data to inject right now",
    screenTextScreenshotPathLabel: "Screenshot path",
    screenTextLineCountLabel: "Lines of text",
    screenTextEmpty: "No usable text was recognized on the current screen",
    notificationCountLabel: "Notification count",
    notificationAppLabel: "App",
    notificationTextLabel: "Content",
    notificationTimeLabel: "Time",
    notificationsEmpty: "There are no notifications to inject right now",
    memoryQueryLabel: "Query",
    memorySnapshotLabel: "Snapshot",
    memoryLimitLabel: "Limit",
    memoryResultCountLabel: "Matches",
    memoryTitleLabel: "Title",
    memoryContentLabel: "Content",
    memorySourceLabel: "Source",
    memoryCreatedAtLabel: "Time",
    memoryTagsLabel: "Tags",
    memoryChunkInfoLabel: "Chunks",
    memoryEmpty: "No memories matched",
    memorySnapshotUnavailable: "The current conversation id is unavailable, so a memory snapshot cannot be generated",
    errorLabel: "Error",
};
const EN_US_I18N = {
    menuTitle: "Extra Info Injection",
    menuDescription: "Automatically attach time, battery, weather, location, notifications, memories, and other extra info when sending messages, synced with the settings switch",
    toolboxTitle: "Extra Info Injection",
    toolboxSubtitle: "Attach time, battery, weather, location, notifications, and memories as visible attachments to the user message, with a separate option for whether they are persisted in chat history.",
    toolboxBanner: "This switch is the same state as the input-menu toggle. You can separately control the injected items, whether they are persisted, and whether memory hits may repeat in the same chat.",
    masterSectionTitle: "Injection Switch",
    masterToggleTitle: "Extra Info Injection",
    masterToggleDescription: "This is the exact same switch as the input-menu toggle. Changing either one keeps the other in sync.",
    persistToggleTitle: "Persist injected content",
    persistToggleDescription: "When disabled, extra info is injected only for the model request and is not written into chat history.",
    itemsSectionTitle: "Injection Items",
    timeToggleTitle: "Inject Time",
    timeToggleDescription: "Insert the current time attachment on every send.",
    batteryToggleTitle: "Inject Battery",
    batteryToggleDescription: "Insert the current battery level and charging state on every send.",
    weatherToggleTitle: "Inject Weather",
    weatherToggleDescription: "Insert current weather information on every send.",
    locationToggleTitle: "Inject Location",
    locationToggleDescription: "Insert current location and address on every send.",
    preciseLocationToggleTitle: "Precise Location",
    preciseLocationToggleDescription: "Only applies to location injection. When enabled, high accuracy mode is used and may be slower or use more battery.",
    currentScreenAppToggleTitle: "Inject Current Screen App",
    currentScreenAppToggleDescription: "Insert the current foreground app and activity shown on screen on every send.",
    recentAppUsageToggleTitle: "Inject Recent App Usage",
    recentAppUsageToggleDescription: "Insert the top few app foreground usage durations from the last 24 hours on every send.",
    screenTextToggleTitle: "Inject Screen Text",
    screenTextToggleDescription: "Capture the current screen, run OCR, and insert the recognized text as an attachment.",
    notificationsToggleTitle: "Inject Notifications",
    notificationsToggleDescription: "Insert a summary of recent notifications on every send.",
    memoryToggleTitle: "Inject Memory",
    memoryToggleDescription: "Tokenize the current input, query related memories, and attach the matched memory summaries on every send.",
    memoryConfigTitle: "Memory Search Settings",
    memoryConfigDescription: "Memory lookup directly uses the app's memory search settings. This panel only controls same-chat de-duplication and how many memories are injected each time. By default, the first 6 characters of the current chat id are reused as the snapshot id. When repeated hits are allowed, a fresh snapshot is used for each query so previously matched memories can appear again.",
    memoryRepeatToggleTitle: "Allow repeated memory hits",
    memoryRepeatToggleDescription: "When enabled, each query uses a fresh snapshot instead of excluding memories that were already matched earlier in this chat.",
    memoryLimitFieldLabel: "Memory limit",
    memoryLimitFieldDescription: "Default is 3. Controls how many memories can be injected each time.",
    memoryLimitFieldPlaceholder: "For example 3",
    memoryConfigApplyButton: "Save memory settings",
    invalidMemoryLimitMessage: "Memory limit must be an integer greater than or equal to 1",
    injectionTimeoutFieldLabel: "Injection timeout",
    injectionTimeoutFieldDescription: "Maximum wait for the whole extra-info collection round in seconds. Timed-out items are marked timeout. Range: 1 to 120 seconds.",
    injectionTimeoutFieldPlaceholder: "For example 8",
    injectionTimeoutApplyButton: "Save timeout settings",
    invalidInjectionTimeoutMessage: "Injection timeout must be an integer between 1 and 120 seconds",
    summarySectionTitle: "Current Rules",
    summaryMasterEnabled: "Extra info injection: enabled",
    summaryMasterDisabled: "Extra info injection: disabled",
    summaryPersistEnabled: "Persistence: injected content is saved with the message",
    summaryPersistDisabled: "Persistence: injected content is sent only to the model and not saved in chat history",
    summaryTimeEnabled: "Time: inject on every send",
    summaryTimeDisabled: "Time: disabled",
    summaryBatteryEnabled: "Battery: inject on every send",
    summaryBatteryDisabled: "Battery: disabled",
    summaryWeatherEnabled: "Weather: inject on every send",
    summaryWeatherDisabled: "Weather: disabled",
    summaryLocationEnabled: "Location: inject on every send",
    summaryLocationDisabled: "Location: disabled",
    summaryPreciseLocationEnabled: "Precise location: use high accuracy mode for location injection",
    summaryPreciseLocationDisabled: "Precise location: disabled",
    summaryCurrentScreenAppEnabled: "Current screen app: inject on every send",
    summaryCurrentScreenAppDisabled: "Current screen app: disabled",
    summaryRecentAppUsageEnabled: "App usage: inject recent top app usage on every send",
    summaryRecentAppUsageDisabled: "App usage: disabled",
    summaryScreenTextEnabled: "Screen text: capture and run OCR on every send",
    summaryScreenTextDisabled: "Screen text: disabled",
    summaryNotificationsEnabled: "Notifications: inject on every send",
    summaryNotificationsDisabled: "Notifications: disabled",
    summaryMemoryEnabled: "Memory: enabled with automatic tokenized lookup",
    summaryMemoryDisabled: "Memory: disabled",
    summaryMemoryRepeatEnabled: "Memory dedupe: repeated hits are allowed",
    summaryMemoryRepeatDisabled: "Memory dedupe: previously hit memories are excluded in this chat",
    summaryInjectionTimeout: "Injection timeout: {seconds}s",
    summaryRulesHint: "These settings directly control how visible attachments are generated for user messages.",
    saveErrorPrefix: "Save failed: ",
    attachmentTimeTitle: "[Current Time]",
    attachmentBatteryTitle: "[Current Battery]",
    attachmentWeatherTitle: "[Current Weather]",
    attachmentLocationTitle: "[Current Location]",
    attachmentCurrentScreenAppTitle: "[Current Screen App]",
    attachmentRecentAppUsageTitle: "[Recent App Usage]",
    attachmentScreenTextTitle: "[Screen Text]",
    attachmentNotificationsTitle: "[Recent Notifications]",
    attachmentMemoryTitle: "[Related Memories]",
    timeZoneLabel: "Time zone",
    weekdayLabel: "Weekday",
    batteryLevelLabel: "Level",
    batteryStatusLabel: "Status",
    batteryCharging: "Charging",
    batteryNotCharging: "Not charging",
    batteryFull: "Fully charged",
    weatherLocationLabel: "Location",
    weatherConditionLabel: "Condition",
    weatherTemperatureLabel: "Temperature",
    weatherFeelsLikeLabel: "Feels like",
    weatherHumidityLabel: "Humidity",
    weatherWindLabel: "Wind",
    weatherSourceLabel: "Source",
    locationAddressLabel: "Address",
    locationCoordinatesLabel: "Coordinates",
    locationAccuracyLabel: "Accuracy",
    locationProviderLabel: "Provider",
    locationTimestampLabel: "Time",
    currentScreenAppLabel: "App",
    currentScreenPackageLabel: "Package",
    currentScreenActivityLabel: "Activity",
    appUsageWindowLabel: "Time window",
    appUsageDurationLabel: "Duration",
    appUsageLastUsedLabel: "Last used",
    appUsageEmpty: "There is no app usage data to inject right now",
    screenTextScreenshotPathLabel: "Screenshot path",
    screenTextLineCountLabel: "Line count",
    screenTextEmpty: "No usable text was recognized on the current screen",
    notificationCountLabel: "Notification count",
    notificationAppLabel: "App",
    notificationTextLabel: "Content",
    notificationTimeLabel: "Time",
    notificationsEmpty: "There are no notifications to inject right now",
    memoryQueryLabel: "Query",
    memorySnapshotLabel: "Snapshot",
    memoryLimitLabel: "Limit",
    memoryResultCountLabel: "Matched",
    memoryTitleLabel: "Title",
    memoryContentLabel: "Content",
    memorySourceLabel: "Source",
    memoryCreatedAtLabel: "Time",
    memoryTagsLabel: "Tags",
    memoryChunkInfoLabel: "Chunk",
    memoryEmpty: "There are no matched memories right now",
    memorySnapshotUnavailable: "Current chat id is unavailable, so the memory snapshot cannot be created",
    errorLabel: "Error",
};
const DEFAULT_SETTINGS = {
    masterEnabled: false,
    persistInjectedContent: true,
    injectTime: true,
    injectBattery: false,
    injectWeather: false,
    injectLocation: false,
    usePreciseLocation: false,
    injectCurrentScreenApp: false,
    injectRecentAppUsage: false,
    injectScreenText: false,
    injectNotifications: false,
    injectMemory: false,
    allowRepeatedMemorySearch: false,
    memoryLimit: 3,
    injectionTimeoutSeconds: DEFAULT_INJECTION_TIMEOUT_SECONDS,
};
// Keep diagnostics useful without persisting message or collected device data to application logs.
function formatLogError(error) {
    return error instanceof Error ? error.message : String(error);
}
/// Logs a non-sensitive message-injection lifecycle event.
function logExtraInfoInjectionInfo(event, details = "") {
    console.info(`${LOG_PREFIX} ${event}${details ? ` ${details}` : ""}`);
}
/// Logs a non-sensitive message-injection failure.
function logExtraInfoInjectionError(event, error, details = "") {
    console.error(`${LOG_PREFIX} ${event}${details ? ` ${details}` : ""} error=${formatLogError(error)}`);
}
/// Describes enabled injection items for lifecycle diagnostics.
function describeEnabledItems(settings) {
    const items = [
        settings.injectTime && "time",
        settings.injectBattery && "battery",
        settings.injectWeather && "weather",
        settings.injectLocation && "location",
        settings.injectCurrentScreenApp && "current_screen_app",
        settings.injectRecentAppUsage && "recent_app_usage",
        settings.injectScreenText && "screen_text",
        settings.injectNotifications && "notifications",
        settings.injectMemory && "memory",
    ].filter((item) => Boolean(item));
    return items.join(",");
}
/// Normalizes the persisted injection deadline to the supported whole-second range.
function normalizeInjectionTimeoutSeconds(value) {
    if (typeof value !== "number" ||
        !Number.isFinite(value) ||
        !Number.isInteger(value) ||
        value < exports.MIN_INJECTION_TIMEOUT_SECONDS ||
        value > exports.MAX_INJECTION_TIMEOUT_SECONDS) {
        return DEFAULT_INJECTION_TIMEOUT_SECONDS;
    }
    return value;
}
function normalizeLocale(locale) {
    const value = String(locale || "").trim().toLowerCase();
    if (!value) {
        return "zh-CN";
    }
    if (value.startsWith("en")) {
        return "en-US";
    }
    if (value.startsWith("zh")) {
        return "zh-CN";
    }
    return "zh-CN";
}
function resolveExtraInfoI18n(locale) {
    const rawLocale = locale ?? (typeof getLang === "function" ? getLang() : "");
    return normalizeLocale(rawLocale) === "en-US" ? EN_US_I18N : ZH_CN_I18N;
}
async function useSettingsConfig() {
    const config = await PluginConfig.use(SETTINGS_CONFIG_NAME, DEFAULT_SETTINGS);
    const normalizedTimeout = normalizeInjectionTimeoutSeconds(config.injectionTimeoutSeconds);
    if (config.injectionTimeoutSeconds !== normalizedTimeout) {
        config.injectionTimeoutSeconds = normalizedTimeout;
        await PluginConfig.flush(config);
    }
    return config;
}
function createDefaultSettings() {
    return { ...DEFAULT_SETTINGS };
}
async function loadSettings() {
    return useSettingsConfig();
}
function applySettingsPatch(current, patch) {
    return {
        masterEnabled: patch.masterEnabled !== undefined ? Boolean(patch.masterEnabled) : current.masterEnabled,
        persistInjectedContent: patch.persistInjectedContent !== undefined
            ? Boolean(patch.persistInjectedContent)
            : current.persistInjectedContent,
        injectTime: patch.injectTime !== undefined ? Boolean(patch.injectTime) : current.injectTime,
        injectBattery: patch.injectBattery !== undefined ? Boolean(patch.injectBattery) : current.injectBattery,
        injectWeather: patch.injectWeather !== undefined ? Boolean(patch.injectWeather) : current.injectWeather,
        injectLocation: patch.injectLocation !== undefined ? Boolean(patch.injectLocation) : current.injectLocation,
        usePreciseLocation: patch.usePreciseLocation !== undefined
            ? Boolean(patch.usePreciseLocation)
            : current.usePreciseLocation,
        injectCurrentScreenApp: patch.injectCurrentScreenApp !== undefined
            ? Boolean(patch.injectCurrentScreenApp)
            : current.injectCurrentScreenApp,
        injectRecentAppUsage: patch.injectRecentAppUsage !== undefined
            ? Boolean(patch.injectRecentAppUsage)
            : current.injectRecentAppUsage,
        injectScreenText: patch.injectScreenText !== undefined
            ? Boolean(patch.injectScreenText)
            : current.injectScreenText,
        injectNotifications: patch.injectNotifications !== undefined
            ? Boolean(patch.injectNotifications)
            : current.injectNotifications,
        injectMemory: patch.injectMemory !== undefined ? Boolean(patch.injectMemory) : current.injectMemory,
        allowRepeatedMemorySearch: patch.allowRepeatedMemorySearch !== undefined
            ? Boolean(patch.allowRepeatedMemorySearch)
            : current.allowRepeatedMemorySearch,
        memoryLimit: patch.memoryLimit !== undefined
            ? Math.floor(Number(patch.memoryLimit))
            : current.memoryLimit,
        injectionTimeoutSeconds: normalizeInjectionTimeoutSeconds(patch.injectionTimeoutSeconds ?? current.injectionTimeoutSeconds),
    };
}
async function saveSettings(patch) {
    const config = await useSettingsConfig();
    const next = applySettingsPatch(config, patch);
    config.masterEnabled = next.masterEnabled;
    config.persistInjectedContent = next.persistInjectedContent;
    config.injectTime = next.injectTime;
    config.injectBattery = next.injectBattery;
    config.injectWeather = next.injectWeather;
    config.injectLocation = next.injectLocation;
    config.usePreciseLocation = next.usePreciseLocation;
    config.injectCurrentScreenApp = next.injectCurrentScreenApp;
    config.injectRecentAppUsage = next.injectRecentAppUsage;
    config.injectScreenText = next.injectScreenText;
    config.injectNotifications = next.injectNotifications;
    config.injectMemory = next.injectMemory;
    config.allowRepeatedMemorySearch = next.allowRepeatedMemorySearch;
    config.memoryLimit = next.memoryLimit;
    config.injectionTimeoutSeconds = next.injectionTimeoutSeconds;
    logExtraInfoInjectionInfo("settings.saved", `master_enabled=${next.masterEnabled} persist=${next.persistInjectedContent} items=${describeEnabledItems(next) || "none"} memory_limit=${next.memoryLimit} injection_timeout_seconds=${next.injectionTimeoutSeconds}`);
    return next;
}
async function getExtraInfoInjectionEnabled() {
    return (await loadSettings()).masterEnabled;
}
async function setExtraInfoInjectionEnabled(enabled) {
    return saveSettings({ masterEnabled: !!enabled });
}
function escapeXml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
function containsExtraInfoAttachment(input) {
    const attachmentMarkers = [
        `filename="${COMBINED_ATTACHMENT_FILE_NAME_PREFIX}`,
        `id="${COMBINED_ATTACHMENT_ID_PREFIX}`,
        ...LEGACY_ATTACHMENT_FILE_NAMES.map(name => `filename="${name}"`),
        ...LEGACY_ATTACHMENT_ID_PREFIXES.map(prefix => `id="${prefix}`),
    ];
    return attachmentMarkers.some(marker => input.includes(marker));
}
function buildAttachmentTag(idPrefix, fileName, content) {
    const attachmentId = `${idPrefix}${Date.now()}`;
    const attributes = [
        `id="${escapeXml(attachmentId)}"`,
        `filename="${escapeXml(fileName)}"`,
        `type="text/plain"`,
        `size="${content.length}"`,
    ].join(" ");
    return `<attachment ${attributes}>${escapeXml(content)}</attachment>`;
}
function pad2(value) {
    return String(value).padStart(2, "0");
}
function formatLocalTimestamp(timestampMs) {
    const date = new Date(timestampMs);
    return [
        date.getFullYear(),
        pad2(date.getMonth() + 1),
        pad2(date.getDate()),
    ].join("-") + " " + [
        pad2(date.getHours()),
        pad2(date.getMinutes()),
        pad2(date.getSeconds()),
    ].join(":");
}
function resolveWeekdayName(date) {
    const locale = normalizeLocale(typeof getLang === "function" ? getLang() : "");
    const weekdays = locale === "en-US"
        ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekdays[date.getDay()] || "";
}
function resolveTimeZoneText(date) {
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absolute = Math.abs(offsetMinutes);
    return `UTC${sign}${pad2(Math.floor(absolute / 60))}:${pad2(absolute % 60)}`;
}
function buildTimeContent() {
    const now = new Date();
    const text = resolveExtraInfoI18n();
    const localTime = formatLocalTimestamp(now.getTime());
    const weekday = resolveWeekdayName(now);
    const timeZone = resolveTimeZoneText(now);
    return [
        text.attachmentTimeTitle,
        localTime,
        `${text.timeZoneLabel}: ${timeZone}`,
        `${text.weekdayLabel}: ${weekday}`,
    ].join("\n");
}
function formatCoordinates(latitude, longitude) {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}
function buildLocationParts(location) {
    return [
        location?.city,
        location?.province,
        location?.country,
    ].map((item) => String(item || "").trim()).filter(Boolean);
}
async function readLocationSnapshot(highAccuracy = false, timeoutSeconds = 8, includeAddress = true) {
    const location = await Tools.System.getLocation(highAccuracy, timeoutSeconds, includeAddress);
    const latitude = Number(location?.latitude);
    const longitude = Number(location?.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("location coordinates unavailable");
    }
    return {
        location,
        latitude,
        longitude,
        addressParts: buildLocationParts(location),
    };
}
/// Resolves the wttr.in response language from the current Operit locale.
function resolveWeatherLanguage(locale) {
    return normalizeLocale(locale) === "en-US" ? "en" : "zh";
}
/// Validates the exact wttr.in fields used by the weather injection.
function parseWeatherPayload(raw) {
    let value;
    try {
        value = JSON.parse(raw);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error || "unknown");
        throw new Error(`weather response parse failed: ${message}`);
    }
    if (value === null || typeof value !== "object") {
        throw new Error("weather response must be an object");
    }
    const payload = value;
    const current = payload.current_condition?.[0];
    const area = payload.nearest_area?.[0];
    if (!current ||
        !Array.isArray(current.weatherDesc) ||
        !Array.isArray(current.lang_zh) ||
        typeof current.temp_C !== "string" ||
        typeof current.FeelsLikeC !== "string" ||
        typeof current.humidity !== "string" ||
        typeof current.windspeedKmph !== "string" ||
        !area ||
        !Array.isArray(area.areaName) ||
        !Array.isArray(area.region) ||
        !Array.isArray(area.country)) {
        throw new Error("weather response schema is invalid");
    }
    return payload;
}
/// Reads the first non-empty localized value from a verified wttr.in text array.
function weatherTextValue(values) {
    const value = values[0]?.value;
    if (typeof value !== "string") {
        throw new Error("weather response text value is invalid");
    }
    return value.trim();
}
function buildCombinedAttachmentFileName(timestampMs) {
    const date = new Date(timestampMs);
    const displayTime = `${pad2(date.getHours())}:${pad2(date.getMinutes())} ${pad2(date.getDate())}/${date.getFullYear()}/${date.getMonth() + 1}`;
    return `${COMBINED_ATTACHMENT_FILE_NAME_PREFIX}${displayTime}`;
}
function buildBatteryContent() {
    return "";
}
function buildErrorContent(title, error) {
    const text = resolveExtraInfoI18n();
    const message = error instanceof Error ? error.message : String(error || "unknown");
    return [
        title,
        `${text.errorLabel}: ${message}`,
    ].join("\n");
}
// Keep the attachment shape visible when a provider misses the shared deadline without exposing partial data.
function buildTimeoutContent(title) {
    return [title, "timeout"].join("\n");
}
/// Identifies timeout failures returned by host providers.
function isTimeoutError(error) {
    const message = error instanceof Error ? error.message : String(error || "");
    return /timeout|timed out/i.test(message);
}
/// Collects one optional injection item against the shared absolute deadline.
async function buildOptionalContent(item, title, build, deadlineAt) {
    const startedAt = Date.now();
    const remainingMs = Math.max(0, deadlineAt - startedAt);
    if (remainingMs === 0) {
        logExtraInfoInjectionInfo("item.timeout", `item=${item} elapsed_ms=${Date.now() - startedAt}`);
        return buildTimeoutContent(title);
    }
    let timeoutId;
    let timedOut = false;
    const markTimeout = () => {
        if (!timedOut) {
            timedOut = true;
            logExtraInfoInjectionInfo("item.timeout", `item=${item} elapsed_ms=${Date.now() - startedAt}`);
        }
        return buildTimeoutContent(title);
    };
    const timeoutPromise = new Promise((resolve) => {
        timeoutId = setTimeout(() => resolve(markTimeout()), remainingMs);
    });
    // Attach rejection handling before racing so a provider that finishes after the deadline cannot
    // create an unhandled rejection while its result is intentionally discarded.
    const contentPromise = Promise.resolve()
        .then(build)
        .then((content) => {
        if (Date.now() >= deadlineAt) {
            return markTimeout();
        }
        logExtraInfoInjectionInfo("item.completed", `item=${item} elapsed_ms=${Date.now() - startedAt} content_length=${content.length}`);
        return content;
    }, (error) => {
        if (Date.now() >= deadlineAt || isTimeoutError(error)) {
            return markTimeout();
        }
        logExtraInfoInjectionError("item.failed", error, `item=${item} elapsed_ms=${Date.now() - startedAt}`);
        return buildErrorContent(title, error);
    });
    try {
        return await Promise.race([contentPromise, timeoutPromise]);
    }
    finally {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
    }
}
async function fetchWeatherPayload(locale) {
    const weatherLanguage = resolveWeatherLanguage(locale);
    const response = await Tools.Net.http({
        url: `https://wttr.in/?format=j1&lang=${weatherLanguage}`,
        method: "GET",
        headers: {
            Accept: "application/json",
        },
        connect_timeout: WEATHER_INJECTION_STEP_TIMEOUT_SECONDS,
        read_timeout: WEATHER_INJECTION_STEP_TIMEOUT_SECONDS,
        validateStatus: false,
    });
    if (Number(response.statusCode) < 200 || Number(response.statusCode) >= 300) {
        throw new Error(`weather request failed: HTTP ${response.statusCode}`);
    }
    const rawContent = String(response.content || "").trim();
    if (!rawContent) {
        throw new Error("weather response empty");
    }
    return parseWeatherPayload(rawContent);
}
async function buildWeatherContent() {
    const text = resolveExtraInfoI18n();
    const locale = typeof getLang === "function" ? String(getLang() || "") : "";
    const payload = await fetchWeatherPayload(locale);
    const current = payload.current_condition[0];
    const nearestArea = payload.nearest_area[0];
    const locationText = [
        weatherTextValue(nearestArea.areaName),
        weatherTextValue(nearestArea.region),
        weatherTextValue(nearestArea.country),
    ].filter((value) => value.length > 0).join(", ");
    const weatherDesc = normalizeLocale(locale) === "en-US"
        ? weatherTextValue(current.weatherDesc)
        : weatherTextValue(current.lang_zh);
    const tempC = current.temp_C.trim();
    const feelsLikeC = current.FeelsLikeC.trim();
    const humidity = current.humidity.trim();
    const windKmph = current.windspeedKmph.trim();
    return [
        text.attachmentWeatherTitle,
        `${text.weatherLocationLabel}: ${locationText}`,
        `${text.weatherConditionLabel}: ${weatherDesc || "-"}`,
        `${text.weatherTemperatureLabel}: ${tempC ? `${tempC}°C` : "-"}${feelsLikeC ? ` (${text.weatherFeelsLikeLabel}: ${feelsLikeC}°C)` : ""}`,
        `${text.weatherHumidityLabel}: ${humidity ? `${humidity}%` : "-"}`,
        `${text.weatherWindLabel}: ${windKmph ? `${windKmph} km/h` : "-"}`,
        `${text.weatherSourceLabel}: wttr.in`,
    ].join("\n");
}
async function buildLocationContent() {
    const text = resolveExtraInfoI18n();
    const settings = await loadSettings();
    const locationSnapshot = await readLocationSnapshot(settings.usePreciseLocation);
    const { location, latitude, longitude, addressParts } = locationSnapshot;
    const coordinates = formatCoordinates(latitude, longitude);
    const accuracy = Number.isFinite(Number(location.accuracy)) && Number(location.accuracy) > 0
        ? `${Math.round(Number(location.accuracy))} m`
        : "-";
    const timestamp = Number.isFinite(Number(location.timestamp)) && Number(location.timestamp) > 0
        ? formatLocalTimestamp(Number(location.timestamp))
        : "-";
    return [
        text.attachmentLocationTitle,
        `${text.locationAddressLabel}: ${addressParts.join(" / ") || "-"}`,
        `${text.locationCoordinatesLabel}: ${coordinates}`,
        `${text.locationAccuracyLabel}: ${accuracy}`,
        `${text.locationProviderLabel}: ${String(location.provider || "-").trim() || "-"}`,
        `${text.locationTimestampLabel}: ${timestamp}`,
    ].join("\n");
}
function resolveAppLabel(packageName) {
    const normalizedPackageName = String(packageName || "").trim();
    return normalizedPackageName || "-";
}
async function readCurrentPageInfo() {
    const result = await toolCall("get_page_info", {});
    if (!result || typeof result !== "object") {
        throw new Error("page info unavailable");
    }
    return result;
}
async function buildCurrentScreenAppContent() {
    const text = resolveExtraInfoI18n();
    const pageInfo = await readCurrentPageInfo();
    const packageName = String(pageInfo?.packageName || "").trim();
    const activityName = String(pageInfo?.activityName || "").trim();
    if (!packageName) {
        throw new Error("current screen package unavailable");
    }
    return [
        text.attachmentCurrentScreenAppTitle,
        `${text.currentScreenAppLabel}: ${resolveAppLabel(packageName)}`,
        `${text.currentScreenPackageLabel}: ${packageName}`,
        `${text.currentScreenActivityLabel}: ${activityName || "-"}`,
    ].join("\n");
}
function formatDurationMs(durationMs) {
    const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (hours > 0) {
        parts.push(`${hours}h`);
    }
    if (minutes > 0 || hours > 0) {
        parts.push(`${minutes}m`);
    }
    parts.push(`${seconds}s`);
    return parts.join(" ");
}
async function buildRecentAppUsageContent() {
    const text = resolveExtraInfoI18n();
    const result = await Tools.System.getAppUsageTime({
        sinceHours: 24,
        limit: APP_USAGE_FETCH_LIMIT,
        includeSystemApps: false,
    });
    const entries = Array.isArray(result?.entries) ? result.entries : [];
    const lines = [
        text.attachmentRecentAppUsageTitle,
        `${text.appUsageWindowLabel}: 24h`,
    ];
    if (!entries.length) {
        lines.push(text.appUsageEmpty);
        return lines.join("\n");
    }
    entries.forEach((entry, index) => {
        const packageName = String(entry?.packageName || "").trim() || "-";
        const appName = String(entry?.appName || "").trim() || resolveAppLabel(packageName);
        const durationMs = Number(entry?.totalForegroundTimeMs);
        const lastTimeUsed = Number(entry?.lastTimeUsed);
        lines.push(`#${index + 1}`, `${text.currentScreenAppLabel}: ${appName}`, `${text.currentScreenPackageLabel}: ${packageName}`, `${text.appUsageDurationLabel}: ${Number.isFinite(durationMs) ? formatDurationMs(durationMs) : "-"}`, `${text.appUsageLastUsedLabel}: ${Number.isFinite(lastTimeUsed) && lastTimeUsed > 0 ? formatLocalTimestamp(lastTimeUsed) : "-"}`);
    });
    return lines.join("\n");
}
function extractScreenshotPath(result) {
    if (typeof result === "string") {
        return result.trim();
    }
    if (!result || typeof result !== "object") {
        return "";
    }
    const value = String(result?.value || result?.path || "").trim();
    return value;
}
function countTextLines(value) {
    return String(value || "")
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean).length;
}
async function buildScreenTextContent() {
    const text = resolveExtraInfoI18n();
    const screenshotResult = await toolCall("capture_screenshot", {});
    const screenshotPath = extractScreenshotPath(screenshotResult);
    if (!screenshotPath) {
        throw new Error("screenshot path unavailable");
    }
    const screenshot = await Tools.Files.read(screenshotPath);
    const recognizedText = String(screenshot?.content || "").trim();
    return [
        text.attachmentScreenTextTitle,
        `${text.screenTextScreenshotPathLabel}: ${screenshotPath || "-"}`,
        `${text.screenTextLineCountLabel}: ${countTextLines(recognizedText)}`,
        recognizedText || text.screenTextEmpty,
    ].join("\n");
}
async function buildNotificationsContent() {
    const text = resolveExtraInfoI18n();
    const result = await Tools.System.getNotifications(NOTIFICATION_FETCH_LIMIT, false);
    const notifications = Array.isArray(result?.notifications) ? result.notifications : [];
    const lines = [
        text.attachmentNotificationsTitle,
        `${text.notificationCountLabel}: ${notifications.length}`,
    ];
    if (!notifications.length) {
        lines.push(text.notificationsEmpty);
        return lines.join("\n");
    }
    notifications.forEach((notification, index) => {
        const packageName = String(notification?.packageName || "").trim() || "-";
        const notificationText = String(notification?.text || "").trim() || "-";
        const timestamp = Number.isFinite(Number(notification?.timestamp)) && Number(notification.timestamp) > 0
            ? formatLocalTimestamp(Number(notification.timestamp))
            : "-";
        lines.push(`#${index + 1}`, `${text.notificationAppLabel}: ${packageName}`, `${text.notificationTextLabel}: ${notificationText}`, `${text.notificationTimeLabel}: ${timestamp}`);
    });
    return lines.join("\n");
}
function formatDecimal(value) {
    if (!Number.isFinite(value)) {
        return "0";
    }
    return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}
function collapseInlineWhitespace(value, maxLength = 220) {
    const normalized = String(value || "").replace(/\s+/g, " ").trim();
    if (!normalized) {
        return "-";
    }
    if (normalized.length <= maxLength) {
        return normalized;
    }
    return `${normalized.slice(0, maxLength)}...`;
}
function buildMemorySnapshotId(chatId) {
    const normalized = String(chatId || "").trim();
    if (!normalized) {
        return "";
    }
    return normalized.slice(0, 6);
}
function resolveMemoryCallerCardId(activePrompt) {
    if (!activePrompt || activePrompt.type !== "character_card") {
        return undefined;
    }
    const callerCardId = String(activePrompt.id || "").trim();
    return callerCardId || undefined;
}
function stripMessageForMemorySearch(messageText) {
    return String(messageText || "")
        .replace(/<attachment\b[\s\S]*?<\/attachment>/gi, " ")
        .replace(/<workspace_attachment\b[\s\S]*?<\/workspace_attachment>/gi, " ")
        .replace(/<reply_to\b[\s\S]*?<\/reply_to>/gi, " ")
        .replace(/<proxy_sender\b[^>]*\/?>/gi, " ")
        .replace(/\[\s*From [^\]]+\]\s*/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/[\r\n\t]+/g, " ")
        .replace(/[|]+/g, " ")
        .trim();
}
function buildMemorySearchQuery(messageText) {
    return stripMessageForMemorySearch(messageText);
}
async function buildMemoryContent(messageText, chatId, activePrompt) {
    const text = resolveExtraInfoI18n();
    const settings = await loadSettings();
    const reuseSnapshot = !settings.allowRepeatedMemorySearch;
    const snapshotId = reuseSnapshot ? buildMemorySnapshotId(chatId) : "";
    const callerCardId = resolveMemoryCallerCardId(activePrompt);
    if (reuseSnapshot && !snapshotId) {
        throw new Error(text.memorySnapshotUnavailable);
    }
    const searchQuery = buildMemorySearchQuery(messageText);
    const lines = [
        text.attachmentMemoryTitle,
        `${text.memoryQueryLabel}: ${searchQuery || "-"}`,
        `${text.memorySnapshotLabel}: ${snapshotId || "-"}`,
        `${text.memoryLimitLabel}: ${settings.memoryLimit}`,
    ];
    if (!searchQuery) {
        lines.push(`${text.memoryResultCountLabel}: 0`, text.memoryEmpty);
        return lines.join("\n");
    }
    const result = await toolCall("query_memory", {
        query: searchQuery,
        limit: settings.memoryLimit,
        ...(reuseSnapshot ? { snapshot_id: snapshotId } : {}),
        ...(callerCardId ? { caller_card_id: callerCardId } : {}),
    });
    const memories = Array.isArray(result?.memories) ? result.memories : [];
    lines.push(`${text.memoryResultCountLabel}: ${memories.length}`);
    if (!memories.length) {
        lines.push(text.memoryEmpty);
        return lines.join("\n");
    }
    memories.forEach((memory, index) => {
        const tags = Array.isArray(memory?.tags)
            ? memory.tags.map((item) => collapseInlineWhitespace(item, 40)).filter(Boolean)
            : [];
        lines.push(`#${index + 1}`, `${text.memoryTitleLabel}: ${collapseInlineWhitespace(memory?.title, 80)}`, `${text.memoryContentLabel}: ${collapseInlineWhitespace(memory?.content, 220)}`, `${text.memorySourceLabel}: ${collapseInlineWhitespace(memory?.source, 60)}`, `${text.memoryCreatedAtLabel}: ${collapseInlineWhitespace(memory?.createdAt, 40)}`);
        if (tags.length) {
            lines.push(`${text.memoryTagsLabel}: ${tags.join(", ")}`);
        }
        if (String(memory?.chunkInfo || "").trim()) {
            lines.push(`${text.memoryChunkInfoLabel}: ${collapseInlineWhitespace(memory.chunkInfo, 80)}`);
        }
    });
    return lines.join("\n");
}
async function appendExtraInfoToMessage(messageText, chatId, activePrompt) {
    if (!stripMessageForMemorySearch(messageText)) {
        logExtraInfoInjectionInfo("append.skipped", "reason=empty_message");
        return null;
    }
    const tags = await buildExtraInfoAttachmentTags(messageText, chatId, activePrompt);
    if (!tags.length) {
        logExtraInfoInjectionInfo("append.skipped", "reason=no_attachment_tags");
        return null;
    }
    const result = `${String(messageText || "").replace(/\s+$/, "")} ${tags.join(" ")}`.trim();
    logExtraInfoInjectionInfo("append.completed", `attachment_count=${tags.length} result_length=${result.length}`);
    return result;
}
async function buildExtraInfoAttachmentTags(messageText, chatId, activePrompt) {
    const settings = await loadSettings();
    if (!settings.masterEnabled || containsExtraInfoAttachment(messageText)) {
        logExtraInfoInjectionInfo("attachment_build.skipped", settings.masterEnabled ? "reason=attachment_already_present" : "reason=master_disabled");
        return [];
    }
    const attachmentTimestampMs = Date.now();
    const deadlineAt = attachmentTimestampMs + settings.injectionTimeoutSeconds * 1000;
    logExtraInfoInjectionInfo("attachment_build.started", `items=${describeEnabledItems(settings) || "none"} persist=${settings.persistInjectedContent}`);
    const contentTasks = [];
    if (settings.injectTime) {
        contentTasks.push(buildOptionalContent("time", resolveExtraInfoI18n().attachmentTimeTitle, buildTimeContent, deadlineAt));
    }
    if (settings.injectBattery) {
        contentTasks.push(buildOptionalContent("battery", resolveExtraInfoI18n().attachmentBatteryTitle, buildBatteryContent, deadlineAt));
    }
    if (settings.injectWeather) {
        contentTasks.push(buildOptionalContent("weather", resolveExtraInfoI18n().attachmentWeatherTitle, buildWeatherContent, deadlineAt));
    }
    if (settings.injectLocation) {
        contentTasks.push(buildOptionalContent("location", resolveExtraInfoI18n().attachmentLocationTitle, buildLocationContent, deadlineAt));
    }
    if (settings.injectCurrentScreenApp) {
        contentTasks.push(buildOptionalContent("current_screen_app", resolveExtraInfoI18n().attachmentCurrentScreenAppTitle, buildCurrentScreenAppContent, deadlineAt));
    }
    if (settings.injectRecentAppUsage) {
        contentTasks.push(buildOptionalContent("recent_app_usage", resolveExtraInfoI18n().attachmentRecentAppUsageTitle, buildRecentAppUsageContent, deadlineAt));
    }
    if (settings.injectScreenText) {
        contentTasks.push(buildOptionalContent("screen_text", resolveExtraInfoI18n().attachmentScreenTextTitle, buildScreenTextContent, deadlineAt));
    }
    if (settings.injectNotifications) {
        contentTasks.push(buildOptionalContent("notifications", resolveExtraInfoI18n().attachmentNotificationsTitle, buildNotificationsContent, deadlineAt));
    }
    if (settings.injectMemory) {
        contentTasks.push(buildOptionalContent("memory", resolveExtraInfoI18n().attachmentMemoryTitle, () => buildMemoryContent(messageText, chatId, activePrompt), deadlineAt));
    }
    const contentBlocks = await Promise.all(contentTasks);
    if (!contentBlocks.length) {
        logExtraInfoInjectionInfo("attachment_build.skipped", contentTasks.length ? "reason=no_items_completed_before_deadline" : "reason=no_items_enabled");
        return [];
    }
    const attachment = buildAttachmentTag(COMBINED_ATTACHMENT_ID_PREFIX, buildCombinedAttachmentFileName(attachmentTimestampMs), contentBlocks.join("\n\n"));
    logExtraInfoInjectionInfo("attachment_build.completed", `content_blocks=${contentBlocks.length} attachment_length=${attachment.length} elapsed_ms=${Date.now() - attachmentTimestampMs}`);
    return [attachment];
}
