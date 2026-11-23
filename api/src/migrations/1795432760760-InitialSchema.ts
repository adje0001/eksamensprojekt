import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * InitialSchema: the chat app's first schema.
 *
 * Generated with `npm run migration:generate` from the entities, then extended by hand with
 * the DESC index on messages, which TypeORM cannot express in a decorator.
 * Ported from the group's original db/init/01-schema.sql.
 *
 * Runs as chat_admin. Because of the default privileges set in db/init/01-roles.sh,
 * chat_app automatically gets SELECT/INSERT/UPDATE/DELETE on every table created here.
 */
export class InitialSchema1795432760760 implements MigrationInterface {
  name = 'InitialSchema1795432760760';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tables
    await queryRunner.query(
      `CREATE TABLE "users" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "email" character varying(254) NOT NULL, "username" character varying(30) NOT NULL, "password_hash" character(60) NOT NULL, "role" character varying(20) NOT NULL DEFAULT 'user', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "conversations" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "title" character varying(100), "is_group" boolean NOT NULL DEFAULT false, "created_by" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "conversation_participants" ("conversation_id" integer NOT NULL, "user_id" integer NOT NULL, "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_fdcd6405d74e797f10fa8360338" PRIMARY KEY ("conversation_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "messages" ("id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL, "conversation_id" integer NOT NULL, "sender_id" integer, "body" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`,
    );

    // Indexes. Postgres does not index foreign keys automatically.
    // Find the conversations a user is part of
    await queryRunner.query(
      `CREATE INDEX "idx_participants_user" ON "conversation_participants" ("user_id")`,
    );
    // Fetch messages in a conversation, newest first (written by hand)
    await queryRunner.query(
      `CREATE INDEX "idx_messages_conversation_created" ON "messages" ("conversation_id", "created_at" DESC)`,
    );

    // Foreign keys
    // Conversation stays if its creator is deleted
    await queryRunner.query(
      `ALTER TABLE "conversations" ADD CONSTRAINT "FK_81d92d15c62b3fff79c617c9043" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    // Participants disappear with their conversation or user
    await queryRunner.query(
      `ALTER TABLE "conversation_participants" ADD CONSTRAINT "FK_1559e8a16b828f2e836a2312800" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_participants" ADD CONSTRAINT "FK_377d4041a495b81ee1a85ae026f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    // Messages disappear with their conversation
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    // Messages stay if the sender is deleted (sender_id = NULL, "deleted user")
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_22133395bd13b970ccd0c34ab22" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse order of up()
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_22133395bd13b970ccd0c34ab22"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_participants" DROP CONSTRAINT "FK_377d4041a495b81ee1a85ae026f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_participants" DROP CONSTRAINT "FK_1559e8a16b828f2e836a2312800"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversations" DROP CONSTRAINT "FK_81d92d15c62b3fff79c617c9043"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_messages_conversation_created"`);
    await queryRunner.query(`DROP INDEX "public"."idx_participants_user"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "conversation_participants"`);
    await queryRunner.query(`DROP TABLE "conversations"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
