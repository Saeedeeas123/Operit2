# operit_folder_access

Unified entry point for the main app's directory selection (single and multi-select):

```dart
final folder = await OperitFolderAccess.pickDirectory();
final folders = await OperitFolderAccess.pickDirectories();
```

Both support `initialDirectory`. Cancellations return `null` and an empty list respectively; permission or unsupported-platform errors propagate to the caller and are not disguised as cancellations.

- macOS: the Flutter plugin registration selects this package's native implementation; NSOpenPanel selects directories, and the native process-level FolderAccessStore saves and restores security-scoped bookmarks. Multi-select grants authorization one by one; if any item fails, no partially successful path list is returned (previously saved authorizations are kept).
- Other platforms: this package internally delegates to file_selector; capability depends on the corresponding platform implementation; the unified API does not mean every platform supports multi-select directories.
- The main app does not branch on the operating system or distribution channel and does not call file_selector's directory APIs directly. Ordinary file open/save are outside this package's scope.
- Returned values keep the underlying path/URI, are not VFS-path mapped, and do not imply the remote host owns that path or has that permission.

Currently targets macOS apps with App Sandbox enabled. Signing and entitlement policy live in the native layer; the main app is not required to add a platform branch if it later ships a non-sandboxed distribution. Re-registering the plugin does not re-open an already restored scope; when a bookmark points to a moved directory, the old configured path is not treated as authorized and must be re-selected.

The macOS host must keep App Sandbox and enable the user-selected read/write and app-scope bookmarks entitlements. Authorization restoration under a real signing sandbox requires on-device testing; Dart channel tests cannot substitute for it.
