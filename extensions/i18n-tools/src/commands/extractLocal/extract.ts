// 魔改自 @formatjs/cli/src/extract.ts
import {warn, debug} from '@formatjs/cli/src/console_utils';
import {readFile} from 'fs-extra';
import { interpolateName, Opts } from '@formatjs/ts-transformer';

import { ExtractOpts, ExtractedMessageDescriptor, ExtractionResult } from '@formatjs/cli/src/extract';
import {parseScript} from '@formatjs/cli/src/parse_script';

export interface MessageDescriptor {
  id: string;
  files: string[];
}

function calculateLineColFromOffset(
  text: string,
  start?: number
): Pick<ExtractedMessageDescriptor, 'line' | 'col'> {
  if (!start) {
    return {line: 1, col: 1};
  }
  const chunk = text.slice(0, start);
  const lines = chunk.split('\n');
  const lastLine = lines[lines.length - 1];
  return {line: lines.length, col: lastLine.length};
}

function processFile(
  source: string,
  fn: string,
  {idInterpolationPattern, ...opts}: Opts & {idInterpolationPattern?: string}
) {
  let messages: ExtractedMessageDescriptor[] = [];
  let meta: Record<string, string> | undefined;

  opts = {
    ...opts,
    additionalComponentNames: [
      '$formatMessage',
      ...(opts.additionalComponentNames || []),
    ],
    onMsgExtracted(_, msgs) {
      if (opts.extractSourceLocation) {
        msgs = msgs.map(msg => ({
          ...msg,
          ...calculateLineColFromOffset(source, msg.start),
        }));
      }
      messages = messages.concat(msgs);
    },
    onMetaExtracted(_, m) {
      meta = m;
    },
  };

  if (!opts.overrideIdFn && idInterpolationPattern) {
    opts = {
      ...opts,
      overrideIdFn: (id, defaultMessage, description, fileName) =>
        id ||
        interpolateName(
          {
            resourcePath: fileName,
          } as any,
          idInterpolationPattern,
          {
            content: description
              ? `${defaultMessage}#${description}`
              : defaultMessage,
          }
        ),
    };
  }

  debug('Processing opts for %s: %s', fn, opts);

  const scriptParseFn = parseScript(opts, fn);

  debug('Processing %s using typescript extractor', fn);
  scriptParseFn(source);
  debug('Done extracting %s messages: %s', fn, messages);
  if (meta) {
    debug('Extracted meta:', meta);
    messages.forEach(m => (m.meta = meta));
  }
  return {messages, meta};
}

/**
 * Extract strings from source files
 * @param files list of files
 * @param extractOpts extract options
 * @returns messages serialized as JSON string since key order
 * matters for some `format`
 */
export async function extract(
  files: readonly string[],
  extractOpts: ExtractOpts
) {
  const {throws, readFromStdin, flatten, ...opts} = extractOpts;
  let rawResults: Array<ExtractionResult | undefined>;
  rawResults = await Promise.all(
    files.map(async fn => {
      debug('Extracting file:', fn);
      try {
        const source = await readFile(fn, 'utf8');
        return processFile(source, fn, opts);
      } catch (e: any) {
        if (throws) {
          throw e;
        } else {
          warn(e);
        }
      }
    })
  );

  const extractionResults = rawResults.filter((r): r is ExtractionResult => !!r);

  const extractedMessages = new Map<string, MessageDescriptor>();

  for (const {messages} of extractionResults) {
    for (const message of messages) {
      const { id } = message;
      if (!id) {
        const error = new Error(
          `[FormatJS CLI] Missing message id for message: 
${JSON.stringify(message, undefined, 2)}`
        );
        if (throws) {
          throw error;
        } else {
          warn(error.message);
        }
        continue;
      }

      // @ts-expect-error
      extractedMessages.set(id, {id, files: [...(extractedMessages.get(id)?.files || []), message]});
    }
  }
  const results: Record<string, any[]> = {};
  const messages = Array.from(extractedMessages.values());
  for (const { id, files } of messages) {
    results[id] = files;
  }
  return results;
}