import { ScoringService } from '../src/services/recommendation/scoring.service';

describe('ScoringService Unit Tests', () => {
  let scoringService: ScoringService;

  beforeEach(() => {
    scoringService = new ScoringService();
  });

  test('should calculate correct positive signal base score for read_complete', () => {
    const scores = (scoringService as any).EVENT_SCORES;
    expect(scores.read_complete).toBe(5);
    expect(scores.like).toBe(8);
    expect(scores.bookmark).toBe(10);
    expect(scores.share).toBe(12);
  });

  test('should calculate correct negative signal score for not_interested', () => {
    const scores = (scoringService as any).EVENT_SCORES;
    expect(scores.not_interested).toBe(-10);
  });
});
