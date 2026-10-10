//! Runtime node-communication entry point: used by the Router to forward calls and by the application to manage listeners and pairing.
//! PeerLink handles connections and transport only; anonymous admission, identity verification, pairing state and persistence belong to the runtime.
//! Pairing uses the standard Link Call: no extra message protocol is defined and no HTTP-only pairing endpoint exists.

use super::NodeServices::{PairedPeer, PairingPrompt, PendingPairing};
use async_trait::async_trait;
use operit_link::{
    CoreCallRequest, CoreCallResponse, CoreEvent, CoreEventStream, CoreLinkError,
    CoreLinkPushSession, CorePushRequest, CoreWatchRequest, RoutedCoreRequest,
};
use operit_peer_link::{PeerEndpoint, PeerTransport};

/// The communication service of one local node; the Router never touches sockets, connection send/receive or the pairing handshake.
/// See HostRuntimePeerService for the production implementation; this contract does not depend on a specific transport.
#[async_trait(?Send)]
pub trait RuntimePeerService: Send + Sync {
    /// Returns unpaired local-discovery candidates for every application using this Core.
    /// Excludes local and paired node IDs in either authorization direction, including offline peers.
    /// Discovery is not authentication or Space membership proof; candidates still require pairing.
    async fn discoverPeers(
        &self,
        timeoutMs: u64,
    ) -> Result<Vec<super::NodeServices::DiscoveredPeer>, CoreLinkError>;

    /// Connects to the target and starts pairing through PeerLink::connect(host, source, target, transport).
    /// LAN-discovery pairing allows token to be None: the runtime then either chooses the anonymous pairing entry point or obtains the
    /// token from the Host trusted local-credential interface; this is not trust in the peer and still requires the pairing code, identity binding and key proof.
    /// Non-LAN pairing must verify the token before the pairing-code confirmation; a missing or wrong token must be rejected.
    /// None is only for LAN flows confirmed by the Host actual origin and policy; it authorizes neither non-LAN pairing nor business access.
    /// Whether token-free pairing is allowed is decided by the Host actual inbound origin and the local listen policy; a target address string alone is never trusted.
    /// Uses fresh ephemeral keys, a random nonce and an identity-binding proof; the encrypted session is established only after key exchange and key confirmation are verified.
    /// An asymmetric key exchange is not encryption; the session must use a verified encryption implementation and a signature is never a substitute for encryption.
    /// Requests pairing through a standard Call; the runtime verifies the response and the request correlation, then stores the pending state.
    /// The node identifier inside target is addressing information only, never evidence that the identity has been verified.
    /// Connection cancellation and release are managed by the runtime; no separate pairing flow is written for HTTP, WS, TCP or serial.
    async fn startPairing(
        &self,
        target: PeerEndpoint,
        transport: PeerTransport,
        token: Option<&str>,
    ) -> Result<PendingPairing, CoreLinkError>;

    /// Fetches the local pending state by pairing identifier and submits the confirmation code through the same Link Call flow.
    /// Even an accepted token never skips the pairing code; the legacy bootstrap/autoBootstrap shortcuts are forbidden.
    /// Authorization directions are recorded separately; one pairing never creates the reverse authorization automatically, while a device-level revocation clears both sides.
    /// Reconnects with the saved endpoint and transport when needed; the pairing is stored only after both identities and their proofs are verified.
    /// A successful pairing is neither Space membership nor a license for arbitrary business calls.
    async fn finishPairing(
        &self,
        pairingId: &str,
        confirmationCode: &str,
    ) -> Result<PairedPeer, CoreLinkError>;

    /// Cancels the local pending transaction, clears its temporary secrets and releases its connection; an existing pairing is not deleted.
    /// This is a local management operation and can never be executed anonymously from a remotely supplied pairing identifier.
    async fn cancelPairing(&self, pairingId: &str) -> Result<(), CoreLinkError>;

    /// Reports independent listener and discovery capabilities without opening resources.
    fn listenerCapabilities(&self) -> operit_peer_link::PeerListenerCapabilities;

