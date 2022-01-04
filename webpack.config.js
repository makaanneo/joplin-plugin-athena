// -----------------------------------------------------------------------------
// This file is used to build the plugin file (.jpl) and plugin info (.json). It
// is recommended not to edit this file as it would be overwritten when updating
// the plugin framework. If you do make some changes, consider using an external
// JS file and requiring it here to minimize the changes. That way when you
// update, you can easily restore the functionality you've added.
// -----------------------------------------------------------------------------

const path = require('path');
const crypto = require('crypto');
const fs = require('fs-extra');
const chalk = require('chalk');
const CopyPlugin = require('copy-webpack-plugin');
const tar = require('tar');
const glob = require('glob');
const execSync = require('child_process').execSync;
const webpack = require('webpack'); //to access built-in plugins
const { ModuleFilenameHelpers } = require('webpack');
const rootDir = path.resolve(__dirname);
const userConfigFilename = './plugin.config.json';
const userConfigPath = path.resolve(rootDir, userConfigFilename);
const distDir = path.resolve(rootDir, 'dist');
const srcDir = path.resolve(rootDir, 'src');
const publishDir = path.resolve(rootDir, 'publish');

const userConfig = Object.assign(
  {},
  {
    extraScripts: []
  },
  fs.pathExistsSync(userConfigPath) ? require(userConfigFilename) : {}
);

const manifestPath = `${srcDir}/manifest.json`;
const packageJsonPath = `${rootDir}/package.json`;
const manifest = readManifest(manifestPath);
const pluginArchiveFilePath = path.resolve(publishDir, `${manifest.id}.jpl`);
const pluginInfoFilePath = path.resolve(publishDir, `${manifest.id}.json`);

function validatePackageJson() {
  const content = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (!content.name || content.name.indexOf('joplin-plugin-') !== 0) {
    console.warn(
      chalk.yellow(
        `WARNING: To publish the plugin, the package name should start with "joplin-plugin-" (found "${content.name}") in ${packageJsonPath}`
      )
    );
  }

  if (!content.keywords || content.keywords.indexOf('joplin-plugin') < 0) {
    console.warn(
      chalk.yellow(
        `WARNING: To publish the plugin, the package keywords should include "joplin-plugin" (found "${JSON.stringify(
          content.keywords
        )}") in ${packageJsonPath}`
      )
    );
  }

  if (content.scripts && content.scripts.postinstall) {
    console.warn(
      chalk.yellow(
        `WARNING: package.json contains a "postinstall" script. It is recommended to use a "prepare" script instead so that it is executed before publish. In ${packageJsonPath}`
      )
    );
  }
}

function fileSha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function currentGitInfo() {
  try {
    let branch = execSync('git rev-parse --abbrev-ref HEAD', { stdio: 'pipe' })
      .toString()
      .trim();
    const commit = execSync('git rev-parse HEAD', { stdio: 'pipe' })
      .toString()
      .trim();
    if (branch === 'HEAD') branch = 'master';
    return `${branch}:${commit}`;
  } catch (error) {
    const messages = error.message ? error.message.split('\n') : [''];
    console.info(
      chalk.cyan(
        'Could not get git commit (not a git repo?):',
        messages[0].trim()
      )
    );
    console.info(
      chalk.cyan('Git information will not be stored in plugin info file')
    );
    return '';
  }
}

function readManifest(manifestPath) {
  const content = fs.readFileSync(manifestPath, 'utf8');
  const output = JSON.parse(content);
  if (!output.id)
    throw new Error(`Manifest plugin ID is not set in ${manifestPath}`);
  return output;
}

function createPluginArchive(sourceDir, destPath) {
  const distFiles = glob
    .sync(`${sourceDir}/**/*`, { nodir: true })
    .map((f) => f.substr(sourceDir.length + 1));

  if (!distFiles.length)
    throw new Error(
      'Plugin archive was not created because the "dist" directory is empty'
    );
  fs.removeSync(destPath);

  tar.create(
    {
      strict: true,
      portable: true,
      file: destPath,
      cwd: sourceDir,
      sync: true
    },
    distFiles
  );

  console.info(chalk.cyan(`Plugin archive has been created in ${destPath}`));
}

function createPluginInfo(manifestPath, destPath, jplFilePath) {
  const contentText = fs.readFileSync(manifestPath, 'utf8');
  const content = JSON.parse(contentText);
  content._publish_hash = `sha256:${fileSha256(jplFilePath)}`;
  content._publish_commit = currentGitInfo();
  fs.writeFileSync(destPath, JSON.stringify(content, null, '\t'), 'utf8');
}

class OnBuildCompletedPlugin {
  static defaultOptions = {
    defaultOnDoneCallback: null
  };
  constructor(options = {}) {
    this.defaultOnDoneCallback = options.callback;
    this.options = { options };
  }
  apply(compiler) {
    compiler.hooks.done.tapAsync(
      'OnBuildCompletedPlugin',
      (compilation, callback) => {
        console.log('Prepare Joplin Plugin files!');
        this.defaultOnDoneCallback();
        callback();
      }
    );
  }
}

