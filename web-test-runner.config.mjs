import rollupCommonjs from '@rollup/plugin-commonjs';
import {esbuildPlugin} from '@web/dev-server-esbuild';
import {fromRollup} from '@web/dev-server-rollup';
import {playwrightLauncher} from '@web/test-runner-playwright';
import {fileURLToPath} from 'node:url';

const commonjs = fromRollup(rollupCommonjs);

export default {
	port: 9876,
	nodeResolve: true,
	coverage: true,
	coverageConfig: {
		include: ['src/**/*'],
	},
	files: ['tests/*.js'],
	browsers: [
		playwrightLauncher({product: 'chromium'}),
		playwrightLauncher({product: 'firefox'}),
		playwrightLauncher({product: 'webkit'}),
	],
	plugins: [
		commonjs({
			strictRequires: 'auto',
			include: [
				'**/node_modules/nette-forms/**/*',
			],
		}),
		esbuildPlugin({
			ts: true,
			tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
		}),
	],
};
