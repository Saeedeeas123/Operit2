# Device-space Rust contract tests

This directory gathers the device-space, approval, cancellation, permission, multi-hop routing, persistence and sync boundary tests.
**A test file existing and passing a syntax check is not the same as the behaviour test passing, and it certainly does not mean every edge case is covered.**

## Running

Run from the repository root (by default this only registers, wires up modules, records paths and checks Rust syntax; it does not compile):

```powershell
./core/crates/node/runtime/tests/device_space/run.ps1
```

Explicitly run the Rust behaviour tests (this command compiles the test target and ignores Rust warnings):

```powershell
./core/crates/node/runtime/tests/device_space/run.ps1 -Run
./core/crates/node/runtime/tests/device_space/run.ps1 -Run -Repeat 10
```

The equivalent Cargo filter is `-p operit-node-runtime --lib device_space`.
`--lib` is required: these source files are pulled in by the original module through `include!`, which allows testing private protocol boundaries
without widening the public surface of the production API for tests. All case names are registered in `coverage.json`.

## Coverage matrix (50 test functions; some iterate over several failure/order combinations)

| File | What it verifies | Layer |
| --- | --- | --- |
| `join_lifecycle.rs` | Standalone administrator request; rejection; facade restart; repeated approval; leaving and re-requesting; isolation of two requesters; lost submit response | Real facade/router + separate Host storage |
| `cancellation.rs` | On-disk records on both sides after cancellation; the approval disappears from B; a stale approval stops working; business/identity/pairing files unchanged; failure before submit and lost response after processing; lost cancellation confirmation; delayed refresh; reconnect retry; both claim-then-cancel and cancel-then-claim orderings; 12 consecutive cancel-and-re-request cycles | Real protocol + controllable transport |
| `reviewer_assignment.rs` | Most recent legitimate reviewer, no prompt on non-reviewer devices, offline grace and transfer, a stale assignment stops working | Real multi-node routing |
| `protocol_boundaries.rs` | Wrong identity/Space/revision/profile; cancellation by a third party; the requesting administrator cannot self-approve; expiry; target switches Space; conflicting opposite approval decisions | Identity and authorization entry |
| `space_merge.rs` | Whole-group merge of AB with C-D-(E,F)-G; hop-by-hop migration; profile/permission/topology integrity; an incomplete snapshot writes no members | Real Space projection exchange |
| `routing_contracts.rs` | Multi-hop loops; network partition/reconnect; revoking relay permission; TTL; target removed while the connection still exists; Binding owner migration and stale-write conflict | Real router + Store |
| `policy_contracts.rs` | Permission log in reverse order, rotation, duplicate delivery; forged issuer; last-administrator protection; approval-permission changes | Real permission replay |
| `persistence_contracts.rs` | Binary files A-B-C; deletion prevents stale data from coming back; missing blocks, truncation, wrong hash; concurrent writes and every two-event ordering; path traversal; a non-joined or cancelled side cannot read the sync log | Real Store + routing rejection |
| `transports.rs` | TCP pairing/return authentication; client-side one-way HTTP/WebSocket; atomic validation of the listen capability; discovery and pairing filtering | Real Host transport |
| `join_state_machine.rs` | Every terminal state times every response, expiry boundaries, a claimed request does not expire automatically, directed relay distance | Pure state machine |
| `facade_state.rs` | Join-projection validation, observation subscription release, connection-state mapping | Facade state |

## Facts to verify on every cancellation

- The state of A `space_merge_outbound.preferences.json` and B `space_merge_inbound.preferences.json`.
- B `incomingDeviceSpaceJoins()` no longer returns the cancelled item; holding a stale dialog open still cannot approve successfully.
- The review inbox is an archive of already-fetched records; an existing archive does not mean it can still be approved, because the authoritative state lives in inbound.
- RESULT_RECORDS must not contain a new approval result for a cancelled request.
- The Space id, member files, device profile, user assets, identity and pairing credentials of A/B keep their original bytes.
- While the cancellation has not reached B you cannot claim that B is cancelled; after B confirms, a stale poll must not resurrect Pending.
- When a claim was submitted first, the current protocol forbids cancelling the already-claimed decision; the test asserts Approving explicitly instead of pretending it is Cancelled.

