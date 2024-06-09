import { MarkdownThemeContext } from 'theme';
import { DeclarationReflection } from 'typedoc';

/**
 * @category Member Partials
 */
export function typeDeclarationList(
  this: MarkdownThemeContext,
  model: DeclarationReflection[],
  options: { headingLevel: number },
): string {
  const md: string[] = [];
  const declarations = this.helpers.getFlattenedDeclarations(model);
  declarations?.forEach((declaration: DeclarationReflection, i: number) => {
    md.push(
      this.partials.memberContainer(declaration, {
        headingLevel: options.headingLevel + 1,
        nested: true,
      }),
    );
  });

  return md.join('\n\n');
}
