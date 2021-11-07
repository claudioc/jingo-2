import * as supertest from 'supertest';

async function createAuthenticatedRequest(server) {
  const request = supertest.agent(server.app);
  await request.get('/auth/fake-login');
  return request;
}

export default createAuthenticatedRequest;
