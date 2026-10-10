// ignore_for_file: file_names

import 'dart:convert';
import 'dart:typed_data';

import 'package:file_selector/file_selector.dart';
import 'package:flutter/material.dart';

import '../../../../core/bridge/OperitRuntimeBridge.dart';
import '../../../../core/host/FileSaveService.dart';
import '../../../../core/proxy/generated/CoreProxyClients.g.dart';
import '../../../../core/proxy/generated/CoreProxyModels.g.dart' as core_proxy;
import '../../../../l10n/generated/app_localizations.dart';
import '../../../common/components/M3LoadingIndicator.dart';
import '../../../common/components/OperitDialog.dart';
import '../../../theme/OperitFormStyles.dart';
import '../memory/MemoryOwnerControlsDialog.dart';
import 'MemoryGraphCanvas.dart';

const XTypeGroup _memoryJsonFileTypeGroup = XTypeGroup(
  label: 'Operit memory JSON',
  extensions: <String>['json'],
);

class MemoryGraphScreen extends StatefulWidget {
  /// Creates the owner-scoped memory management graph page.
  const MemoryGraphScreen({
    super.key,
    required this.bridge,
    required this.ownerKey,
    required this.ownerName,
  });

  final OperitRuntimeBridge bridge;
  final String ownerKey;
  final String ownerName;

  /// Opens the owner-scoped memory graph page.
  static Future<void> open({
    required BuildContext context,
    required OperitRuntimeBridge bridge,
    required String ownerKey,
    required String ownerName,
  }) {
    return Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (context) => MemoryGraphScreen(
          bridge: bridge,
          ownerKey: ownerKey,
          ownerName: ownerName,
        ),
      ),
    );
  }

  /// Creates the state for the owner-scoped memory graph page.
  @override
  State<MemoryGraphScreen> createState() => _MemoryGraphScreenState();
}

class _MemoryGraphScreenState extends State<MemoryGraphScreen> {
  late Future<_MemoryGraphData> _future;
  final TextEditingController _searchController = TextEditingController();
  String? _selectedNodeId;
  int? _selectedEdgeId;
  Future<core_proxy.Memory?>? _selectedMemoryFuture;
  String _folderPath = '';
  bool _busy = false;
  bool _linkMode = false;
  String? _linkSourceNodeId;
  late final GeneratedCoreProxyClients _clients = GeneratedCoreProxyClients(
    widget.bridge,
  );

  /// Returns the repository proxy scoped to the current owner key.
  GeneratedRepositoryMemoryRepositoryCoreProxy get _repository =>
      _clients.repositoryMemoryRepositoryForOwner(widget.ownerKey);

  /// Initializes the page by loading graph data.
  @override
  void initState() {
    super.initState();
    _future = _loadData();
  }

  /// Releases text editing resources.
  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  /// Loads graph, folder, and current filter data.
  Future<_MemoryGraphData> _loadData() async {
    final repository = _repository;
    final graph = await repository.getMemoryGraph();
    final folders = await repository.getAllFolderPaths();
    final query = _searchController.text.trim();
    final activeFolder = _folderPath.trim();
    List<core_proxy.Memory> scopedMemories = <core_proxy.Memory>[];
    core_proxy.MemoryGraph displayGraph = graph;
    if (query.isNotEmpty) {
      scopedMemories = await repository.searchMemories(
        query: query,
        folderPath: null,
        relevanceThreshold: 0.0,
        createdAtStartMs: null,
        createdAtEndMs: null,
      );
      if (activeFolder.isNotEmpty) {
        scopedMemories = scopedMemories
            .where(
              (memory) =>
                  _matchesFolderTree(memory.folderPath ?? '', activeFolder),
            )
            .toList(growable: false);
      }
      displayGraph = _graphAroundMemoryIds(
        graph,
        scopedMemories.map((memory) => memory.uuid).toSet(),
      );
    } else if (activeFolder.isNotEmpty) {
      scopedMemories = await _loadFolderTreeMemories(folders, activeFolder);
      displayGraph = _graphForMemoryIds(
        graph,
        scopedMemories.map((memory) => memory.uuid).toSet(),
      );
    }
    return _MemoryGraphData(
      fullGraph: graph,
      displayGraph: displayGraph,
      folders: folders,
      scopedMemoryByUuid: <String, core_proxy.Memory>{
        for (final memory in scopedMemories) memory.uuid: memory,
      },
      query: query,
      folderPath: activeFolder,
    );
  }

  /// Loads memories from a folder and its visible child folders.
  Future<List<core_proxy.Memory>> _loadFolderTreeMemories(
    List<String> folders,
    String folderPath,
  ) async {
    final targetFolders = _folderAndChildren(folders, folderPath);
    final memoriesByUuid = <String, core_proxy.Memory>{};
    for (final targetFolder in targetFolders) {
      final memories = await _repository.getMemoriesByFolderPath(
        folderPath: targetFolder,
      );
      for (final memory in memories) {
        memoriesByUuid[memory.uuid] = memory;
      }
    }
    return memoriesByUuid.values.toList(growable: false);
  }

  /// Reloads data and clears transient graph selection.
  void _reload() {
    setState(() {
      _future = _loadData();
      _selectedNodeId = null;
      _selectedEdgeId = null;
      _selectedMemoryFuture = null;
      _linkSourceNodeId = null;
    });
  }

  /// Refreshes the current data without changing filters.
  Future<void> _refresh() async {
    _reload();
  }

  /// Runs the current search text.
  void _runSearch() {
    _reload();
  }

  /// Clears the search box and reloads the graph.
  void _clearSearch() {
    _searchController.clear();
    _reload();
  }

  /// Selects a folder path and reloads the graph.
  void _selectFolder(String folderPath) {
    setState(() {
      _folderPath = folderPath;
      _future = _loadData();
      _selectedNodeId = null;
      _selectedEdgeId = null;
      _selectedMemoryFuture = null;
      _linkSourceNodeId = null;
    });
  }

