import { Envelope } from '@cucumber/messages';
import { parseGherkin } from './gherkin.parser';
import { GherkinToJestGenerator } from './gherkin-to-jest-generator.class';

export async function gherkinToJest(gherkinContent: string): Promise<string> {
  try {
    const messages = await parseGherkin(gherkinContent);
    const gherkinDocumentEnvelope = messages.find(
      (m): m is Envelope & { gherkinDocument: NonNullable<Envelope['gherkinDocument']> } =>
        m.gherkinDocument != null,
    );

    if (!gherkinDocumentEnvelope) {
      throw new Error('No Gherkin document found in the parsed messages');
    }

    const gherkinDocument = gherkinDocumentEnvelope.gherkinDocument;
    const generator = new GherkinToJestGenerator();
    return generator.generateTest(gherkinDocument);
  } catch (error) {
    console.error('Error in gherkinToJest:', error);
    throw error;
  }
}
