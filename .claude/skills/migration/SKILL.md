---
name: migration
description: Create a TypeORM migration, update seed data and verify it
disable-model-invocation: true
---
Make a database change safely. Run commands inside `api/`. The dev DB must be running (`docker compose up -d db`).

1. Update or create the TypeORM entity in its feature folder (`api/src/<feature>/entities/<name>.entity.ts`). Add `@Index()` on columns used for filtering. Register new entities in `api/src/db/config.ts` and in the feature module with `TypeOrmModule.forFeature()`.
2. Generate the migration: `npm run migration:generate -- src/migrations/<DescriptiveName>`. Never use `synchronize`. Never edit a migration that is already on main.
3. Read the generated SQL and explain it to the user in plain words. Add short comments. Check that `down` reverses `up` in reverse order.
4. If you need something TypeORM cannot express (e.g. a DESC index), write it by hand in the migration and mark the entity index with `synchronize: false`.
5. Run it: `npm run migration:run`. Then `npm run migration:revert` and `npm run migration:run` again to prove `down` works.
6. Check for drift: `npm run migration:generate -- src/migrations/Check --check` must report no changes.
7. Update `db/seed/seed.sql` so each entity still has at least 20 realistic rows with relationships. Run `npm run seed`.
8. chat_app gets rights on new tables automatically (default privileges in `db/init/01-roles.sh`). Do not add GRANTs by hand.
9. If an index was added for a query, run `EXPLAIN ANALYZE` on that query before and after, and save the output in `docs/db/` for the DB2 synopsis appendix.
10. Run `npm run lint` and `npm test`.
