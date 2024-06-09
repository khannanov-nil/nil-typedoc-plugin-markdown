// @ts-check

import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';

/**
 * Local plugin to tweak TypeDoc output for nextra docs
 *
 *  @param {import("typedoc-plugin-markdown").MarkdownApplication} app
 */
export function load(app) {
  writeMetaJsFiles(app);
}

/**
 * Writes Nextra _meta.js files to fix-up navigation labels.
 *
 *  @param {import("typedoc-plugin-markdown").MarkdownApplication} app
 */
function writeMetaJsFiles(app) {
  app.renderer.postRenderAsyncJobs.push(async (output) => {
    /**
     *
     * @param {import("typedoc-plugin-markdown").NavigationItem[]} navigationItems
     * @param {string} outputDirectory
     * @param {Record<string,string>} defaultValue
     */
    const metaOut = { index: 'API Index' };

    output.navigation?.forEach((item) => {
      metaOut[item.title] = { type: 'separator', title: item.title };
      if (item.children) {
        item.children.forEach((child) => {
          const key = path.parse(child.path || '').name;
          metaOut[key] = child.title;
        });
      }
    });

    const formatted = await prettier.format(
      `export default ${JSON.stringify(metaOut, null, 2)}`,
      {
        parser: 'typescript',
        singleQuote: true,
        trailingComma: 'all',
      },
    );

    fs.writeFileSync(path.join(output.outputDirectory, '_meta.js'), formatted);
  });
}

export function slugifyUrl(url) {
  return url
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
