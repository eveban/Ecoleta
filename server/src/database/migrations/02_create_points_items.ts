import Knex from 'knex'

export async function up(knex: Knex){
  return knex.schema.createTable('points_items',table => {
    table.increments('id').primary();

    table.integer('points_id').notNullable();
    table.foreign('points_id').references('id').inTable('points');

    table.integer('items_id').notNullable();
    table.foreign('items_id').references('id').inTable('items')
  })
}
export async function down(knex: Knex){
  return knex.schema.dropTable('items');
}