import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * ReplaceUsernameWithNames: signup uses first name + last name + email, so username goes away.
 *
 * Generated with `npm run migration:generate`, then edited by hand so it also works on a table
 * that already has rows: the new NOT NULL columns get a temporary default, existing users keep
 * their username as first name, and the default is dropped again so the schema matches the entity.
 */
export class ReplaceUsernameWithNames1795437383049 implements MigrationInterface {
  name = 'ReplaceUsernameWithNames1795437383049';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "first_name" character varying(50) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "last_name" character varying(50) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(`UPDATE "users" SET "first_name" = "username"`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "first_name" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_name" DROP DEFAULT`);

    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse order of up(). Usernames must be unique, so rebuild them as user<id>.
    await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying(30)`);
    await queryRunner.query(`UPDATE "users" SET "username" = 'user' || "id"`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`,
    );

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_name"`);
  }
}
