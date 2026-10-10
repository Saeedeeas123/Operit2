# Device space visualization

`RuntimeSettingsPanel.dart` handles device-space data and actions; `DeviceSpaceGraph.dart`
renders the interaction. Layout and canvas drawing live in `DeviceSpaceGraphLayout.dart` and
`DeviceSpaceGraphPainter.dart`, reusing the existing Core topology projection and disconnect APIs.
`DeviceSpaceGraphSphere.dart` handles the spherical material of the round nodes and the embossed device symbols.

By default it shows device relationships: the current device sits at the center while the other space members slowly
orbit along tilted elliptical tracks, about 28 seconds per revolution. Perspective projection, far-small/near-big scaling,
far-dim/near-bright shading, and depth-sorted occlusion create the pseudo-3D effect. With many devices they are split across multiple tracks.
Relationship guide lines follow the nodes and only indicate space membership, not an established direct connection. The total and
online device counts are shown directly in the graph header; nodes keep only the round icon, status dot, and center-switch badge.

Names, status, or action text are not permanently shown under nodes. Desktop hover and keyboard focus reveal the name, online
status, and platform; tapping any node expands device info below the graph, on mobile too.
While hovering, keyboard focus, or viewing remote details, the orbit pauses and resumes from the same angle afterward.

Center and outer nodes share the same spherical material: directional highlight, shaded side, rim light, and contact shadow shape
the volume; the sphere reduces theme-color saturation and uses a translucent material so tracks and background faintly show through. Dark themes keep the night-sky layering; light themes lower the white light to avoid washing out. Device symbols are rendered as relief on the sphere via thickness, bevels, surface gradients, and separate shadows.
Outer symbols keep a recognizable front face and tilt only slightly with the orbit angle; lighting and reflections follow the
same orbit phase. They rise on hover or selection and press back down; with reduced animation the static state applies directly.

Tapping the current device simultaneously shows the current device info and expands the connection topology in the same canvas; tapping
again returns. The orbit angle freezes during view switching and nodes stay still in the topology. The topology layers by
recorded connection distance, expanding left-to-right when horizontal space allows and top-down on narrow screens. Members with
no connection path are laid out independently, with no fabricated links. Online connections are solid; offline, unknown, and version-mismatch
links are dashed in different colors; flowing light indicates the link is online, not live traffic.

Tapping a node expands the device name, online status, platform, Core version, adjacent devices, and connection reason below the graph. The disconnect action shows only when
the selected device and the current device have a connection record, keeping double confirmation, disabling during execution,
and error messages. Tap blank space or the close button to collapse the details.

Device nodes uniformly use circles and support hover, press, and keyboard focus. Canvas positions are fixed, with no dragging,
pinch/wheel zoom, or reset; the center sphere, outer spheres, track radii, and strokes all scale continuously with the current canvas
short side; both views use the same canvas size. Swipes on the graph pass through to the outer page scroll.

On narrow screens card padding and copy are tightened and graph height follows the window ratio; node diameter, icon, status dot, and
track widths are not hard-coded per breakpoint. The canvas boundary covers the full orbit period, so device rotation causes no
overall size change. Nodes reuse the same component, updating only position,
scale, opacity, and occlusion order; node materials redraw separately and device symbols reuse layers instead of rebuilding per frame.
Settings page. Breathing glow, tracks, and online links are redrawn on independent
canvases. With system reduced motion enabled, orbiting and continuous effects stop while the static graph and all actions remain.

Manual acceptance focuses on: single device, one offline member, multiple members, and indirect connections; quick
switching between both views; boundaries of the full orbit period and front/back occlusion; pause/resume after hover, tap, and closing details;
window resizing, narrow screens, and dark/light themes; dragging and pinching do not move the canvas and swiping on the graph scrolls the page normally;
device detail and disconnect failure messages; keyboard focus order and reduced motion; sphere
highlight contrast with device symbols in dark/light themes, and relief clarity on compact nodes.
