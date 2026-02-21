export type ToneId = 'beep' | 'chime' | 'digital' | 'bell'

export type ToneMeta = {
  id: ToneId
  label: string
  description: string
}

export const TONES: ToneMeta[] = [
  { id: 'beep', label: 'Beep', description: 'Simple repeating beep' },
  { id: 'chime', label: 'Chime', description: 'Soft chime-like tone' },
  { id: 'digital', label: 'Digital', description: 'Digital alarm tone' },
  { id: 'bell', label: 'Bell', description: 'Bell-like ring' },
]