Request-record paths and production constants are checked structurally, so that a protocol version change cannot make a test read a stale path and miss the change.
The developer real runtime directory is never read; every node uses its own test Host. Cases that replace the global Host hold a single shared lock.

## Failure model

The link in `fixtures.rs` actually calls the target router and injects only at explicit points:

1. Failure before the request is delivered;
2. The target finished processing and the response was lost;
3. The target finished processing and the response is held by the oneshot gate;
4. Explicitly remove/restore one active connection.

Concurrency cases control interleaving with gates rather than random sleeps; timeouts exist to stop a deadlock from hanging the test forever.
Permission replay iterates several delivery orderings, and file conflicts pin the same event time to exercise the origin-id tie-break rule.

## Coverage boundaries not to be confused / still missing before release

- `persistence_contracts.rs` exercises the real Blob/Operation/Preferences infrastructure,
  but it does not start the full `OperitApplication.syncApplyOperations` or the background `synchronizeOnce`.
  **File propagation across the A-B-C Store is not the same as full multi-hop network file sync passing.**
- Rebuilding the facade verifies that on-disk records are read again; it is not a real process restart with a cleared process cache.
- Still missing: failure of every persistence write point / process kill, a full disk, partial fsync, and full cross-file atomicity.
- Still missing: merging two Spaces in both directions at once, two different targets approving the same source Space simultaneously, and the full conflict matrix for members joining, leaving or being removed during a merge.
- Still missing: interrupted-and-resumed chunked transfer of large files under the real application service, sync batch boundaries, and incremental clocks plus stale-file isolation when switching Spaces.
- Still missing: cross-version protocols, Web/mobile background suspension and weak networks, real device clock skew and multi-process restart.
- The UI additionally keeps `apps/flutter/app/test/space_join_dialog_test.dart`: cancellation under slow polling, late responses and error messages.

None of the gaps above may be "fixed green" by skipping errors, forging a profile, skipping tests or removing permission checks.
A behaviour regression must keep the failure evidence, fix the root cause in production code and add the matching invariant.

## Verification status for this round (2026-10-06)

The Rust behaviour tests were actually compiled and run as requested, using `-Awarnings` to ignore compiler warnings.

- Structural check: 13 Rust files and 50 registered tests, passed.
- `cargo test -p operit-node-runtime --lib device_space -- --test-threads=1`:
  **50 passed, 1 failed, 0 ignored**. The filter also matched the pre-existing Space-observation tests, so 51 tests actually ran.
- Failed: `policy_replay_converges_with_duplicate_reversed_and_rotated_delivery`.
- That case was re-run 3 times alone against the freshly compiled test binary and failed all 3 times (exit code 101).
- Full log: `latest-run.log`; single-case repeat log: `policy-repro.log`.

Test-side problems exposed by the first run were fixed: the topology fixture uses the serialization interface instead of touching private fields;
the Binding test uses a real Store; a local reviewer claim goes through the local approval dispatcher and no network request is sent to itself.
No business assertion was skipped or relaxed, and no production code was changed to hide the remaining failure.

Code cause of the remaining failure: `NetworkControlStore.applySyncedOperation` calls
`SyncOperationStore.appendOperations`; after that method accepts a higher sequence and advances the origin clock,
it discards a lower-sequence operation that arrives afterwards and is not yet present in the log.
The Bootstrap of this case is discarded because of the out-of-order arrival, and the permission replay result is `initialized=false`.
This is a real non-convergence problem of the current persistence/permission log for out-of-order input; the test proves that this input path is faulty,
but it does not prove that any earlier real user report was caused by it.

`coverage.json` is a list of cases; it is neither a pass report nor a code-coverage report.