  /// Selects a graph node or advances link mode.
  void _selectNode(core_proxy.MemoryGraphNode node, _MemoryGraphData data) {
    if (_linkMode) {
      _selectNodeForLink(node, data);
      return;
    }
    setState(() {
      _selectedNodeId = node.id;
      _selectedEdgeId = null;
      _selectedMemoryFuture = _memoryForNode(node, data);
    });
  }

  /// Selects source and target nodes for a new link.
  void _selectNodeForLink(
    core_proxy.MemoryGraphNode node,
    _MemoryGraphData data,
  ) {
    final sourceNodeId = _linkSourceNodeId;
    if (sourceNodeId == null) {
      setState(() {
        _linkSourceNodeId = node.id;
        _selectedNodeId = node.id;
        _selectedEdgeId = null;
        _selectedMemoryFuture = _memoryForNode(node, data);
      });
      return;
    }
    if (sourceNodeId == node.id) {
      return;
    }
    final sourceNode = data.displayGraph.nodes
        .where((candidate) => candidate.id == sourceNodeId)
        .firstOrNull;
    if (sourceNode == null) {
      setState(() {
        _linkSourceNodeId = null;
      });
      return;
    }
    _createLink(sourceNode, node, data);
  }

  /// Looks up full memory data for a graph node.
  Future<core_proxy.Memory?> _memoryForNode(
    core_proxy.MemoryGraphNode node,
    _MemoryGraphData data,
  ) async {
    final scopedMemory = data.scopedMemoryByUuid[node.id];
    if (scopedMemory != null) {
      return scopedMemory;
    }
    final memories = await _repository.findMemoriesByTitle(title: node.label);
    return memories.where((memory) => memory.uuid == node.id).firstOrNull;
  }

  /// Creates a memory link between two graph nodes.
  Future<void> _createLink(
    core_proxy.MemoryGraphNode sourceNode,
    core_proxy.MemoryGraphNode targetNode,
    _MemoryGraphData data,
  ) async {
    final sourceMemory = await _memoryForNode(sourceNode, data);
    final targetMemory = await _memoryForNode(targetNode, data);
    if (!mounted) {
      return;
    }
    if (sourceMemory == null || targetMemory == null) {
      _showSnack('Cannot locate memory node');
      return;
    }
    final edited = await _MemoryLinkEditorDialog.show(
      context: context,
      sourceTitle: sourceMemory.title,
      targetTitle: targetMemory.title,
    );
    if (edited == null) {
      setState(() {
        _linkSourceNodeId = null;
      });
      return;
    }
    setState(() => _busy = true);
    try {
      await _repository.linkMemories(
        sourceMemoryId: sourceMemory.id,
        targetMemoryId: targetMemory.id,
        type: edited.type,
        weight: edited.weight,
        description: edited.description,
      );
      if (!mounted) {
        return;
      }
      _showSnack('Memory link created');
      setState(() {
        _linkSourceNodeId = null;
        _future = _loadData();
      });
    } catch (error) {
      if (mounted) {
        _showSnack('Failed to create link: $error');
      }
    } finally {
      if (mounted) {
        setState(() => _busy = false);
      }
    }
  }

  /// Opens the memory editor for creating a new memory.
  Future<void> _createMemory() async {
    final data = await _future;
    if (!mounted) {
      return;
    }
    final edited = await _MemoryEditorDialog.show(
      context: context,
      folders: data.folders,
      initialFolderPath: _folderPath,
    );
    if (edited == null) {
      return;
    }
    setState(() => _busy = true);
    try {
      await _repository.createMemory(
        title: edited.title,
        content: edited.content,
        contentType: edited.contentType,
        source: edited.source,
        folderPath: edited.folderPath,
        tags: edited.tags,
      );
      if (!mounted) {
        return;
      }
      _showSnack('Memory created');
      _reload();
    } catch (error) {
      if (mounted) {
        _showSnack('Failed to create memory: $error');
      }
    } finally {
      if (mounted) {
        setState(() => _busy = false);
      }
    }
  }

  /// Opens the memory editor for an existing memory.
  Future<void> _editMemory(
    core_proxy.Memory memory,
    List<String> folders,
  ) async {
    final edited = await _MemoryEditorDialog.show(
      context: context,
      memory: memory,
      folders: folders,
      initialFolderPath: memory.folderPath ?? '',
    );
    if (edited == null) {
      return;
    }
    setState(() => _busy = true);
    try {
      await _repository.updateMemory(
        memoryId: memory.id,
        newTitle: edited.title,
        newContent: edited.content,
        newContentType: edited.contentType,
        newSource: edited.source,
        newCredibility: edited.credibility,
        newImportance: edited.importance,
        newFolderPath: edited.folderPath,
        newTags: edited.tags,
      );
      if (!mounted) {
        return;
      }
      _showSnack('Memory saved');
      _reload();
    } catch (error) {
      if (mounted) {
        _showSnack('Failed to save memory: $error');
      }
    } finally {
      if (mounted) {
        setState(() => _busy = false);
      }
    }
  }

  /// Deletes a memory after user confirmation.
  Future<void> _deleteMemory(core_proxy.Memory memory) async {
    final confirmed = await _confirm(
      title: 'Delete memory',
      message: 'Delete "${memory.title}"? Related links will also be removed.',
      confirmLabel: 'Delete',
    );
    if (!confirmed) {
      return;
    }
    setState(() => _busy = true);
    try {
      await _repository.deleteMemory(memoryId: memory.id);
      if (!mounted) {
        return;
      }
      _showSnack('Memory deleted');
      _reload();
    } catch (error) {
      if (mounted) {
        _showSnack('Failed to delete memory: $error');
      }
    } finally {
      if (mounted) {
        setState(() => _busy = false);
      }
    }
  }

