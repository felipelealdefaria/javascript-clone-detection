export interface ThesisResult {
  functions: number
  candidates: number
  clones: number
}

export interface Project {
  id: string
  repo: string
  /** Pinned commit, so the study is reproducible. */
  sha: string
  date: string
  /** Directories to scan, relative to the repository root. */
  dirs: string[]
  group: 'replication' | 'react'
  /** v0.6 results reported in the 2021 thesis (Tables 1–3), at threshold 0.8. */
  thesis?: ThesisResult
}

/**
 * Part 1 replicates the thesis: same projects and folders, at the last commit before the 2021
 * analysis (Oct 1, 2021). Part 2 covers well-known open-source React applications at a commit
 * pinned on Oct 28, 2026.
 */
export const PROJECTS: Project[] = [
  {
    id: 'freecodecamp',
    repo: 'freeCodeCamp/freeCodeCamp',
    sha: 'd5e3979753eb16ac00b8e530e9956eae91126f56',
    date: '2021-09-30',
    dirs: ['api-server/src'],
    group: 'replication',
    thesis: { functions: 158, candidates: 29, clones: 13 },
  },
  {
    id: 'javascript-algorithms',
    repo: 'trekhleb/javascript-algorithms',
    sha: '4548296affb227c29ead868309e48667f8280c55',
    date: '2021-07-26',
    dirs: ['src'],
    group: 'replication',
    thesis: { functions: 192, candidates: 60, clones: 21 },
  },
  {
    id: 'thealgorithms',
    repo: 'TheAlgorithms/JavaScript',
    sha: 'ee605b7694f9237574bd8b6ebbe45da253fd05f8',
    date: '2021-09-27',
    dirs: ['.'],
    group: 'replication',
    thesis: { functions: 385, candidates: 231, clones: 185 },
  },
  {
    id: 'excalidraw',
    repo: 'excalidraw/excalidraw',
    sha: '14bb42edee3d6fee6be264e3ee78670b3b9cee79',
    date: '2026-10-27',
    dirs: ['packages', 'excalidraw-app'],
    group: 'react',
  },
  {
    id: 'outline',
    repo: 'outline/outline',
    sha: '6a2f23c023b952c752dfe025ef0ce2a0083cd0c1',
    date: '2026-10-28',
    dirs: ['app', 'shared'],
    group: 'react',
  },
  {
    id: 'mastodon',
    repo: 'mastodon/mastodon',
    sha: 'b0555670b3d24d6e4a977a6bc3894daa128123fa',
    date: '2026-10-27',
    dirs: ['app/javascript'],
    group: 'react',
  },
  {
    id: 'element-web',
    repo: 'element-hq/element-web',
    sha: 'c4b8799e5581a460f1557f130a74972917011f2d',
    date: '2026-10-27',
    dirs: ['apps/web/src'],
    group: 'react',
  },
  {
    id: 'jitsi-meet',
    repo: 'jitsi/jitsi-meet',
    sha: '0fc01ad1591dad0c92737cf8354376749eafd6dc',
    date: '2026-10-28',
    dirs: ['react'],
    group: 'react',
  },
  {
    id: 'twenty',
    repo: 'twentyhq/twenty',
    sha: 'ad7f4e9d8bb9d3d7e253a3f4d6f467aed9a96c72',
    date: '2026-10-28',
    dirs: ['packages/twenty-front/src'],
    group: 'react',
  },
  {
    id: 'plane',
    repo: 'makeplane/plane',
    sha: 'a9e70360c5bc5b1beb5f70fe4c2fa765743147ec',
    date: '2026-10-26',
    dirs: ['apps/web'],
    group: 'react',
  },
  {
    id: 'bluesky',
    repo: 'bluesky-social/social-app',
    sha: '1a1a3ceea1e72b62496e954619d7d8715717689c',
    date: '2026-10-28',
    dirs: ['src'],
    group: 'react',
  },
  {
    id: 'signal-desktop',
    repo: 'signalapp/Signal-Desktop',
    sha: '17502b9d1a9e34af689f31508c4ac4ccee5b5cb7',
    date: '2026-10-20',
    dirs: ['ts'],
    group: 'react',
  },
  {
    id: 'grafana',
    repo: 'grafana/grafana',
    sha: 'e0555671bcb0a46fe9bd97114ee4700566e6c44a',
    date: '2026-10-28',
    dirs: ['public/app'],
    group: 'react',
  },
  {
    id: 'sentry',
    repo: 'getsentry/sentry',
    sha: '2894b630364ed2d1f38db38c9474d6a4a3851b59',
    date: '2026-10-28',
    dirs: ['static/app'],
    group: 'react',
  },
  {
    id: 'posthog',
    repo: 'PostHog/posthog',
    sha: '0ee77d1d3dca8a6f357bebf7dba915e1dcda6cef',
    date: '2026-10-28',
    dirs: ['frontend/src'],
    group: 'react',
  },
]
