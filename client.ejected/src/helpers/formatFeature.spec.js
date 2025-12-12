import { formatFeatures } from './formatFeatures'
import tracks from './formateFeatures.mock'

describe('formatFeatures', () => {
  it('should return expected', () => {
    expect(formatFeatures('mode', tracks[0].audioFeatures)).toBe('Major')
  })
})
