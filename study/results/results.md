# Study results

## Part 1: replication of the 2021 thesis

Same projects and folders as the thesis, at the last commit before October 2021, threshold 0.8. Test files are excluded (v0.6 only saw top-level functions, so it never compared test callbacks).

| Project | Version | Units compared | Pairs reported | Clone classes | Real clones |
|---|---|---:|---:|---:|---:|
| [freeCodeCamp/freeCodeCamp](https://github.com/freeCodeCamp/freeCodeCamp/tree/d5e3979753eb16ac00b8e530e9956eae91126f56) | v0.6 (thesis, all candidates labeled) | 158 | 29 | – | 13/29 (44.8%) |
| | v1, no size minimum (like v0.6) | 552 | 1,125 | 27 | 8/12 sampled |
| | v1, defaults (≥ 50 tokens) | 201 | 3 | 3 | 3/3 sampled |
| [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms/tree/4548296affb227c29ead868309e48667f8280c55) | v0.6 (thesis, all candidates labeled) | 192 | 60 | – | 21/60 (35.0%) |
| | v1, no size minimum (like v0.6) | 683 | 1,805 | 53 | 7/12 sampled |
| | v1, defaults (≥ 50 tokens) | 266 | 26 | 20 | 11/12 sampled |
| [TheAlgorithms/JavaScript](https://github.com/TheAlgorithms/JavaScript/tree/ee605b7694f9237574bd8b6ebbe45da253fd05f8) | v0.6 (thesis, all candidates labeled) | 385 | 231 | – | 185/231 (80.1%) |
| | v1, no size minimum (like v0.6) | 828 | 1,695 | 56 | 8/12 sampled |
| | v1, defaults (≥ 50 tokens) | 364 | 29 | 16 | 12/12 sampled |

## Part 2: React applications

**Cloned code** = share of non-blank lines inside a function, method or class that has at least one clone (jscd defaults: Type-1–3, threshold 0.8, ≥ 50 tokens). jscpd's figure is its own duplicated-lines percentage over all scanned files, for reference.

| App | Files | Lines | Cloned code | Cloned test code | jscpd dup. | Clone classes (T1/T2/T3) | Largest class | Precision (sample) | Time |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw/tree/14bb42edee3d6fee6be264e3ee78670b3b9cee79) | 665 | 199,543 | **2.2%** | 24.9% | 7.0% | 287 (10/36/241) | 52 | 3/3 | 0.9 s |
| [outline/outline](https://github.com/outline/outline/tree/6a2f23c023b952c752dfe025ef0ce2a0083cd0c1) | 1,276 | 157,366 | **4.3%** | 33.5% | 3.4% | 191 (13/32/146) | 45 | 3/3 | 0.6 s |
| [mastodon/mastodon](https://github.com/mastodon/mastodon/tree/b0555670b3d24d6e4a977a6bc3894daa128123fa) | 946 | 97,859 | **4.0%** | 12.7% | 1.7% | 95 (3/22/70) | 20 | 3/3 | 0.3 s |
| [element-hq/element-web](https://github.com/element-hq/element-web/tree/c4b8799e5581a460f1557f130a74972917011f2d) | 2,274 | 329,055 | **1.7%** | 18.9% | 4.4% | 719 (15/96/608) | 20 | 3/3 | 2.4 s |
| [jitsi/jitsi-meet](https://github.com/jitsi/jitsi-meet/tree/0fc01ad1591dad0c92737cf8354376749eafd6dc) | 1,992 | 197,341 | **2.5%** | 6.0% | 1.5% | 85 (6/13/66) | 37 | 1/3 | 0.5 s |
| [twentyhq/twenty](https://github.com/twentyhq/twenty/tree/ad7f4e9d8bb9d3d7e253a3f4d6f467aed9a96c72) | 11,382 | 698,892 | **3.8%** | 26.5% | 4.9% | 920 (25/108/787) | 397 | 1/3 | 3.8 s |
| [makeplane/plane](https://github.com/makeplane/plane/tree/a9e70360c5bc5b1beb5f70fe4c2fa765743147ec) | 1,842 | 160,578 | **13.2%** | – | 7.6% | 269 (17/41/211) | 100 | 3/3 | 0.6 s |
| [bluesky-social/social-app](https://github.com/bluesky-social/social-app/tree/1a1a3ceea1e72b62496e954619d7d8715717689c) | 2,005 | 271,951 | **6.2%** | 12.3% | 4.6% | 295 (30/48/217) | 21 | 3/3 | 1.0 s |
| [signalapp/Signal-Desktop](https://github.com/signalapp/Signal-Desktop/tree/17502b9d1a9e34af689f31508c4ac4ccee5b5cb7) | 2,684 | 499,021 | **3.3%** | 27.2% | 5.2% | 617 (15/95/507) | 50 | 3/3 | 1.9 s |
| [grafana/grafana](https://github.com/grafana/grafana/tree/e0555671bcb0a46fe9bd97114ee4700566e6c44a) | 7,164 | 1,056,685 | **3.8%** | 30.1% | 8.3% | 3,202 (127/416/2659) | 429 | 2/3 | 12.2 s |
| [getsentry/sentry](https://github.com/getsentry/sentry/tree/2894b630364ed2d1f38db38c9474d6a4a3851b59) | 8,703 | 1,266,660 | **6.3%** | 33.1% | 9.9% | 2,359 (80/298/1981) | 855 | 3/3 | 9.9 s |
| [PostHog/posthog](https://github.com/PostHog/posthog/tree/0ee77d1d3dca8a6f357bebf7dba915e1dcda6cef) | 6,111 | 1,154,084 | **3.5%** | 16.1% | 3.7% | 1,375 (54/141/1180) | 71 | 3/3 | 8.1 s |

Median cloned production code: **3.8%** (range 1.7–13.2%).

### What gets cloned

Clone classes by the kind of unit most of their copies are (heuristic: hooks start with `use`, components are capitalized units in `.jsx`/`.tsx` files, tests and stories by file path):

| App | Components | Hooks | Other production | Tests | Stories |
|---|---:|---:|---:|---:|---:|
| excalidraw | 5.9% | 0.0% | 15.0% | 79.1% | 0.0% |
| outline | 8.4% | 2.1% | 59.7% | 29.8% | 0.0% |
| mastodon | 20.0% | 2.1% | 64.2% | 10.5% | 3.2% |
| element-web | 1.5% | 0.3% | 9.2% | 89.0% | 0.0% |
| jitsi-meet | 16.5% | 0.0% | 82.4% | 1.2% | 0.0% |
| twenty | 7.2% | 5.7% | 16.7% | 59.7% | 10.8% |
| plane | 22.7% | 1.1% | 76.2% | 0.0% | 0.0% |
| bluesky | 21.7% | 10.2% | 40.0% | 28.1% | 0.0% |
| signal-desktop | 4.4% | 0.3% | 26.4% | 53.6% | 15.2% |
| grafana | 2.5% | 0.3% | 10.7% | 86.4% | 0.0% |
| sentry | 5.1% | 1.3% | 16.1% | 75.9% | 1.6% |
| posthog | 8.4% | 0.1% | 27.6% | 58.6% | 5.2% |

All apps together: 10,414 clone classes; components 5.9%, hooks 1.3%, other production 20.1%, tests 69.7%, stories 2.9%. Type-1/2/3 split of classes: 3.8% / 12.9% / 83.3%.
