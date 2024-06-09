/**
 * Describes the options declared by the plugin.
 *
 * @privateRemarks
 *
 * THIS FILE IS AUTO GENERATED FROM THE OPTIONS CONFIG. DO NOT EDIT DIRECTLY
 *
 * @module
 */
export interface PluginOptions {
  /**
   * The path to the VitePress project root.
   */
  docsRoot: string;

  /**
   * Configures the autogenerated VitePress sidebar.
   */
  sidebar: Sidebar;
}

/**
 *
 *
 * @category Options
 */
export interface Sidebar {
  autoConfiguration: boolean;
  format: string;
  pretty: boolean;
  collapsed: boolean;
}