  /// Deletes a memory link after user confirmation.
  Future<void> _deleteEdge(core_proxy.MemoryGraphEdge edge) async {
    final confirmed = await _confirm(
      title: 'Delete link',
      message: 'Delete this memory link?',
      confirmLabel: 'Delete',
    );
    if (!confirmed) {
      return;
    }
    setState(() => _busy = true);
    try {
      await _repository.deleteLink(linkId: edge.id);
      if (!mounted) {
        return;
      }
      _showSnack('Memory link deleted');
      _reload();
    } catch (error) {
      if (mounted) {
        _showSnack('Failed to delete link: $error');
      }
    } finally {
      if (mounted) {
        setState(() => _busy = false);
      }
    }
  }

  /// Exports memory JSON to a user-selected file.
  Future<void> _exportJson() async {
    final suggestedName =
        'operit-memory-${DateTime.now().millisecondsSinceEpoch}.json';
    setState(() => _busy = true);
    try {
      final jsonText = await _repository.exportMemoriesToJson();
      final savedPath = await FileSaveService.saveBytes(
        bytes: Uint8List.fromList(utf8.encode(jsonText)),
        name: suggestedName,
        mimeType: 'application/json',
        acceptedTypeGroups: const <XTypeGroup>[_memoryJsonFileTypeGroup],
      );
      if (savedPath == null) {
        return;
      }
      if (mounted) {
        _showSnack('Exported to $savedPath');
      }
    } catch (error) {
      if (mounted) {
        _showSnack('Export failed: $error');
      }
    } finally {
      if (mounted) {
        setState(() => _busy = false);
      }
    }
  }

  /// Imports memory JSON from a user-selected file.
  Future<void> _importJson() async {
    final file = await openFile(
      acceptedTypeGroups: const <XTypeGroup>[_memoryJsonFileTypeGroup],
    );
    if (file == null) {
      return;
    }
    if (!mounted) {
      return;
    }
    final strategy = await _ImportStrategyDialog.show(context: context);
    if (strategy == null) {
      return;
    }
    setState(() => _busy = true);
    try {
      final jsonText = await file.readAsString();
      final result = await _repository.importMemoriesFromJson(
        jsonString: jsonText,
        strategy: strategy,
      );
      if (!mounted) {
        return;
      }
      _showSnack(
        'Import finished: ${result.newMemories} added, ${result.updatedMemories} updated, ${result.skippedMemories} skipped, ${result.newLinks} links',
      );
      _reload();
    } catch (error) {
      if (mounted) {
        _showSnack('Import failed: $error');
      }
    } finally {
      if (mounted) {
        setState(() => _busy = false);
      }
    }
  }

  /// Toggles graph link creation mode.
  void _toggleLinkMode() {
    setState(() {
      _linkMode = !_linkMode;
      _linkSourceNodeId = null;
    });
  }

