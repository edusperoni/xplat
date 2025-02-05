import { Tree } from '@angular-devkit/schematics';
import {
  supportedPlatforms,
  setTest,
  jsonParse,
  supportedFrameworks,
} from '@nstudio/xplat-utils';
import { createEmptyWorkspace } from '@nstudio/xplat/testing';
import { runSchematic } from '../../utils/testing';
import { XplatHelpers, stringUtils } from '../../utils';
import { getFileContent } from '@nrwl/workspace/testing';
setTest();

describe('xplat init', () => {
  let appTree: Tree;
  const defaultOptions: XplatHelpers.Schema = {
    npmScope: 'testing',
    prefix: 'ft', // foo test
    isTesting: true,
  };

  beforeEach(() => {
    appTree = createEmptyWorkspace(Tree.empty());
  });

  it('should init default xplat deps', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'web';
    options.framework = 'angular';

    const tree = await runSchematic('init', options, appTree);
    const files = tree.files;
    // console.log('files:', files);

    let packageJson = JSON.parse(getFileContent(tree, 'package.json'));
    // console.log(packageJson);
    const devDeps = [
      '@nrwl/angular',
      '@nstudio/angular',
      '@nstudio/web-angular',
      '@nstudio/web',
      '@nstudio/xplat',
      '@angular/compiler-cli',
      '@angular/language-service',
    ];
    for (const dep of devDeps) {
      expect(packageJson.devDependencies[dep]).toBeDefined();
    }
  });

  it('should init platform options and set default', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'web,nativescript';
    options.framework = 'angular';

    const tree = await runSchematic('init', options, appTree);
    // const files = tree.files;
    // console.log('files:', files);

    expect(tree.exists('/libs/xplat/web/core/src/lib/index.ts')).toBeTruthy();
    expect(
      tree.exists('/libs/xplat/nativescript/core/src/lib/index.ts')
    ).toBeTruthy();
    expect(
      tree.exists('/libs/xplat/web-angular/core/src/lib/index.ts')
    ).toBeFalsy();
    expect(
      tree.exists('/libs/xplat/nativescript-angular/core/src/lib/index.ts')
    ).toBeFalsy();

    let packageJson = JSON.parse(getFileContent(tree, 'package.json'));
    // console.log(packageJson);
    expect(packageJson.xplat.framework).toBe('angular');
  });

  it('should NOT create unsupported platform xplat option and throw', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'desktop';

    await expect(runSchematic('init', options, appTree)).rejects.toThrow(
      `desktop is currently not a supported platform. Supported at the moment: ${supportedPlatforms}. Please request support for this platform if you'd like and/or submit a PR which we would greatly appreciate.`
    );
  });

  it('should NOT create unsupported framework xplat option and throw', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'web';
    options.framework = 'blah';

    let tree;
    await expect(runSchematic('init', options, appTree)).rejects.toThrow(
      `blah is currently not a supported framework. Supported at the moment: ${supportedFrameworks.map(
        (f) => stringUtils.capitalize(f)
      )}. Please request support for this framework if you'd like and/or submit a PR which we would greatly appreciate.`
    );
  });

  /**
   * TODO: This passes when run with "fdescribe" only
   * However beforeEach does not appear to be emptying tree before running. very strange.
   * Investigate when can.
   */
  // describe('no framework', () => {
  //   it('should init and not set framework as default', async () => {
  //     const options: XplatHelpers.Schema = { ...defaultOptions };
  //     options.platforms = 'web';

  //     appTree = createEmptyWorkspace(Tree.empty());
  //     const tree = await runSchematic('init', options, appTree);
  //     const files = tree.files;
  //     console.log('files:', files);
  //     expect(tree.exists('/xplat/web/scss/_index.scss')).toBeTruthy();
  //     expect(tree.exists('/libs/scss/_index.scss')).toBeTruthy();
  //     let packageJson = JSON.parse(getFileContent(tree, 'package.json'));
  //     // console.log(packageJson);
  //     expect(packageJson.xplat.framework).toBeUndefined();
  //   });
  // });
});
