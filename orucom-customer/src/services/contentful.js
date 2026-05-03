import { createClient } from 'contentful';
import { CONTENTFULL_SPACE_ID, CONTENTFULL_ACCESS_TOKEN } from '@env';

const client = createClient({
  space: CONTENTFULL_SPACE_ID,
  accessToken: CONTENTFULL_ACCESS_TOKEN,
});

export default client;