    /// Starts the receiving service for the given transport; it calls PeerLink::listen internally and manages accept/receive.
    /// bindAddress, token and discovery options are read from the original configuration file held by the runtime; no second set of defaults is created.
    /// Unauthenticated connections may only enter the runtime anonymous-pairing Call allow-list; the listener is never exposed to the application.
    /// Authenticated business traffic is handed to the Router for routing and permission checks; pairing and business share the inbound entry.
    async fn startListening(&self, transports: &[PeerTransport]) -> Result<(), CoreLinkError>;

    /// Stops listening and closes the connections and streams managed by this service; persisted pairing records are not deleted.
    async fn stop(&self) -> Result<(), CoreLinkError>;

    /// The Router calls this method directly once it has chosen the next hop; the legacy PeerLinkClient is no longer looked up.
    /// nextNodeId is the neighbouring node and request.targetNodeId is the final node; the two must never be confused.
    /// It picks the endpoint and transport from the pairing record, connects, completes authentication, sends the Call and correlates the response.
    /// The original caller, Space, route kind and TTL must be preserved; no re-routing or Proxy execution happens here.
    async fn call(
        &self,
        nextNodeId: &str,
        request: RoutedCoreRequest<CoreCallRequest>,
    ) -> CoreCallResponse;

    /// Uses the same authenticated connection entry as call and returns a standard Watch snapshot.
    async fn watchSnapshot(
        &self,
        nextNodeId: &str,
        request: RoutedCoreRequest<CoreWatchRequest>,
    ) -> Result<CoreEvent, CoreLinkError>;

    /// Uses the same entry as call and returns a standard event stream; correlation, cancellation and disconnect cleanup are handled internally.
    async fn watch(
        &self,
        nextNodeId: &str,
        request: RoutedCoreRequest<CoreWatchRequest>,
    ) -> Result<CoreEventStream, CoreLinkError>;

    /// Uses the same entry as call and returns a standard Push session; the Router never handles low-level frames or connections.
    async fn openPush(
        &self,
        nextNodeId: &str,
        request: RoutedCoreRequest<CorePushRequest>,
    ) -> Result<Box<dyn CoreLinkPushSession>, CoreLinkError>;

    /// Lists the peers paired with this node; extra transports of the same peer are not counted as another paired identity.
    fn pairedPeers(&self) -> Result<Vec<PairedPeer>, CoreLinkError>;

    /// Returns the paired identities this node may call proactively; they are deduplicated per node and inbound authorization is never derived into outbound authorization.
    /// Several transport channels belong to one identity; the caller sees no endpoint, session or key.
    fn outboundPeerNodeIds(&self) -> Result<std::collections::BTreeSet<String>, CoreLinkError>;

    /// Neighbouring nodes with authenticated online evidence; anonymous connections are excluded.
    /// Same-Space callbacks are established with a separate Space credential and never modify ordinary pairing directions.
    fn activePeerNodeIds(&self) -> Result<std::collections::BTreeSet<String>, CoreLinkError>;

    /// Subscribes to pending-pairing, authorization or availability changes; subscribe before reading the snapshot so that no change is missed at startup.
    /// Notifications carry no transport details; a lagging receiver re-reads the snapshot and stopping the service wakes the receivers.
    fn subscribePeerChanges(&self) -> tokio::sync::broadcast::Receiver<()>;

    /// The local UI reads pending requests and verification codes; they must never be exposed to unauthenticated peers.
    fn pairingPrompts(&self) -> Result<Vec<PairingPrompt>, CoreLinkError>;

    /// Closes the current connections on every channel of that node while keeping the pairing authorization; performed by the single connection owner.
    async fn disconnectPeer(&self, peerNodeId: &str) -> Result<(), CoreLinkError>;

    /// Revokes all inbound/outbound authorization, every transport channel and the related credentials for a device; the user is never asked to choose a direction.
    /// This operation requires local management privileges and is not part of the anonymous pairing entry point.
    async fn removePairedPeer(&self, peerNodeId: &str) -> Result<(), CoreLinkError>;
}
