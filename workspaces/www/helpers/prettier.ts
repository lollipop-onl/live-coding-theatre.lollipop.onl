import type { Options } from 'prettier';

export const formatCode = async (
  code: string,
  options: Options = {}
): Promise<string> => {
  const prettier = await import('prettier/standalone');
  const parserBabel = await import('prettier/parser-babel');

  try {
    return prettier.format(code, {
      singleQuote: true,
      parser: 'babel',
      plugins: [parserBabel],
      ...options,
    });
  } catch (err) {
    return code;
  }
};
