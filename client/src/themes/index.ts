import type { Language } from '../lib/invitation-i18n'
import { DanilaTheme } from './danila'
import { NoirTheme } from './noir'

export type { Language }

export interface EventData {
  id: string; title: string; date: string | null; timeStart: string | null; timeEnd: string | null
  locationName: string | null; address: string | null; mapsUrl: string | null
}

export interface MediaData { id: string; type: string; url: string; caption: string | null }
export interface WishData { id: string; name: string; message: string; reply: string | null; likes: number; createdAt: string }

export interface InvitationData {
  id: string; slug: string; title: string | null
  groomName: string | null; groomNickname: string | null; groomParent: string | null
  brideName: string | null; brideNickname: string | null; brideParent: string | null
  primaryColor: string; secondaryColor: string; fontFamily: string
  backgroundMusic: string | null; coverEnabled: boolean; coverMessage: string | null
  events: EventData[]; media: MediaData[]; wishes: WishData[]
  theme?: { id: string; name: string; category: string; isPremium: boolean; defaultColors: string | null; sectionsConfig: string | null } | null
}

export interface ThemeComponentProps {
  data: InvitationData
  slug: string
  lang: Language
  setLang: (lang: Language) => void
  guestName: string | null
  guestCode: string | null
}

export type ThemeComponent = React.ComponentType<ThemeComponentProps>

interface ThemeEntry {
  name: string
  component: ThemeComponent
}

const themeRegistry: ThemeEntry[] = [
  { name: 'Danila Redesign', component: DanilaTheme },
  { name: 'Noir', component: NoirTheme },
]

export function getThemeComponent(name: string): ThemeComponent | null {
  return themeRegistry.find((t) => t.name === name)?.component ?? null
}

export function getThemeNames(): string[] {
  return themeRegistry.map((t) => t.name)
}