  /// Shows a confirmation dialog.
  Future<bool> _confirm({
    required String title,
    required String message,
    required String confirmLabel,
  }) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => OperitDialogScaffold(
        title: title,
        maxWidth: 420,
        showCloseButton: true,
        actions: <Widget>[
          IconButton(
            tooltip: 'Import text/Markdown document',
            onPressed: _busy ? null : _importDocument,
            icon: const Icon(Icons.article_outlined),
          ),
          IconButton(
            tooltip: 'AI-categorize unclassified memories',
            onPressed: _busy ? null : _autoCategorize,
            icon: const Icon(Icons.auto_awesome),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(confirmLabel),
          ),
        ],
        child: Text(message),
      ),
    );
    return result == true;
  }

  /// Shows a short status message.
  void _showSnack(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  /// Opens the folder filter picker dialog.
  Future<void> _openFolderPickerDialog(List<String> folders) async {
    final selected = await showDialog<String>(
      context: context,
      builder: (context) => OperitDialogScaffold(
        title: 'Select memory folder',
        maxWidth: 420,
        maxHeight: 520,
        showCloseButton: true,
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
        ],
        child: SizedBox(
          height: 360,
          child: _MemoryFolderPanel(
            folders: folders,
            selectedFolderPath: _folderPath,
            onSelected: (folder) => Navigator.of(context).pop(folder),
          ),
        ),
      ),
    );
    if (selected != null) {
      _selectFolder(selected);
    }
  }

  Future<void> _importDocument() async {
    final file = await openFile(
      acceptedTypeGroups: [
        const XTypeGroup(
          label: 'Text document',
          extensions: ['txt', 'md', 'markdown', 'csv', 'log'],
        ),
      ],
    );
    if (file == null || !mounted) return;
    setState(() => _busy = true);
    try {
      final text = utf8.decode(await file.readAsBytes());
      await _repository.createMemoryFromDocument(
        documentName: file.name,
        originalPath: file.path,
        text: text,
        folderPath: _folderPath,
      );
      if (mounted) {
        _refresh();
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Document chunked and stored')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Document import failed: $error')));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _autoCategorize() async {
    setState(() => _busy = true);
    try {
      final count = await _clients.application
          .memoryManagementService(ownerKey: widget.ownerKey)
          .autoCategorize();
      if (mounted) {
        _refresh();
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Categorized $count memories')));
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Auto-categorization: $error')));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  /// Builds the page scaffold and graph canvas.
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.settingsCharactersMemoryGraphTitle(widget.ownerName)),
        leading: IconButton(
          tooltip: l10n.close,
          onPressed: () => Navigator.of(context).pop(),
          icon: const Icon(Icons.close),
        ),
        actions: <Widget>[
          IconButton(
            tooltip: 'Memory settings',
            icon: const Icon(Icons.tune),
            onPressed: _busy
                ? null
                : () async {
                    await MemoryOwnerControlsDialog.open(
                      context,
                      _clients,
                      widget.ownerKey,
                    );
                    if (mounted) _refresh();
                  },
          ),
          IconButton(
            tooltip: 'Import JSON',
            onPressed: _busy ? null : _importJson,
            icon: const Icon(Icons.upload_file_outlined),
          ),
          IconButton(
            tooltip: 'Export JSON',
            onPressed: _busy ? null : _exportJson,
            icon: const Icon(Icons.download_outlined),
          ),
          IconButton(
            tooltip: l10n.refresh,
            onPressed: _busy ? null : _refresh,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: FutureBuilder<_MemoryGraphData>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            Error.throwWithStackTrace(snapshot.error!, snapshot.stackTrace!);
          }
          final data = snapshot.data;
          if (data == null) {
            return const M3LoadingPane();
          }
          return Column(
            children: <Widget>[
              _MemoryToolbar(
                controller: _searchController,
                busy: _busy,
                linkMode: _linkMode,
                folderPath: _folderPath,
                onSearch: _runSearch,
                onClearSearch: _clearSearch,
                onOpenFolders: () => _openFolderPickerDialog(data.folders),
                onToggleLinkMode: _toggleLinkMode,
                onCreateMemory: _createMemory,
              ),
              if (_busy) const LinearProgressIndicator(minHeight: 2),
              Expanded(child: _buildGraphCanvas(data, colorScheme, textTheme)),
            ],
          );
        },
      ),
    );
  }

  /// Builds the memory graph body below the toolbar.
  Widget _buildGraphCanvas(
    _MemoryGraphData data,
    ColorScheme colorScheme,
    TextTheme textTheme,
  ) {
    final graph = data.displayGraph;
    if (graph.nodes.isEmpty) {
      return _MemoryEmptyState(
        query: data.query,
        folderPath: data.folderPath,
        colorScheme: colorScheme,
        textTheme: textTheme,
      );
    }
    final selectedNode = graph.nodes
        .where((node) => node.id == _selectedNodeId)
        .firstOrNull;
    final selectedEdge = graph.edges
        .where((edge) => edge.id == _selectedEdgeId)
        .firstOrNull;
    return Stack(
      fit: StackFit.expand,
      children: <Widget>[
        MemoryGraphCanvas(
          key: ValueKey('${data.query}:${data.folderPath}'),
          graph: graph,
          selectedNodeId: _selectedNodeId,
          selectedEdgeId: _selectedEdgeId,
          linkSourceNodeId: _linkSourceNodeId,
          onSelect: (node, edge) {
            if (node != null) {
              _selectNode(node, data);
              return;
            }
            setState(() {
              _selectedNodeId = null;
              _selectedEdgeId = edge?.id;
              _selectedMemoryFuture = null;
            });
          },
        ),
        Positioned(
          left: 16,
          top: 12,
          child: _MemoryGraphCounter(
            text: '${graph.nodes.length} nodes · ${graph.edges.length} links',
          ),
        ),
        if (_linkMode)
          Positioned(
            right: 16,
            top: 12,
            child: _MemoryGraphCounter(
              text: _linkSourceNodeId == null ? 'Link mode: pick the source' : 'Link mode: pick the target',
            ),
          ),
        if (selectedNode != null || selectedEdge != null)
          Positioned(
            left: 16,
            right: 16,
            bottom: 72,
            child: _MemoryGraphSelectionCard(
              node: selectedNode,
              edge: selectedEdge,
              graph: graph,
              memoryFuture: _selectedMemoryFuture,
              folders: data.folders,
              onClose: () {
                setState(() {
                  _selectedNodeId = null;
                  _selectedEdgeId = null;
                  _selectedMemoryFuture = null;
                });
              },
              onEditMemory: _editMemory,
              onDeleteMemory: _deleteMemory,
              onDeleteEdge: _deleteEdge,
            ),
          ),
      ],
    );
  }
}

class _MemoryGraphData {
  /// Creates immutable graph data for the current filters.
  const _MemoryGraphData({
    required this.fullGraph,
    required this.displayGraph,
    required this.folders,
    required this.scopedMemoryByUuid,
    required this.query,
    required this.folderPath,
  });

  final core_proxy.MemoryGraph fullGraph;
  final core_proxy.MemoryGraph displayGraph;
  final List<String> folders;
  final Map<String, core_proxy.Memory> scopedMemoryByUuid;
  final String query;
  final String folderPath;
}

class _MemoryToolbar extends StatelessWidget {
  /// Creates the memory graph search and action toolbar.
  const _MemoryToolbar({
    required this.controller,
    required this.busy,
    required this.linkMode,
    required this.folderPath,
    required this.onSearch,
    required this.onClearSearch,
    required this.onOpenFolders,
    required this.onToggleLinkMode,
    required this.onCreateMemory,
  });

  final TextEditingController controller;
  final bool busy;
  final bool linkMode;
  final String folderPath;
  final VoidCallback onSearch;
  final VoidCallback onClearSearch;
  final VoidCallback onOpenFolders;
  final VoidCallback onToggleLinkMode;
  final VoidCallback onCreateMemory;

