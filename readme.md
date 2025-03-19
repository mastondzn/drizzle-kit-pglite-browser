# drizzle-kit example usage with pglite and indexeddb persistence

We use drizzle-kit to generate the migrations, the frontend reads them via import and runs them similarly to drizzle-orm internal migrator.
The project contains a simple kv table and a random frontend made with Claude.

Notable files:

- [`src/db/migrate.ts`](src/db/migrate.ts) - the migrator function
