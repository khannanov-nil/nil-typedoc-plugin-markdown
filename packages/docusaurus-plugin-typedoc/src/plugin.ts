import * as fs from 'fs';
import * as path from 'path';
import { Application, DeclarationOption } from 'typedoc';
import { MarkdownApplication } from 'nil-typedoc-plugin-markdown';
import { PluginOptions } from './models';
import { getPluginOptions } from './options';
import * as options from './options/declarations';
import { getSidebar } from './sidebar';
import { adjustBaseDirectory } from './utils/adjust-basedir';

// store list of plugin ids when running multiple instances
const apps: string[] = [];

export default async function pluginDocusaurus(
  context: any,
  opts: Partial<PluginOptions>,
) {
  const PLUGIN_NAME = 'nil-docusaurus-plugin-typedoc';

  if (opts.id && !apps.includes(opts.id)) {
    apps.push(opts.id);
    await generateTypedoc(context, opts);
  }
  return {
    name: PLUGIN_NAME,
    extendCli(cli) {
      cli
        .command('generate-typedoc')
        .description(
          `[${PLUGIN_NAME}] Generate TypeDoc docs independently of the Docusaurus build process.`,
        )
        .action(async () => {
          context.siteConfig?.plugins.forEach((pluginConfig) => {
            // Check PluginConfig is typed to [string, PluginOptions]
            if (pluginConfig && typeof pluginConfig[1] === 'object') {
              generateTypedoc(context, pluginConfig[1]);
            }
          });
        });
    },
  };
}

/**
 * Initiates a new typedoc Application bootstrapped with plugin options
 */
async function generateTypedoc(context: any, opts: Partial<PluginOptions>) {
  const { siteDir } = context;

  const pluginOptions = getPluginOptions(opts);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, sidebar, ...optionsPassedToTypeDoc } = pluginOptions;

  const outputDir = path.join(siteDir, pluginOptions.out);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const app = (await Application.bootstrapWithPlugins(
    optionsPassedToTypeDoc,
  )) as unknown as MarkdownApplication;

  Object.entries(options).forEach(([name, option]) => {
    app.options.addDeclaration({
      name,
      ...option,
    } as DeclarationOption);
  });

  if (sidebar?.autoConfiguration) {
    const docsPreset = context.siteConfig?.presets?.find((preset: any) =>
      Boolean(preset[1]?.docs),
    );

    app.renderer.postRenderAsyncJobs.push(async (output) => {
      if (output.navigation) {
        const sidebarPath = path.resolve(outputDir, 'typedoc-sidebar.cjs');

        let baseDir = path
          .relative(siteDir, outputDir)
          .split(path.sep)
          .slice(1)
          .join('/');

        const docsPresetPath = docsPreset ? docsPreset[1]?.docs?.path : null;

        if (docsPresetPath) {
          baseDir = adjustBaseDirectory(baseDir, docsPresetPath);
        }

        const sidebarJson = getSidebar(
          output.navigation,
          baseDir,
          docsPreset ? docsPreset[1]?.docs?.numberPrefixParser : null,
        );
        fs.writeFileSync(
          sidebarPath,
          `// @ts-check
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const typedocSidebar = { items: ${JSON.stringify(
            sidebarJson,
            null,
            sidebar.pretty ? 2 : 0,
          )}};
module.exports = typedocSidebar.items;`,
        );
      }
    });
  }

  const project = await app.convert();

  // if project is undefined typedoc has a problem - error logging will be supplied by typedoc.
  if (!project) {
    if (app.options.getValue('skipErrorChecking')) {
      return;
    }
    console.error(
      '[docusaurus-plugin-typedoc] TypeDoc exited with an error. Use the "skipErrorChecking" option to disable TypeDoc error checking.',
    );
    process.exit(1);
  }

  if (app.options.getValue('watch')) {
    app.convertAndWatch(async (project) => {
      await app.generateDocs(project, outputDir);
    });
  } else {
    await app.generateDocs(project, outputDir);
  }
}
