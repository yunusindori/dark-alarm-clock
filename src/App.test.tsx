import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('./services/audioEngine', () => {
  return {
    audioEngine: {
      play: vi.fn(() => Promise.resolve()),
      stop: vi.fn(),
    },
  }
})

import App from './App'

describe('App', () => {
  it('can add multiple alarms and select one to edit', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByText('Dark Alarm Clock')).toBeInTheDocument()
    expect(screen.getByLabelText('Alarms list')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '+ Add alarm' }))

    expect(screen.getByText('Alarm 1')).toBeInTheDocument()
    expect(screen.getByText('Alarm 2')).toBeInTheDocument()

    await user.click(screen.getByText('Alarm 2'))

    expect(screen.getByLabelText('Alarm settings: Alarm 2')).toBeInTheDocument()

    // Change label in draft
    const labelInput = screen.getByPlaceholderText('Morning')
    await user.clear(labelInput)
    await user.type(labelInput, 'Office')

    // Without saving, list should still show the old saved label
    expect(screen.getByText('Alarm 2')).toBeInTheDocument()

    // Save and verify list updates
    await user.click(screen.getByRole('button', { name: 'Save / Apply' }))
    expect(screen.getByText('Office')).toBeInTheDocument()
  })
})
