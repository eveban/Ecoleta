import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    console.log(parsedItems);

    const points = await knex('points')
      .join('points_items', 'points.id', '=', 'points_items.points_id')
      .whereIn('points_items.items_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    const serializedPoint = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.1.14:3333/uploads/${point.image}`,
      };
    });

    return response.json(serializedPoint);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;
    const point = await knex('points').where('id', id).first();
    if (!point) {
      return response.status(400).json({ message: 'Point not found' });
    }

    const serializedPoint = {
      ...point,
      image_url: `http://192.168.1.14:3333/uploads/${point.image}`,
    };

    const items = await knex('items')
      .join('points_items', 'items.id', '=', 'points_items.items_id')
      .where('points_items.points_id', id)
      .select('items.title');

    return response.json({ point: serializedPoint, items });
  }

  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      number,
      items,
    } = request.body;
    console.log(request.body);
    const trx = await knex.transaction();
    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      number,
    };

    const insertedIds = await trx('points').insert(point);

    const points_id = insertedIds[0];

    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((items_id: number) => {
        return {
          items_id,
          points_id,
        };
      });

    await trx('points_items').insert(pointItems);

    await trx.commit();

    return response.json({
      id: points_id,
      ...point,
    });
  }
}

export default PointsController;
