export class GherkinToJestGenerator {
  generateTest(gherkinDocument: any): string {
    const feature = gherkinDocument.feature;
    if (!feature) {
      throw new Error('No feature found in Gherkin document');
    }

    let testCode = `describe('${feature.name}', () => {\n`;

    feature.children?.forEach(child => {
      if (child.scenario) {
        testCode += this.generateScenarioCode(child.scenario);
      } else if (child.background) {
        testCode += this.generateBackgroundCode(child.background);
      }
    });

    testCode += '});\n';
    return testCode;
  }

  private generateScenarioCode(scenario: any): string {
    let code = `  it('${scenario.name}', async () => {\n`;

    // Generate setup code for the scenario
    code += `    let result;\n`;
    code += `    const context = {};\n\n`;

    // Process each step
    scenario.steps?.forEach(step => {
      code += this.stepToExpectation(step);
    });

    code += '  });\n\n';
    return code;
  }

  private generateBackgroundCode(background: any): string {
    let code = `  beforeEach(() => {\n`;
    background.steps?.forEach(step => {
      code += this.stepToExpectation(step);
    });
    code += '  });\n\n';
    return code;
  }

  private stepToExpectation(step: any): string {
    const keyword = step.keyword?.trim();
    const text = step.text;

    switch (keyword) {
      case 'Given':
        return this.generateGivenStep(text);
      case 'When':
        return this.generateWhenStep(text);
      case 'Then':
        return this.generateThenStep(text);
      case 'And':
      case 'But':
        return this.generateAndStep(text);
      default:
        return `    // TODO: Implement ${keyword} step: ${text}\n`;
    }
  }

  private generateGivenStep(text: string): string {
    return `    // Given: ${text}
    const mockContext = setupTestContext();
    ${this.generateMockSetup(text)}\n`;
  }

  private generateWhenStep(text: string): string {
    return `    // When: ${text}
    result = await executeAction(${this.extractActionParams(text)});\n`;
  }

  private generateThenStep(text: string): string {
    const { expectation, value } = this.parseExpectation(text);
    return `    // Then: ${text}
    expect(result).${expectation}(${value});\n`;
  }

  private generateAndStep(text: string): string {
    return `    // And: ${text}
    expect(result).toBeTruthy(); // Default assertion\n`;
  }

  private parseExpectation(text: string): { expectation: string; value: string } {
    if (text.includes('should be')) {
      return { expectation: 'toBe', value: this.extractExpectedValue(text) };
    }
    if (text.includes('should contain')) {
      return { expectation: 'toContain', value: this.extractExpectedValue(text) };
    }
    return { expectation: 'toBeTruthy', value: '' };
  }

  private extractExpectedValue(text: string): string {
    const match = text.match(/(?:be|contain)\s+(.+)$/);
    return match ? `"${match[1]}"` : 'true';
  }

  private generateMockSetup(text: string): string {
    if (text.includes('user exists')) {
      return `    const mockUser = {
      id: 1,
      username: 'testUser',
      isRegistered: true
    };
    mockContext.setUser(mockUser);`;
    }
    return '';
  }

  private extractActionParams(text: string): string {
    if (text.includes('enters')) {
      return `{
      username: 'testUser',
      password: 'testPassword'
    }`;
    }
    return '{}';
  }
}