class CleanUpBefore {
  static defaultOptions = {
    defaultOnDoneCallback: null
  };
  constructor(options = {}) {
    this.defaultOnDoneCallback = options.callback;
    this.options = { options };
  }
  apply(compiler) {
    compiler.hooks.beforeRun.tapAsync(
      'CleanUpBefore',
      (compilation, callback) => {
        console.log('Clean Up Before!');
        this.defaultOnDoneCallback();
        callback();
      }
    );
  }
}

function onBeforeBuild() {
  try {
    fs.removeSync(distDir);
    fs.removeSync(path.resolve(distDir, '__tests__'));
    fs.removeSync(publishDir);
    fs.mkdirpSync(publishDir);
    console.info(chalk.cyan('Build output cleanup'));
  } catch (error) {
    console.error(chalk.red(error.message));
  }
}

function onBuildCompleted() {
  try {
    fs.removeSync(path.resolve(publishDir, 'index.js'));
    fs.removeSync(path.resolve(distDir, '__tests__'));
    fs.removeSync(path.resolve(publishDir, '__tests__'));
    createPluginArchive(distDir, pluginArchiveFilePath);
    createPluginInfo(manifestPath, pluginInfoFilePath, pluginArchiveFilePath);
    validatePackageJson();
    console.info(chalk.cyan('Create Joplin Plugin files.'));
  } catch (error) {
    console.error(chalk.red(error.message));
  }
}

const baseConfig = {
  mode: 'production',
  target: 'node',
  stats: 'errors-only',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};

const pluginConfig = Object.assign({}, baseConfig, {
  entry: './src/index.ts',
  name: 'pluginConfig',
  resolve: {
    alias: {
      api: path.resolve(__dirname, 'api'),
      canvas: false
    },
    fallback: {
      assert: require.resolve('assert'),
      buffer: require.resolve('buffer'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url'),
      zlib: require.resolve('browserify-zlib')
    },
    // JSON files can also be required from scripts so we include this.
    // https://github.com/joplin/plugin-bibtex/pull/2
    extensions: ['.tsx', '.ts', '.js', '.json']
  },
  output: {
    filename: 'index.js',
    path: distDir
  },
  plugins: [
    new CleanUpBefore({
      callback: onBeforeBuild
    }),
    new CopyPlugin({
      patterns: [
        {
          from: '**/*',
          context: path.resolve(__dirname, 'src'),
          to: path.resolve(__dirname, 'dist'),
          globOptions: {
            ignore: [
              // All TypeScript files are compiled to JS and
              // already copied into /dist so we don't copy them.
              '**/*.ts',
              '**/*.tsx',
              '**/__tests__/*'
            ]
          }
        }
      ]
    })
  ]
});

const extraScriptConfig = Object.assign({}, baseConfig, {
  name: 'attachContentScripts',
  resolve: {
    alias: {
      api: path.resolve(__dirname, 'api')
    },
    extensions: ['.tsx', '.ts', '.js', '.json']
  }
});

const createArchiveConfig = {
  stats: 'errors-only',
  name: 'createArchiveConfig',
  entry: './dist/index.js',
  resolve: {
    alias: {
      canvas: false
    },
    fallback: {
      assert: require.resolve('assert'),
      buffer: require.resolve('buffer'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url'),
      zlib: require.resolve('browserify-zlib'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      constants: require.resolve('constants-browserify'),
      crypto: require.resolve('crypto-browserify'),
      fs: false
    },
    // JSON files can also be required from scripts so we include this.
    // https://github.com/joplin/plugin-bibtex/pull/2
    extensions: ['.tsx', '.ts', '.js', '.json']
  },
  output: {
    filename: 'index.js',
    path: publishDir
  },
  plugins: [
    new OnBuildCompletedPlugin({
      callback: onBuildCompleted
    })
  ]
};

function resolveExtraScriptPath(name) {
  const relativePath = `./src/${name}`;

  const fullPath = path.resolve(`${rootDir}/${relativePath}`);
  if (!fs.pathExistsSync(fullPath))
    throw new Error(`Could not find extra script: "${name}" at "${fullPath}"`);

  const s = name.split('.');
  s.pop();
  const nameNoExt = s.join('.');

  return {
    entry: relativePath,
    output: {
      filename: `${nameNoExt}.js`,
      path: distDir,
      library: 'default',
      libraryTarget: 'commonjs',
      libraryExport: 'default'
    }
  };
}

function buildExtraScriptConfigs(userConfig) {
  if (!userConfig.extraScripts.length) return [];

  const output = [];
  console.log('Add extra script and config.');
  for (const scriptName of userConfig.extraScripts) {
    const scriptPaths = resolveExtraScriptPath(scriptName);
    output.push(
      Object.assign({}, extraScriptConfig, {
        entry: scriptPaths.entry,
        output: scriptPaths.output
      })
    );
  }
  return output;
}

module.exports = [createArchiveConfig, pluginConfig].concat(
  buildExtraScriptConfigs(userConfig)
);
