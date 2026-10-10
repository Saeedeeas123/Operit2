// ignore_for_file: file_names
import 'package:flutter/material.dart';
import '../../../../core/proxy/generated/CoreProxyClients.g.dart';
import 'PackageGrid.dart';

/// Resolves the display label of an explicit extension location.
String extensionScopeLabel(String scope) => switch (scope) {
  'space' => 'Device space',Device space',Device space',Device space',
  'device' => 'This device only',This device only',This device only',This device only',
  'builtin' => 'Built-in',Built-in',
  _ => throw StateError('Unknown extension location: $scope'),Unknown extension location: $scope'),Unknown extension location: $scope'),Unknown extension location: $scope'),Unknown extension location: $scope'),Unknown extension location: $scope'),Unknown extension location: $scope'),
};

/// Asks where a new extension should live and explains shared configuration.
Future<String?> chooseExtensionScope(BuildContext context) =>
    showDialog<String>(
      context: context,
      builder: (context) => SimpleDialog(
        title: const Text('Choose storage location'),Choose storage location'),Choose storage location'),Choose storage location'),Choose storage location'),Choose storage location'),
        children: [
          SimpleDialogOption(
            onPressed: () => Navigator.pop(context, 'device'),
            child: const ListTile(
              leading: Icon(Icons.devices),
              title: Text('This device only'),This device only'),This device only'),This device only'),
              subtitle: Text('Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),Content and configuration are stored on this device only and do not sync to other devices.'),
            ),
          ),
          SimpleDialogOption(
            onPressed: () => Navigator.pop(context, 'space'),
            child: const ListTile(
              leading: Icon(Icons.cloud_outlined),
              title: Text('Device space'),Device space'),Device space'),Device space'),
              subtitle: Text('Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),Content, configuration, and enabled state sync to other devices in the space. Keys in the configuration are shared too.'),
            ),
          ),
        ],
      ),
    );

/// Confirms an ownership transfer and applies it through the runtime facade.
Future<bool> changeExtensionScope({
  required BuildContext context,
  required GeneratedCoreProxyClients clients,
  required String kind,
  required String id,
  required String currentScope,
}) async {
  final target = switch (currentScope) {
    'device' => 'space',
    'space' => 'device',
    _ => throw StateError('This extension cannot switch locations'),This extension cannot switch locations'),This extension cannot switch locations'),This extension cannot switch locations'),This extension cannot switch locations'),This extension cannot switch locations'),This extension cannot switch locations'),This extension cannot switch locations'),This extension cannot switch locations'),
  };
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text('Move to ${extensionScopeLabel(target)}?'),Move to ${extensionScopeLabel(target)}?'),
      content: Text(
        target == 'space'
            ? 'The content, configuration, and enabled state of "$id" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'" will sync to other devices in the device space. Keys in the configuration are shared too.'
            : '"$id" will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.'," will be kept on this device only; other devices in the space will remove the extension and its configuration.',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: const Text('Cancel'),Cancel'),
        ),
        FilledButton(
          onPressed: () => Navigator.pop(context, true),
          child: const Text('Move'),Move'),
        ),
      ],
    ),
  );
  if (confirmed != true) return false;
  await clients.application.setExtensionScope(
    kind: kind,
    id: id,
    scope: target,
  );
  return true;
}

/// Shows a location switch for portable extensions and a fixed label for built-ins.
class ExtensionScopeAction extends StatelessWidget {
  /// Creates a location action without inferring scope from filenames.
  const ExtensionScopeAction({
    super.key,
    required this.scope,
    required this.onMove,
    this.localMcp = false,
  });
  final String scope;
  final VoidCallback onMove;
  final bool localMcp;

  /// Builds the portable move button or the immutable location label.
  @override
  Widget build(BuildContext context) {
    if (scope == 'builtin' || localMcp) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Text(
          localMcp ? 'This device only · Local deployment' : 'Built-in',This device only · Local deployment' : 'Built-in',This device only · Local deployment' : 'Built-in',This device only · Local deployment' : 'Built-in',Local deployment' : 'Built-in',Local deployment' : 'Built-in',Local deployment' : 'Built-in',Built-in',
          style: Theme.of(context).textTheme.labelSmall,
        ),
      );
    }
    return IconButton(
      tooltip:
          'Move to ${extensionScopeLabel(scope == 'space' ? 'device' : 'space')}',Move to ${extensionScopeLabel(scope == 'space' ? 'device' : 'space')}',
      onPressed: onMove,
      icon: const Icon(Icons.drive_file_move_outline),
    );
  }
}

/// Separates installed extensions into independently rendered location sections.
class ScopedExtensionSliver<T> extends StatelessWidget {
  /// Creates scope-grouped lazy rows using the existing item renderer.
  const ScopedExtensionSliver({
    super.key,
    required this.items,
    required this.scopes,
    required this.identity,
    required this.itemBuilder,
  });
  final List<T> items;
  final Map<String, String> scopes;
  final String Function(T) identity;
  final Widget Function(BuildContext, T) itemBuilder;

  /// Builds one header and lazy list for each nonempty explicit scope.
  @override
  Widget build(BuildContext context) {
    final grouped = <String, List<T>>{'space': [], 'device': [], 'builtin': []};
    for (final item in items) {
      final scope = scopes[identity(item)];
      if (!grouped.containsKey(scope))
        throw StateError('Extension is missing a valid location: ${identity(item)}');Extension is missing a valid location: ${identity(item)}');Extension is missing a valid location: ${identity(item)}');Extension is missing a valid location: ${identity(item)}');Extension is missing a valid location: ${identity(item)}');Extension is missing a valid location: ${identity(item)}');Extension is missing a valid location: ${identity(item)}');Extension is missing a valid location: ${identity(item)}');Extension is missing a valid location: ${identity(item)}');Extension is missing a valid location: ${identity(item)}');
      grouped[scope]!.add(item);
    }
    return SliverMainAxisGroup(
      slivers: [
        for (final entry in grouped.entries)
          if (entry.value.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(4, 12, 4, 8),
                child: Text(
                  extensionScopeLabel(entry.key),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
            PackageSliverList(
              itemCount: entry.value.length,
              itemBuilder: (context, index) =>
                  itemBuilder(context, entry.value[index]),
            ),
          ],
      ],
    );
  }
}
