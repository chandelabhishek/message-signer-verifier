/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  await knex.schema
    .createTable("api_call_log", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
      table.text("request_message");
      table.text("webhook_url");
      table.text("response");
      table.uuid("client_request_id");
      table.integer("request_status");
      table.datetime("created_at").defaultTo("now()");
      table.dateTime("updated_at").defaultTo("now()");
      table.boolean("retry_scheduled").notNullable().defaultTo(false);
      table.index(["request_message"], "idx_api_call_log_request_message");
    })
    .createTable("webhook_call_log", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
      table.text("response");
      table.integer("retries");
      table.dateTime("last_call_at").defaultTo("now()");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function down(knex) {
  return knex.schema.dropTable("api_call_log").dropTable("webhook_call_log");
};
