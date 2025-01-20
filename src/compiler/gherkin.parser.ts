import { GherkinStreams } from '@cucumber/gherkin-streams';
import {
  Envelope,
  IdGenerator,
  GherkinDocument,
  Source,
  SourceMediaType,
} from '@cucumber/messages';

export async function parseGherkin(gherkinContent: string): Promise<Envelope[]> {
  const newId = IdGenerator.uuid();
  const source: Source = {
    uri: 'test.feature',
    data: gherkinContent,
    mediaType: SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN,
  };

  const envelope: Envelope = {
    source,
  };

  const envelopes = GherkinStreams.fromSources([envelope], { newId });

  return new Promise((resolve, reject) => {
    const messages: Envelope[] = [];
    envelopes.on('data', (envelope: Envelope) => messages.push(envelope));
    envelopes.on('end', () => resolve(messages));
    envelopes.on('error', (err: Error) => reject(err));
  });
}
