import { syncDbModels } from 'orms/pepperDb';

describe('## Init Data', () => {

  beforeAll(async () => {
    await syncDbModels();
    console.log("synchgehujub");  });

  test('Db initialized', () => expect(true).toBe(true))
});