  /// Builds a search-first toolbar with fixed-width, labeled icon actions.
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final folderLabel = folderPath.isEmpty ? 'All folders' : folderPath;
    final actionStyle = IconButton.styleFrom(
      minimumSize: const Size(40, 40),
      maximumSize: const Size(40, 40),
      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    );
    return Material(
      color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.32),
      child: Container(
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: colorScheme.outlineVariant.withValues(alpha: 0.2),
            ),
          ),
        ),
        padding: const EdgeInsets.fromLTRB(14, 8, 14, 8),
        child: Row(
          children: <Widget>[
            Expanded(
              child: Tooltip(
                message: 'Search titles, content, sources, or tags',
                child: SizedBox(
                  height: 40,
                  child: TextField(
                    controller: controller,
                    enabled: !busy,
                    textInputAction: TextInputAction.search,
                    onSubmitted: (_) => onSearch(),
                    style: Theme.of(context).textTheme.bodySmall,
                    decoration: InputDecoration(
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 8,
                      ),
                      prefixIcon: const Icon(Icons.search, size: 18),
                      prefixIconConstraints: const BoxConstraints(minWidth: 36),
                      suffixIconConstraints: const BoxConstraints(minWidth: 32),
                      suffixIcon: controller.text.isEmpty
                          ? null
                          : IconButton(
                              tooltip: 'Clear',
                              padding: EdgeInsets.zero,
                              iconSize: 16,
                              onPressed: busy ? null : onClearSearch,
                              icon: const Icon(Icons.clear),
                            ),
                      hintText: 'Search memories',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color: colorScheme.outlineVariant.withValues(
                            alpha: 0.3,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            IconButton.outlined(
              tooltip: folderLabel,
              onPressed: busy ? null : onOpenFolders,
              style: actionStyle.copyWith(
                foregroundColor: WidgetStatePropertyAll(
                  folderPath.isNotEmpty
                      ? colorScheme.primary
                      : colorScheme.onSurface,
                ),
                side: WidgetStatePropertyAll(
                  BorderSide(
                    color: folderPath.isNotEmpty
                        ? colorScheme.primary.withValues(alpha: 0.5)
                        : colorScheme.outlineVariant.withValues(alpha: 0.35),
                  ),
                ),
              ),
              icon: const Icon(Icons.folder_outlined, size: 18),
            ),
            const SizedBox(width: 8),
            IconButton.filledTonal(
              tooltip: 'Link mode',
              onPressed: busy ? null : onToggleLinkMode,
              isSelected: linkMode,
              style: actionStyle,
              icon: const Icon(Icons.link, size: 18),
            ),
            const SizedBox(width: 8),
            IconButton.filled(
              tooltip: 'New memory',
              onPressed: busy ? null : onCreateMemory,
              style: actionStyle,
              icon: const Icon(Icons.add, size: 18),
            ),
          ],
        ),
      ),
    );
  }
}

class _MemoryFolderPanel extends StatelessWidget {
  /// Creates the folder filtering side panel.
  const _MemoryFolderPanel({
    required this.folders,
    required this.selectedFolderPath,
    required this.onSelected,
  });

  final List<String> folders;
  final String selectedFolderPath;
  final ValueChanged<String> onSelected;

  /// Builds the folder list panel.
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final sortedFolders = folders.toList(growable: false)..sort();
    return Material(
      color: colorScheme.surfaceContainerLow,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 12, 8),
            child: Row(
              children: <Widget>[
                Icon(Icons.folder_outlined, color: colorScheme.primary),
                const SizedBox(width: 8),
                Text('Memory folders', style: Theme.of(context).textTheme.titleSmall),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 6),
              children: <Widget>[
                _FolderTile(
                  title: 'All',
                  selected: selectedFolderPath.isEmpty,
                  depth: 0,
                  onTap: () => onSelected(''),
                ),
                for (final folder in sortedFolders)
                  _FolderTile(
                    title: folder,
                    selected: folder == selectedFolderPath,
                    depth: _folderDepth(folder),
                    onTap: () => onSelected(folder),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FolderTile extends StatelessWidget {
  /// Creates a single folder navigation row.
  const _FolderTile({
    required this.title,
    required this.selected,
    required this.depth,
    required this.onTap,
  });

  final String title;
  final bool selected;
  final int depth;
  final VoidCallback onTap;

  /// Builds a folder row.
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final displayTitle = title.isEmpty ? 'Uncategorized' : title.split('/').last;
    return Padding(
      padding: EdgeInsets.only(left: 8.0 + depth * 14.0, right: 8, top: 2),
      child: ListTile(
        dense: true,
        selected: selected,
        selectedTileColor: colorScheme.primaryContainer.withValues(alpha: 0.7),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        leading: Icon(selected ? Icons.folder_open : Icons.folder, size: 20),
        title: Text(displayTitle, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: depth == 0 && title == displayTitle ? null : Text(title),
        onTap: onTap,
      ),
    );
  }
}

class _MemoryGraphCounter extends StatelessWidget {
  /// Creates a floating graph status chip.
  const _MemoryGraphCounter({required this.text});

  final String text;

  /// Builds the floating graph status chip.
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Material(
      color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.88),
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        child: Text(
          text,
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
      ),
    );
  }
}

class _MemoryEmptyState extends StatelessWidget {
  /// Creates the empty graph state.
  const _MemoryEmptyState({
    required this.query,
    required this.folderPath,
    required this.colorScheme,
    required this.textTheme,
  });

  final String query;
  final String folderPath;
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  /// Builds the empty graph state.
  @override
  Widget build(BuildContext context) {
    final hasFilter = query.isNotEmpty || folderPath.isNotEmpty;
    return Center(
      child: Text(
        hasFilter ? 'No memory nodes match the current filter' : 'The memory library has no nodes yet',
        style: textTheme.bodyMedium?.copyWith(
          color: colorScheme.onSurfaceVariant,
        ),
      ),
    );
  }
}

class _MemoryGraphSelectionCard extends StatelessWidget {
  /// Creates a selected node or edge details card.
  const _MemoryGraphSelectionCard({
    required this.node,
    required this.edge,
    required this.graph,
    required this.memoryFuture,
    required this.folders,
    required this.onClose,
    required this.onEditMemory,
    required this.onDeleteMemory,
    required this.onDeleteEdge,
  });

  final core_proxy.MemoryGraphNode? node;
  final core_proxy.MemoryGraphEdge? edge;
  final core_proxy.MemoryGraph graph;
  final Future<core_proxy.Memory?>? memoryFuture;
  final List<String> folders;
  final VoidCallback onClose;
  final Future<void> Function(core_proxy.Memory memory, List<String> folders)
  onEditMemory;
  final Future<void> Function(core_proxy.Memory memory) onDeleteMemory;
  final Future<void> Function(core_proxy.MemoryGraphEdge edge) onDeleteEdge;

  /// Builds the selected node or edge details card.
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final colorScheme = Theme.of(context).colorScheme;
    final title =
        node?.label ?? edge?.label ?? l10n.settingsCharactersMemoryGraphLink;
    final subtitle = edge == null
        ? node?.id
        : '${_nodeLabel(edge!.sourceId)}  →  ${_nodeLabel(edge!.targetId)}';
    final radius = BorderRadius.circular(12);
    return Material(
      color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.95),
      shape: RoundedRectangleBorder(
        borderRadius: radius,
        side: BorderSide(
          color: colorScheme.outlineVariant.withValues(alpha: 0.3),
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 8, 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Row(
              children: <Widget>[
                Icon(
                  node == null ? Icons.link : Icons.circle_outlined,
                  size: 20,
                  color: colorScheme.primary,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      if (subtitle != null) ...<Widget>[
                        const SizedBox(height: 3),
                        Text(
                          subtitle,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(color: colorScheme.onSurfaceVariant),
                        ),
                      ],
                    ],
                  ),
                ),
                IconButton(
                  tooltip: l10n.close,
                  onPressed: onClose,
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            if (memoryFuture != null)
              FutureBuilder<core_proxy.Memory?>(
                future: memoryFuture,
                builder: (context, snapshot) {
                  final memory = snapshot.data;
                  if (snapshot.connectionState != ConnectionState.done) {
                    return const Padding(
                      padding: EdgeInsets.only(top: 10),
                      child: LinearProgressIndicator(minHeight: 2),
                    );
                  }
                  if (memory == null) {
                    return const Padding(
                      padding: EdgeInsets.only(top: 8),
                      child: Text('Full memory content not available'),
                    );
                  }
                  return _MemoryDetailsBlock(
                    memory: memory,
                    folders: folders,
                    onEditMemory: onEditMemory,
                    onDeleteMemory: onDeleteMemory,
                  );
                },
              ),
            if (edge != null)
              Align(
                alignment: Alignment.centerRight,
                child: TextButton.icon(
                  onPressed: () => onDeleteEdge(edge!),
                  icon: const Icon(Icons.delete_outline),
                  label: const Text('Delete link'),
                ),
              ),
          ],
        ),
      ),
    );
  }

  /// Returns a display label for a node id.
  String _nodeLabel(String nodeId) {
    return graph.nodes
        .where((candidate) => candidate.id == nodeId)
        .map((candidate) => candidate.label)
        .firstOrNull!;
  }
}

class _MemoryDetailsBlock extends StatelessWidget {
  /// Creates the selected memory detail block.
  const _MemoryDetailsBlock({
    required this.memory,
    required this.folders,
    required this.onEditMemory,
    required this.onDeleteMemory,
  });

  final core_proxy.Memory memory;
  final List<String> folders;
  final Future<void> Function(core_proxy.Memory memory, List<String> folders)
  onEditMemory;
  final Future<void> Function(core_proxy.Memory memory) onDeleteMemory;

  /// Builds memory details and management actions.
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: <Widget>[
              _InfoChip(
                label: 'Folder',
                value: _folderLabel(memory.folderPath ?? ''),
              ),
              _InfoChip(label: 'Source', value: memory.source),
              _InfoChip(
                label: 'Trust',
                value: memory.credibility.toStringAsFixed(2),
              ),
              _InfoChip(
                label: 'Importance',
                value: memory.importance.toStringAsFixed(2),
              ),
              _InfoChip(label: 'Updated', value: _formatMillis(memory.updatedAt)),
            ],
          ),
          if (memory.tags.isNotEmpty) ...<Widget>[
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: <Widget>[
                for (final tag in memory.tags)
                  Chip(
                    label: Text(tag.name),
                    visualDensity: VisualDensity.compact,
                  ),
              ],
            ),
          ],
          const SizedBox(height: 8),
          Container(
            constraints: const BoxConstraints(maxHeight: 120),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: colorScheme.surface.withValues(alpha: 0.58),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: colorScheme.outlineVariant),
            ),
            child: SingleChildScrollView(
              child: SelectableText(
                memory.content,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: <Widget>[
              TextButton.icon(
                onPressed: () => onEditMemory(memory, folders),
                icon: const Icon(Icons.edit_outlined),
                label: const Text('Edit'),
              ),
              const SizedBox(width: 6),
              TextButton.icon(
                onPressed: () => onDeleteMemory(memory),
                icon: const Icon(Icons.delete_outline),
                label: const Text('Delete'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  /// Creates a small label-value chip.
  const _InfoChip({required this.label, required this.value});

  final String label;
  final String value;

  /// Builds the label-value chip.
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: Text(
        '$label: $value',
        style: Theme.of(context).textTheme.labelSmall,
      ),
    );
  }
}

class _MemoryEditorResult {
  /// Creates a memory editor result payload.
  const _MemoryEditorResult({
    required this.title,
    required this.content,
    required this.contentType,
    required this.source,
    required this.folderPath,
    required this.tags,
    required this.credibility,
    required this.importance,
  });

  final String title;
  final String content;
  final String contentType;
  final String source;
  final String folderPath;
  final List<String> tags;
  final double credibility;
  final double importance;
}

class _MemoryEditorDialog extends StatefulWidget {
  /// Creates a memory editor dialog.
  const _MemoryEditorDialog({
    this.memory,
    required this.folders,
    required this.initialFolderPath,
  });

  final core_proxy.Memory? memory;
  final List<String> folders;
  final String initialFolderPath;

  /// Shows a memory editor dialog.
  static Future<_MemoryEditorResult?> show({
    required BuildContext context,
    core_proxy.Memory? memory,
    required List<String> folders,
    required String initialFolderPath,
  }) {
    return showDialog<_MemoryEditorResult>(
      context: context,
      builder: (context) => _MemoryEditorDialog(
        memory: memory,
        folders: folders,
        initialFolderPath: initialFolderPath,
      ),
    );
  }

  /// Creates state for the memory editor dialog.
  @override
  State<_MemoryEditorDialog> createState() => _MemoryEditorDialogState();
}

class _MemoryEditorDialogState extends State<_MemoryEditorDialog> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  late final TextEditingController _titleController;
  late final TextEditingController _contentController;
  late final TextEditingController _contentTypeController;
  late final TextEditingController _sourceController;
  late final TextEditingController _folderController;
  late final TextEditingController _tagsController;
  late double _credibility;
  late double _importance;

  /// Initializes text controllers from the edited memory.
  @override
  void initState() {
    super.initState();
    final memory = widget.memory;
    _titleController = TextEditingController(text: memory?.title ?? '');
    _contentController = TextEditingController(text: memory?.content ?? '');
    _contentTypeController = TextEditingController(
      text: memory?.contentType ?? 'text/plain',
    );
    _sourceController = TextEditingController(text: memory?.source ?? 'manual');
    _folderController = TextEditingController(
      text: memory?.folderPath ?? widget.initialFolderPath,
    );
    _tagsController = TextEditingController(
      text: memory?.tags.map((tag) => tag.name).join(', ') ?? '',
    );
    _credibility = memory?.credibility ?? 0.5;
    _importance = memory?.importance ?? 0.5;
  }

  /// Releases editor text controllers.
  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    _contentTypeController.dispose();
    _sourceController.dispose();
    _folderController.dispose();
    _tagsController.dispose();
    super.dispose();
  }

  /// Saves dialog input into the result payload.
  void _save() {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    final tags = _tagsController.text
        .split(',')
        .map((tag) => tag.trim())
        .where((tag) => tag.isNotEmpty)
        .toList(growable: false);
    Navigator.of(context).pop(
      _MemoryEditorResult(
        title: _titleController.text.trim(),
        content: _contentController.text,
        contentType: _contentTypeController.text.trim(),
        source: _sourceController.text.trim(),
        folderPath: _folderController.text.trim(),
        tags: tags,
        credibility: _credibility,
        importance: _importance,
      ),
    );
  }

  /// Builds the memory editor dialog.
  @override
  Widget build(BuildContext context) {
    final folderOptions = <String>{
      '',
      ...widget.folders,
      _folderController.text,
    }.map((folder) => folder.trim()).toSet().toList(growable: false)..sort();
    return OperitDialogScaffold(
      title: widget.memory == null ? 'New memory' : 'Edit memory',
      maxWidth: 720,
      maxHeight: 680,
      showCloseButton: true,
      actions: <Widget>[
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        FilledButton(onPressed: _save, child: const Text('Save')),
      ],
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(labelText: 'Title'),
                validator: (value) =>
                    value == null || value.trim().isEmpty ? 'Please enter a title' : null,
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _contentController,
                minLines: 8,
                maxLines: 14,
                decoration: const InputDecoration(
                  labelText: 'Content',
                  alignLabelWithHint: true,
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: <Widget>[
                  Expanded(
                    child: TextFormField(
                      controller: _contentTypeController,
                      decoration: const InputDecoration(labelText: 'Content type'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextFormField(
                      controller: _sourceController,
                      decoration: const InputDecoration(labelText: 'Source'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              OperitFormStyles.dropdownButtonFormField<String>(
                context,
                initialValue:
                    folderOptions.contains(_folderController.text.trim())
                    ? _folderController.text.trim()
                    : '',
                items: <DropdownMenuItem<String>>[
                  for (final folder in folderOptions)
                    DropdownMenuItem<String>(
                      value: folder,
                      child: Text(_folderLabel(folder)),
                    ),
                ],
                decoration: const InputDecoration(labelText: 'Folder'),
                onChanged: (value) {
                  if (value == null) {
                    return;
                  }
                  setState(() {
                    _folderController.text = value;
                  });
                },
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _tagsController,
                decoration: const InputDecoration(
                  labelText: 'Tags',
                  helperText: 'Separate multiple tags with commas',
                ),
              ),
              const SizedBox(height: 10),
              _SliderEditor(
                label: 'Trust',
                value: _credibility,
                onChanged: (value) => setState(() => _credibility = value),
              ),
              const SizedBox(height: 10),
              _SliderEditor(
                label: 'Importance',
                value: _importance,
                onChanged: (value) => setState(() => _importance = value),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SliderEditor extends StatelessWidget {
  /// Creates a numeric slider editor.
  const _SliderEditor({
    required this.label,
    required this.value,
    required this.onChanged,
  });

  final String label;
  final double value;
  final ValueChanged<double> onChanged;

  /// Builds the slider editor.
  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        SizedBox(width: 64, child: Text(label)),
        Expanded(
          child: Slider(
            value: value.clamp(0.0, 1.0).toDouble(),
            onChanged: onChanged,
          ),
        ),
        SizedBox(
          width: 42,
          child: Text(value.toStringAsFixed(2), textAlign: TextAlign.end),
        ),
      ],
    );
  }
}

class _MemoryLinkEditorResult {
  /// Creates a memory link editor result payload.
  const _MemoryLinkEditorResult({
    required this.type,
    required this.weight,
    required this.description,
  });

  final String type;
  final double weight;
  final String description;
}

class _MemoryLinkEditorDialog extends StatefulWidget {
  /// Creates a memory link creation dialog.
  const _MemoryLinkEditorDialog({
    required this.sourceTitle,
    required this.targetTitle,
  });

  final String sourceTitle;
  final String targetTitle;

  /// Shows a memory link creation dialog.
  static Future<_MemoryLinkEditorResult?> show({
    required BuildContext context,
    required String sourceTitle,
    required String targetTitle,
  }) {
    return showDialog<_MemoryLinkEditorResult>(
      context: context,
      builder: (context) => _MemoryLinkEditorDialog(
        sourceTitle: sourceTitle,
        targetTitle: targetTitle,
      ),
    );
  }

  /// Creates state for the memory link dialog.
  @override
  State<_MemoryLinkEditorDialog> createState() =>
      _MemoryLinkEditorDialogState();
}

class _MemoryLinkEditorDialogState extends State<_MemoryLinkEditorDialog> {
  final TextEditingController _typeController = TextEditingController(
    text: 'related',
  );
  final TextEditingController _descriptionController = TextEditingController();
  double _weight = 1;

  /// Releases link editor controllers.
  @override
  void dispose() {
    _typeController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  /// Saves dialog input into the result payload.
  void _save() {
    final type = _typeController.text.trim();
    if (type.isEmpty) {
      return;
    }
    Navigator.of(context).pop(
      _MemoryLinkEditorResult(
        type: type,
        weight: _weight,
        description: _descriptionController.text.trim(),
      ),
    );
  }

  /// Builds the memory link dialog.
  @override
  Widget build(BuildContext context) {
    return OperitDialogScaffold(
      title: 'Create memory link',
      maxWidth: 520,
      showCloseButton: true,
      actions: <Widget>[
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        FilledButton(onPressed: _save, child: const Text('Create')),
      ],
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Text(
            '${widget.sourceTitle}  →  ${widget.targetTitle}',
            style: Theme.of(
              context,
            ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _typeController,
            decoration: const InputDecoration(labelText: 'Link type'),
          ),
          const SizedBox(height: 10),
          _SliderEditor(
            label: 'Weight',
            value: _weight,
            onChanged: (value) => setState(() => _weight = value),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _descriptionController,
            minLines: 2,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Description',
              border: OutlineInputBorder(),
            ),
          ),
        ],
      ),
    );
  }
}

class _ImportStrategyDialog extends StatelessWidget {
  /// Creates the import strategy dialog.
  const _ImportStrategyDialog();

  /// Shows the import strategy dialog.
  static Future<core_proxy.ImportStrategy?> show({
    required BuildContext context,
  }) {
    return showDialog<core_proxy.ImportStrategy>(
      context: context,
      builder: (context) => const _ImportStrategyDialog(),
    );
  }

  /// Builds the import strategy dialog.
  @override
  Widget build(BuildContext context) {
    return OperitDialogScaffold(
      title: 'Import memory JSON',
      maxWidth: 440,
      showCloseButton: true,
      actions: <Widget>[
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: () =>
              Navigator.of(context).pop(core_proxy.ImportStrategy.skip),
          child: const Text('Skip'),
        ),
        TextButton(
          onPressed: () =>
              Navigator.of(context).pop(core_proxy.ImportStrategy.update),
          child: const Text('Update'),
        ),
        FilledButton(
          onPressed: () =>
              Navigator.of(context).pop(core_proxy.ImportStrategy.createNew),
          child: const Text('Create new memory'),
        ),
      ],
      child: const Padding(
        padding: EdgeInsets.symmetric(vertical: 8),
        child: Text('Choose how to handle the duplicate-name memory.'),
      ),
    );
  }
}

/// Returns a graph containing exactly the selected memory ids.
core_proxy.MemoryGraph _graphForMemoryIds(
  core_proxy.MemoryGraph graph,
  Set<String> memoryIds,
) {
  final nodes = graph.nodes
      .where((node) => memoryIds.contains(node.id))
      .toList(growable: false);
  final nodeIds = nodes.map((node) => node.id).toSet();
  final edges = graph.edges
      .where(
        (edge) =>
            nodeIds.contains(edge.sourceId) && nodeIds.contains(edge.targetId),
      )
      .toList(growable: false);
  return core_proxy.MemoryGraph(nodes: nodes, edges: edges);
}

/// Returns a graph containing selected memory ids and their direct neighbors.
core_proxy.MemoryGraph _graphAroundMemoryIds(
  core_proxy.MemoryGraph graph,
  Set<String> memoryIds,
) {
  final expandedIds = <String>{...memoryIds};
  for (final edge in graph.edges) {
    if (memoryIds.contains(edge.sourceId)) {
      expandedIds.add(edge.targetId);
    }
    if (memoryIds.contains(edge.targetId)) {
      expandedIds.add(edge.sourceId);
    }
  }
  return _graphForMemoryIds(graph, expandedIds);
}

/// Returns a folder path and its visible child paths.
List<String> _folderAndChildren(List<String> folders, String folderPath) {
  final prefix = '$folderPath/';
  return folders
      .where((folder) => folder == folderPath || folder.startsWith(prefix))
      .toList(growable: false);
}

/// Returns true when a memory belongs to a folder subtree.
bool _matchesFolderTree(String memoryFolderPath, String folderPath) {
  final normalizedFolder = folderPath.trim();
  final normalizedMemoryFolder = memoryFolderPath.trim();
  final prefix = '$normalizedFolder/';
  return normalizedMemoryFolder == normalizedFolder ||
      normalizedMemoryFolder.startsWith(prefix);
}

/// Returns the display label for a folder path.
String _folderLabel(String folderPath) {
  final trimmed = folderPath.trim();
  return trimmed.isEmpty ? 'All' : trimmed;
}

/// Returns the visible tree depth of a folder path.
int _folderDepth(String folderPath) {
  final trimmed = folderPath.trim();
  if (trimmed.isEmpty) {
    return 0;
  }
  return trimmed.split('/').length - 1;
}

/// Formats epoch milliseconds for compact display.
String _formatMillis(int millis) {
  final date = DateTime.fromMillisecondsSinceEpoch(millis);
  return '${date.year}-${_twoDigits(date.month)}-${_twoDigits(date.day)} ${_twoDigits(date.hour)}:${_twoDigits(date.minute)}';
}

/// Formats one integer as two digits.
String _twoDigits(int value) {
  return value.toString().padLeft(2, '0');
}
