import { ENVS, compile } from '@njt-tools-open/lib-compile';
import { CommandArgs } from '../../typing';

function dev(args: CommandArgs): void {
  const { multiple, sourcemap } = args.options;
  compile({
    env: ENVS.DEVELOPMENT,
    multiple,
    sourcemap,
  });
}

export default dev;
