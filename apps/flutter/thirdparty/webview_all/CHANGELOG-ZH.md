## 1.2.1

* On macOS, ignore `setBackgroundColor` and log a message to avoid app crashes from unimplemented WKWebView `opaque` / `backgroundColor`.
* Complete the `examples/platform` Linux platform by attaching the Flutter view to the `GtkOverlay` before creating the WebKitGTK view.

## 1.2.0

* Complete each platform package's coverage of `webview_flutter_platform_interface`.
* Add Linux WebKitGTK platform-specific controller creation parameters and runtime settings, covering developer extras, automatic JavaScript pop-ups, media playback, page cache, file URL access, text zoom/font size, page zoom, and DevTools opening.
* Add Web iframe platform-specific creation parameters and runtime property settings, covering `allow`, `sandbox`, `referrerpolicy`, and custom iframe attributes, and preserve the user-defined sandbox when switching JavaScript modes.
* Add OHOS ArkWeb platform-specific controller creation parameters and runtime WebSettings setters, covering DOM storage, automatic JavaScript pop-ups, multi-window, viewport/overview, zoom controls, file access, media gesture policy, support zoom, text zoom, and fullscreen rotation.
* Add explicit `loadFileWithParams` overrides for the controllers of all platforms.
* When the native platform provides no certificate data, the certificate of platform SSL auth errors uniformly returns `null`.
* Validate common WebView cookies uniformly before forwarding to the platform cookie store.
* Avoid OHOS replaying subframe requests as main-frame loads after the navigation proxy allows them.
* HTTP status error callbacks now carry platform-specific request metadata and response details when available.
* OHOS JavaScript execution results are now JSON-decoded first so strings, arrays, objects, booleans, and numbers match other platforms' structured return behavior as much as possible.
* OHOS POST `loadRequest` with custom request headers now fails explicitly instead of silently dropping headers, and logs ArkWeb's underlying limitation.
* Windows uses the default decision for WebView2 permission requests that cannot be mapped to a common resource type, avoiding exposing empty resource requests to the app.
* Linux permission requests without any recognizable resource type now reject the native request directly, avoiding exposing empty resource requests to the app.
* Add forwarding tests for `WebViewController`, `NavigationDelegate`, permission requests, and `WebViewWidget` in the main wrapper.
* Add a shared analyzer lint configuration for the main package and platform packages.
* Bring `examples/platform` into local verification and audit that its path package lockfile version matches the workspace release version.
* Update the example Android project to the current Flutter Gradle template shape; the app module no longer applies the Kotlin Gradle plugin directly.
* Migrate the example iOS and macOS projects to Swift Package Manager only and remove the template CocoaPods integration.
* Restore the example app's `cupertino_icons` dependency so the Web release build includes the referenced icon font.
* Add regression tests for Linux permission request grant/deny dispatch and Web user-agent reset behavior.
* Complete OHOS permission request grant coverage: support camera, microphone, MIDI sysex, and protected media resources, and safely reject unknown resources.
* Remove runtime type checks in the Web JavaScript dialog bridge that triggered Flutter Web wasm dry-run warnings, and add multi-WebView dialog bridge coverage.
* Complete `loadRequest` request body/header handling and HTTP status error callback coverage for Windows and Linux.
* Add native local storage clearing capability for Windows and Linux.
* Complete OHOS HTTP error and SSL auth callback bridging.
* Strengthen the Web implementation: within browser limits, complete same-origin JavaScript execution, JavaScript channels, console forwarding, alert/confirm/prompt forwarding, scrolling, scrollbars, over-scroll, JavaScript mode, zoom, and permission request coverage.
* Add an explicit Web `PlatformSslAuthError` implementation that marks recoverable certificate decisions as unsupported instead of leaving platform interface methods missing.
* Add `WebWebViewWidgetCreationParams` so the Web platform matches the platform-specific widget creation params pattern of the other federated packages.

## 1.1.2

* Align `WebViewCookieManager.getCookies({required Uri domain})` with the upstream `webview_flutter` public API.

## 1.1.1

* Switch the example to use the `abutil` package for platform checks.
* Simplify the OHOS and Web platform branches in the example app.
* Sync the platform packages' license files with the main package's license text.

## 1.1.0

* Add OpenHarmony platform implementation support.
* Improve cookie API coverage:
  * Add a common `WebViewCookieManager.getCookies({required Uri domain})` API in the main plugin wrapper.
  * Implement and verify cross-platform cookie reading for each federated platform package.
  * Add a Windows WebView2 platform-specific API with full cookie metadata and deletion flow.
* Strengthen the Web platform implementation:
  * Keep the logical `currentUrl()` for `loadHtmlString` and XHR-based `loadRequest`, avoiding exposing internal `data:` iframe URLs to users.
  * Resolve assets against the Flutter Web-generated `assets/` directory and correctly encode asset path fragments.
  * XHR-based load failures are now reported via `onWebResourceError`, and unsupported custom user-agent overrides are no longer falsely reported as applied.
  * Validate and encode browser-visible cookies before writing `document.cookie`, and document iframe/browser cookie limits.
* Improve the Linux platform implementation:
  * Fix native WebView visibility sync; stable Flutter frames no longer collapse the GTK/WebKit view to `0x0`.
  * Strengthen input validation for Linux frame, cookie, and JavaScript channels, avoiding illegal native state and unsafe script injection.
* The changelogs of the platform sub-packages are unified with the `webview_all` changelog.
* Unify version numbers across the main plugin and platform sub-plugins.

## 1.0.3

* Documentation update.
* Dependency update.

## 1.0.2

* Documentation update.

## 1.0.1

* Documentation update.

## 1.0.0

* Add Linux support.

## 0.9.3

* Bug fixes.

## 0.9.2

* Bug fixes.

## 0.9.1

* Refactor: includes breaking changes.

## 0.5.3

* Update dependencies.
  * Fix the issue caused by unimplemented `opaque` on macOS.

## 0.5.2

* Documentation update.

## 0.5.1

* Major dependency update.
* Bug fixes.

## 0.4.5

* Dependency update.
* Bug fixes.

## 0.4.3

* Dependency update.

## 0.4.1

* Refactor.

## 0.3.7

* Dependency update.

## 0.3.6

* Documentation update.

## 0.3.5

* Documentation update.

## 0.3.4

* Documentation update.

## 0.3.3

* Documentation update.

## 0.3.1

* Fix Web-related issues.

## 0.2.4

* Dependency update.

## 0.2.3

* Documentation update.

## 0.2.2

* Fix Web-related issues.

## 0.2.1

* First successful run.

## 0.1.3

* Bug fixes.

## 0.1.2

* Bug fixes.

## 0.1.1

* The story begins.
