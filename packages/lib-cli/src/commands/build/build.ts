import { ENVS, compile } from '@njt-tools-open/lib-compile';
import { CommandArgs } from '../../typing';

function build(args: CommandArgs) {
  const { multiple, sourcemap } = args.options;
  compile({
    env: ENVS.PRODUCTION,
    multiple,
    sourcemap,
  });
}

export default build;
