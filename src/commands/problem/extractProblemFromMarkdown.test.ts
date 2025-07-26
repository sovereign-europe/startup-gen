import { describe, it, expect } from 'vitest';
import { extractProblemFromMarkdown } from './extractProblemFromMarkdown';

describe('extractProblemFromMarkdown', () => {
  it('should extract problem from basic markdown', () => {
    const markdown = `## Original Problem Statement
This is a test problem.
## Next Section`;
    const result = extractProblemFromMarkdown(markdown);
    expect(result).toBe('This is a test problem.');
  });
});
