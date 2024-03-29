export interface User {
  id: string;
  displayName?: string;
  name: { familyName: string; givenName: string };
  emails: [{ value: string; type: string }];
  provider: string;
}

const mockUser: User = {
  id: '1234',
  displayName: 'Foo Bar',
  name: { familyName: 'Bar', givenName: 'Foo' },
  emails: [{ value: 'foo@bar.com', type: 'account' }],
  provider: 'mock'
};

export default mockUser;
