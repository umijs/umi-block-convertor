import { getDependencies } from './index';

describe('getDependencies', () => {
  it('getDependencies return right', () => {
    const deps = getDependencies(`
import test from './test';
import('./testimport');
import './g2';

@import '~@/utils/utils.less';
`);
    expect(deps).toEqual(expect.arrayContaining(['./test', './testimport', './g2', '@/utils/utils.less']));
  })
});
