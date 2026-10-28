// order-router.ts
import { Router, type RequestHandler } from 'express';
import type { EntityManager } from '@mikro-orm/postgresql';
import { BadPage, parsePageQuery, createListOrders, createCursorCodec } from './order-pages.js';
export function createOrderRouter(deps: {
  requireTenantOrdersRead: RequestHandler;
  tenantFor: (req: Parameters<RequestHandler>[0]) => string;
  emForRequest: (req: Parameters<RequestHandler>[0]) => EntityManager;
  cursorKey: Buffer;
}) {
  const router = Router();
  const codec = createCursorCodec(deps.cursorKey);
  router.get('/orders', deps.requireTenantOrdersRead, async (req, res, next) => {
    try {
      const query = parsePageQuery(req.query);
      const tenantId = deps.tenantFor(req); // Verified current membership, never req.query/body.
      const em = deps.emForRequest(req); // Existing RequestContext/fork ownership, not global EM.
      const list = createListOrders((sql, values) => em.execute(sql, values), codec);
      res.json(await list(tenantId, query));
    } catch (error) {
      if (error instanceof BadPage) return res.status(400).json({ message: error.message });
      return next(error);
    }
  });
  return router;
}
