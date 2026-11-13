---
name: migration
description: Create a TypeORM migration, update seed data and verify it
disable-model-invocation: true
---
Make a database change safely.

1. Update or create the TypeORM entity. Add `@Index()` on columns used for filtering.
2. Generate the migration: `npm run migration:generate -- <DescriptiveName>`. Never use `synchronize`.
3. Read the generated SQL and explain it to the user in plain words. Check that `down` reverses `up`.
4. Run it on the dev database: `npm run migration:run`. Then revert and run again to prove `down` works.
5. Update the seed script so each entity still has at least 20 realistic rows with relationships.
6. If the app role needs access to a new table, add the GRANT to the role setup script.
7. If an index was added for a query, run `EXPLAIN ANALYZE` on that query and save the output in `docs/db/` for the DB2 synopsis appendix.
8. Run `npm test`.
