// ignore_for_file: file_names

import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/proxy/generated/CoreProxyClients.g.dart';
import '../../../../core/proxy/generated/CoreProxyModels.g.dart' as core;

/// All controls target the resolved character/shared owner, never the active card.
class MemoryOwnerControlsDialog extends StatefulWidget {
  const MemoryOwnerControlsDialog({
    super.key,
    required this.clients,
    required this.ownerKey,
    this.chatCore,
    this.chatId,
  });
  final GeneratedCoreProxyClients clients;
  final String ownerKey;
  final GeneratedChatRuntimeHolderMainCoreProxy? chatCore;
  final String? chatId;

  static Future<void> open(
    BuildContext context,
    GeneratedCoreProxyClients clients,
    String ownerKey, {
    GeneratedChatRuntimeHolderMainCoreProxy? chatCore,
    String? chatId,
  }) => showDialog<void>(
    context: context,
    builder: (_) => MemoryOwnerControlsDialog(
      clients: clients,
      ownerKey: ownerKey,
      chatCore: chatCore,
      chatId: chatId,
    ),
  );

  @override
  State<MemoryOwnerControlsDialog> createState() =>
      _MemoryOwnerControlsDialogState();
}

class _MemoryOwnerControlsDialogState extends State<MemoryOwnerControlsDialog> {
  late final service = _MemoryOwnerControlsService(
    widget.clients.application.memoryManagementService(
      ownerKey: widget.ownerKey,
    ),
    widget.chatCore,
    widget.chatId,
    widget.clients.repositoryMemoryRepositoryForOwner(widget.ownerKey),
  );
  final rules = TextEditingController();
  final endpoint = TextEditingController();
  final apiKey = TextEditingController();
  final model = TextEditingController();
  final query = TextEditingController();
  core.MemorySettings? settings;
  core.MemorySearchConfig? search;
  core.MemoryAutoSaveStatus? queue;
  core.MemoryRebuildProgress? progress;
  List<core.ChatHistory> chats = [];
  final selectedChats = <String>{};
  Timer? timer;
  bool polling = false;
  bool busy = false;
  String? error;
  int interval = 5;
  int windowSize = 32;
  bool autoProfile = true;
  bool locked = false;
  bool cloud = false;
  DateTime? from;
  DateTime? to;
  String? simulation;

  @override
  void initState() {
    super.initState();
    unawaited(load());
    timer = Timer.periodic(const Duration(seconds: 3), (_) => poll());
  }

