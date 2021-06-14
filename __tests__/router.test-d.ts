import { expectType } from 'tsd';

import type { ParseRouteParams } from '../src/modules/router';

{
  const path = '/users/:userId/books/:bookId' as const;
  // const url = 'http://localhost:3000/users/34/books/8989';
  const params = { userId: '34', bookId: '8989' };
  const parsed = '' as ParseRouteParams<typeof path>;
  expectType<keyof typeof params>(parsed);
}

// NOT SUPPORTED
// {
//   const path = '/flights/:from-:to' as const;
//   // const url = 'http://localhost:3000/flights/LAX-SFO';
//   const params = { from: 'LAX', to: 'SFO' };
//   const parsed = '' as ParseRouteParams<typeof path>;
//   expectType<keyof typeof params>(parsed);
// }

// NOT SUPPORTED
// {
//   const path = '/plantae/:genus.:species' as const;
//   // const url = 'http://localhost:3000/plantae/Prunus.persica';
//   const params = { genus: 'Prunus', species: 'persica' };
//   const parsed = '' as ParseRouteParams<typeof path>;
//   expectType<keyof typeof params>(parsed);
// }

// NOT SUPPORTED
// {
//   const path = '/user/:userId(d+)' as const;
//   // const url = 'http://localhost:3000/user/42';
//   const params = { userId: '42' };
//   const parsed = '' as ParseRouteParams<typeof path>;
//   expectType<keyof typeof params>(parsed);
// }
