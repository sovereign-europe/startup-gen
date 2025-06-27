import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import { buildCommand } from '../build';

vi.mock('fs-extra');
vi.mock('child_process');
vi.mock('inquirer');
vi.mock('openai');

const mockFs = vi.mocked(fs);
const mockExecSync = vi.mocked(execSync);

describe('build command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFs.writeFile.mockResolvedValue(undefined);
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  describe('customerSegment', () => {
    it('should create customer segment file', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      vi.mocked(inquirer.prompt).mockResolvedValue({
        highLevelDefinition: 'Young professionals in tech',
        additionalRefinement: 'Working in startups'
      });

      const mockOpenAI = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: '# Customer Persona: Alex Johnson\n\nAlex is a 28-year-old software developer...'
                }
              }]
            })
          }
        }
      };

      vi.doMock('openai', () => ({
        default: vi.fn(() => mockOpenAI)
      }));

      await buildCommand.customerSegment();

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/customer-segment-.*\.md/),
        expect.stringContaining('Alex Johnson')
      );
    });

    it('should commit the persona file', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      vi.mocked(inquirer.prompt).mockResolvedValue({
        highLevelDefinition: 'Young professionals',
        additionalRefinement: ''
      });

      const mockOpenAI = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: '# Customer Persona: Sarah Smith\n\nSarah is a professional...'
                }
              }]
            })
          }
        }
      };

      vi.doMock('openai', () => ({
        default: vi.fn(() => mockOpenAI)
      }));

      await buildCommand.customerSegment();

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringMatching(/git add customer-segment-.*\.md/),
        { stdio: 'ignore' }
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        'git commit -m "Add customer segment: Young professionals"',
        { stdio: 'ignore' }
      );
    });
  });
});