  @override
  void dispose() {
    timer?.cancel();
    for (final controller in [rules, endpoint, apiKey, model, query]) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> load() async {
    try {
      final s = await service.loadSettings();
      final c = await service.loadSearchConfig();
      final histories = await service.boundChats();
      if (!mounted) return;
      setState(() {
        settings = s;
        search = c;
        chats = histories;
        interval = s.autoSaveIntervalMinutes;
        autoProfile = s.profileAutoUpdateEnabled;
        locked = s.profileAutoUpdateLocked;
        cloud = s.cloudEmbeddingEnabled;
        rules.text = s.memoryExtractionCustomRules;
        endpoint.text = s.cloudEmbeddingEndpoint;
        apiKey.text = s.cloudEmbeddingApiKey;
        model.text = s.cloudEmbeddingModel;
      });
      await poll();
    } catch (e) {
      if (mounted) setState(() => error = '$e');
    }
  }

  Future<void> poll() async {
    if (polling) return;
    polling = true;
    try {
      final q = await service.autoSaveStatus();
      final p = await service.rebuildProgress();
      if (mounted) {
        setState(() {
          queue = q;
          progress = p;
        });
      }
    } catch (e) {
      if (mounted) setState(() => error = '$e');
    } finally {
      polling = false;
    }
  }

  Future<void> run(Future<void> Function() operation) async {
    if (busy) return;
    setState(() {
      busy = true;
      error = null;
    });
    try {
      await operation();
      await poll();
    } catch (e) {
      if (mounted) setState(() => error = '$e');
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> save() => run(() async {
    final old = settings!;
    await service.saveSettings(
      settings: core.MemorySettings(
        autoSaveIntervalMinutes: interval,
        nextAutoSaveRunAtMs: old.nextAutoSaveRunAtMs,
        memoryExtractionCustomRules: rules.text,
        profileAutoUpdateEnabled: autoProfile,
        profileAutoUpdateLocked: locked,
        cloudEmbeddingEnabled: cloud,
        cloudEmbeddingEndpoint: endpoint.text,
        cloudEmbeddingApiKey: apiKey.text,
        cloudEmbeddingModel: model.text,
      ),
    );
    await service.saveSearchConfig(config: search!);
    if (mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Memory settings saved')));
    }
  });

  void weight(int index, double value) {
    final c = search!;
    setState(
      () => search = core.MemorySearchConfig(
        scoreMode: c.scoreMode,
        keywordWeight: index == 0 ? value : c.keywordWeight,
        tagWeight: index == 1 ? value : c.tagWeight,
        vectorWeight: index == 2 ? value : c.vectorWeight,
        edgeWeight: index == 3 ? value : c.edgeWeight,
      ),
    );
  }

  Future<void> pickDate(bool start) async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      initialDate: (start ? from : to) ?? now,
      firstDate: DateTime(2000),
      lastDate: now.add(const Duration(days: 1)),
    );
    if (date != null && mounted) {
      setState(() {
        if (start) {
          from = date;
        } else {
          to = date;
        }
      });
    }
  }

  bool get rebuilding => ['running', 'preparing'].contains(progress?.status);

  @override
  Widget build(BuildContext context) {
    final q = queue;
    final p = progress;
    return DefaultTabController(
      length: 3,
      child: AlertDialog(
        title: const Text('Memory settings'),
        titleTextStyle: Theme.of(context).textTheme.titleMedium,
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        contentPadding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
        content: SizedBox(
          width: 560,
          height: (MediaQuery.sizeOf(context).height * 0.65).clamp(
            160.0,
            540.0,
          ),
          child: settings == null
              ? (error == null
                    ? const Center(child: CircularProgressIndicator())
                    : Text(error!))
              : Column(
                  children: [
                    TabBar(
                      labelPadding: const EdgeInsets.symmetric(horizontal: 4),
                      labelStyle: Theme.of(context).textTheme.labelLarge
                          ?.copyWith(fontSize: 13, fontWeight: FontWeight.w600),
                      tabs: const [
                        Tab(text: 'Auto-extract'),
                        Tab(text: 'Retrieval'),
                        Tab(text: 'History rebuild'),
                      ],
                    ),
                    Expanded(
                      child: TabBarView(
                        children: [
                          _settingsPage([
                            Text(
                              'Memory library: ${q?.ownerKey ?? widget.ownerKey}',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            const SizedBox(height: 12),
                            if (q != null) ...[
                              Text(
                                'Pending ${q.pendingCandidates} item(s) / ${q.pendingChats} chat(s) · Processing ${q.processingCandidates} · Failed ${q.failedCandidates}',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              Text(
                                'Next check in about ${q.minutesUntilNextRun} min',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              if (q.lastError.isNotEmpty)
                                Text(
                                  q.lastError,
                                  style: TextStyle(
                                    color: Theme.of(context).colorScheme.error,
                                  ),
                                ),
                            ],
                            const SizedBox(height: 8),
                            Text(
                              'Auto-extract starts after 5 candidates accumulate; manual updates are not limited by this.',
                              style: Theme.of(context).textTheme.bodySmall
                                  ?.copyWith(
                                    color: Theme.of(
                                      context,
                                    ).colorScheme.onSurfaceVariant,
                                  ),
                            ),
                            const SizedBox(height: 16),
                            Text('Auto-check interval: $interval min'),
                            Slider(
                              value: interval.toDouble(),
                              min: 1,
                              max: 30,
                              divisions: 29,
                              onChanged: busy
                                  ? null
                                  : (v) => setState(() => interval = v.round()),
                            ),
                            SwitchListTile(
                              contentPadding: EdgeInsets.zero,
                              dense: true,
                              title: const Text('Auto-update USER.md'),
                              value: autoProfile,
                              onChanged: busy
                                  ? null
                                  : (v) => setState(() => autoProfile = v),
                            ),
                            SwitchListTile(
                              contentPadding: EdgeInsets.zero,
                              dense: true,
                              title: const Text('Lock USER.md'),
                              subtitle: const Text('Prevent the model from overwriting the user profile'),
                              value: locked,
                              onChanged: busy
                                  ? null
                                  : (v) => setState(() => locked = v),
                            ),
                            TextField(
                              controller: rules,
                              minLines: 3,
                              maxLines: 8,
                              decoration: const InputDecoration(
                                labelText: 'Extra memory-extraction rules',
                                hintText: 'Refine memory domains, storage focus, categories, tags, and writing style',
                              ),
                            ),
                          ]),
                          _settingsPage([
                            const Text('Retrieval scores'),
                            DropdownButton<core.MemoryScoreMode>(
                              value: search!.scoreMode,
                              isExpanded: true,
                              items: core.MemoryScoreMode.values
                                  .map(
                                    (m) => DropdownMenuItem(
                                      value: m,
                                      child: Text(m.name),
                                    ),
                                  )
                                  .toList(),
                              onChanged: busy
                                  ? null
                                  : (m) {
                                      if (m == null) return;
                                      final c = search!;
                                      setState(
                                        () => search = core.MemorySearchConfig(
                                          scoreMode: m,
                                          keywordWeight: c.keywordWeight,
                                          tagWeight: c.tagWeight,
                                          vectorWeight: c.vectorWeight,
                                          edgeWeight: c.edgeWeight,
                                        ),
                                      );
                                    },
                            ),
                            for (final (i, name, value) in [
                              (0, 'Keywords', search!.keywordWeight),
                              (1, 'Tags', search!.tagWeight),
                              (2, 'Semantic vectors', search!.vectorWeight),
                              (3, 'Graph links', search!.edgeWeight),
                            ])
                              Row(
                                children: [
                                  SizedBox(
                                    width: 90,
                                    child: Text(
                                      '$name ${value.toStringAsFixed(1)}',
                                    ),
                                  ),
                                  Expanded(
                                    child: Slider(
                                      value: value.clamp(0, 20).toDouble(),
                                      min: 0,
                                      max: 20,
                                      divisions: 200,
                                      onChanged: busy
                                          ? null
                                          : (v) => weight(i, v),
                                    ),
                                  ),
                                ],
                              ),
                            SwitchListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('Cloud embedding'),
                              subtitle: const Text('When enabled, search text and memory text are sent to the specified service'),
                              value: cloud,
                              onChanged: busy
                                  ? null
                                  : (v) => setState(() => cloud = v),
                            ),
                            if (cloud) ...[
                              TextField(
                                controller: endpoint,
                                decoration: const InputDecoration(
                                  labelText: 'Embedding full request URL',
                                ),
                              ),
                              TextField(
                                controller: apiKey,
                                obscureText: true,
                                decoration: const InputDecoration(
                                  labelText: 'API Key',
                                ),
                              ),
                              TextField(
                                controller: model,
                                decoration: const InputDecoration(
                                  labelText: 'Embedding model',
                                ),
                              ),
                              OutlinedButton(
                                onPressed: busy
                                    ? null
                                    : () => run(() async {
                                        await service.rebuildEmbeddings();
                                      }),
                                child: const Text('Rebuild vector cache (using saved settings)'),
                              ),
                            ],
                            TextField(
                              controller: query,
                              decoration: const InputDecoration(
                                labelText: 'Retrieval test query',
                              ),
                            ),
                            OutlinedButton(
                              onPressed: busy
                                  ? null
                                  : () => run(() async {
                                      final result = await service
                                          .searchMemoriesDebug(
                                            query: query.text,
                                            config: search!,
                                          );
                                      if (mounted) {
                                        setState(
                                          () => simulation = result
                                              .toJson()
                                              .toString(),
                                        );
                                      }
                                    }),
                              child: const Text('Simulate with current weights'),
                            ),
                            if (simulation != null) SelectableText(simulation!),
                          ]),
                          _settingsPage([
                            const Text('Rebuild memory from chat history (append/update; does not delete existing memories)'),
                            Text('$windowSize messages per window'),
                            Slider(
                              value: windowSize.toDouble(),
                              min: 8,
                              max: 48,
                              divisions: 40,
                              onChanged: rebuilding
                                  ? null
                                  : (v) =>
                                        setState(() => windowSize = v.round()),
                            ),
                            Wrap(
                              spacing: 8,
                              children: [
                                OutlinedButton(
                                  onPressed: rebuilding
                                      ? null
                                      : () => pickDate(true),
                                  child: Text(
                                    from == null
                                        ? 'Start date: unlimited'
                                        : 'Start: ${from!.toIso8601String().split('T').first}',
                                  ),
                                ),
                                OutlinedButton(
                                  onPressed: rebuilding
                                      ? null
                                      : () => pickDate(false),
                                  child: Text(
                                    to == null
                                        ? 'End date: unlimited'
                                        : 'End: ${to!.toIso8601String().split('T').first}',
                                  ),
                                ),
                                TextButton(
                                  onPressed: rebuilding
                                      ? null
                                      : () => setState(() {
                                          from = null;
                                          to = null;
                                        }),
                                  child: const Text('All time'),
                                ),
                              ],
                            ),
                            if (chats.isEmpty) const Text('No chats bound to this memory library yet'),
                            for (final chat in chats)
                              CheckboxListTile(
                                contentPadding: EdgeInsets.zero,
                                title: Text(chat.title),
                                value: selectedChats.contains(chat.id),
                                onChanged: rebuilding
                                    ? null
                                    : (v) => setState(() {
                                        if (v == true) {
                                          selectedChats.add(chat.id);
                                        } else {
                                          selectedChats.remove(chat.id);
                                        }
                                      }),
                              ),
                            Wrap(
                              spacing: 8,
                              children: [
                                FilledButton(
                                  onPressed:
                                      busy ||
                                          rebuilding ||
                                          selectedChats.isEmpty
                                      ? null
                                      : () => run(
                                          () => service.startRebuild(
                                            chatIds: selectedChats.toList(),
                                            windowMessageCount: windowSize,
                                            fromInclusive:
                                                from?.millisecondsSinceEpoch,
                                            toInclusive: to == null
                                                ? null
                                                : DateTime(
                                                        to!.year,
                                                        to!.month,
                                                        to!.day + 1,
                                                      ).millisecondsSinceEpoch -
                                                      1,
                                          ),
                                        ),
                                  child: const Text('Start rebuild'),
                                ),
                                if (rebuilding)
                                  OutlinedButton(
                                    onPressed: () =>
                                        run(() => service.cancelRebuild()),
                                    child: const Text('Cancel rebuild'),
                                  ),
                              ],
                            ),
                            if (p != null && p.status != 'idle') ...[
                              Text(
                                '${p.status} · Chats ${p.completedChats}/${p.totalChats} · Windows ${p.completedWindows}/${p.totalWindows} · Failed ${p.failedWindows}',
                              ),
                              Text(
                                'Processed source messages ${p.processedSourceMessages}/${p.totalSourceMessages} · ${p.currentChatTitle}',
                              ),
                              if (rebuilding)
                                LinearProgressIndicator(
                                  value: p.totalWindows == 0
                                      ? null
                                      : p.completedWindows / p.totalWindows,
                                ),
                              if (p.lastError.isNotEmpty) Text(p.lastError),
                              if (rebuilding)
                                const Text('Closing this window does not stop the background rebuild; canceling takes effect after the current window finishes.'),
                            ],
                          ]),
                        ],
                      ),
                    ),
                    if (error != null)
                      Text(
                        error!,
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.error,
                        ),
                      ),
                  ],
                ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
          FilledButton(
            onPressed: settings == null || busy ? null : save,
            child: const Text('Save settings'),
          ),
        ],
      ),
    );
  }

  Widget _settingsPage(List<Widget> children) => SingleChildScrollView(
    padding: const EdgeInsets.only(top: 16, bottom: 8),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: children,
    ),
  );
}

/// Chat entry points route by chat id; settings-screen entry points remain owner-local.
class _MemoryOwnerControlsService {
  const _MemoryOwnerControlsService(
    this.local,
    this.chat,
    this.chatId,
    this.repository,
  ) : assert((chat == null) == (chatId == null));

  final GeneratedApplicationMemoryManagementServiceCoreProxy local;
  final GeneratedChatRuntimeHolderMainCoreProxy? chat;
  final String? chatId;
  final GeneratedRepositoryMemoryRepositoryCoreProxy repository;

  Future<core.MemorySettings> loadSettings() => chat == null
      ? local.loadSettings()
      : chat!.chatMemorySettings(chatId: chatId!);
  Future<void> saveSettings({required core.MemorySettings settings}) =>
      chat == null
      ? local.saveSettings(settings: settings)
      : chat!.saveChatMemorySettings(chatId: chatId!, settings: settings);
  Future<core.MemorySearchConfig> loadSearchConfig() => chat == null
      ? local.loadSearchConfig()
      : chat!.chatMemorySearchConfig(chatId: chatId!);
  Future<void> saveSearchConfig({required core.MemorySearchConfig config}) =>
      chat == null
      ? local.saveSearchConfig(config: config)
      : chat!.saveChatMemorySearchConfig(chatId: chatId!, config: config);
  Future<List<core.ChatHistory>> boundChats() => chat == null
      ? local.boundChats()
      : chat!.chatMemoryBoundChats(chatId: chatId!);
  Future<core.MemoryAutoSaveStatus> autoSaveStatus() => chat == null
      ? local.autoSaveStatus()
      : chat!.chatMemoryAutoSaveStatus(chatId: chatId!);
  Future<core.MemoryRebuildProgress> rebuildProgress() => chat == null
      ? local.rebuildProgress()
      : chat!.chatMemoryRebuildProgress(chatId: chatId!);
  Future<void> cancelRebuild() => chat == null
      ? local.cancelRebuild()
      : chat!.cancelChatMemoryRebuild(chatId: chatId!);
  Future<int> rebuildEmbeddings() => chat == null
      ? repository.rebuildEmbeddings()
      : chat!.rebuildChatMemoryEmbeddings(chatId: chatId!);
  Future<core.MemorySearchDebugInfo> searchMemoriesDebug({
    required String query,
    required core.MemorySearchConfig config,
  }) => chat == null
      ? repository.searchMemoriesDebug(
          query: query,
          config: config,
          folderPath: null,
          relevanceThreshold: 0,
          createdAtStartMs: null,
          createdAtEndMs: null,
        )
      : chat!.searchChatMemoriesDebug(
          chatId: chatId!,
          query: query,
          config: config,
        );

  Future<void> startRebuild({
    required List<String> chatIds,
    required int windowMessageCount,
    required int? fromInclusive,
    required int? toInclusive,
  }) => chat == null
      ? local.startRebuild(
          chatIds: chatIds,
          windowMessageCount: windowMessageCount,
          fromInclusive: fromInclusive,
          toInclusive: toInclusive,
        )
      : chat!.startChatMemoryRebuild(
          chatId: chatId!,
          chatIds: chatIds,
          windowMessageCount: windowMessageCount,
          fromInclusive: fromInclusive,
          toInclusive: toInclusive,
        );
}
