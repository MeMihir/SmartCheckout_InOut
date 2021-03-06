/* eslint-disable max-len */
/* eslint-disable consistent-return */
import { RequestHandler } from 'express';
import Joi, { string } from '@hapi/joi';
import requestMiddleware from '../../middleware/request-middleware';
import Category from '../../models/Category';
import Product from '../../models/Product';

export const updateCategorySchema = Joi.object().keys({
  _id: Joi.string().length(24).required(),
  tag: Joi.string().required()
});

const update: RequestHandler = async (req, res) => {
  const {
    _id
  } = req.body;
  const { tag } = req.body;
  const tagExist = await Category.find({ tag });
  if (tagExist.length === 0) {
    await Category.findOneAndUpdate({ _id },
      { $set: req.body },
      async (err, doc) => {
        if (err) {
          return res.status(500).send({
            error: {
              message: 'Server Error',
              status: 500
            }
          });
        }
        await Product.updateMany({ category: doc.tag }, { $set: { category: tag } }, (error, pdoc) => {
          if (err) {
            return res.status(500).send({
              error: {
                message: 'Server Error',
                status: 500
              }
            });
          }
          return res.send({
            message: 'Updated',
            product: req.body
          });
        });
      });
  } else {
    return res.status(400).send({
      errors:
        {
          message: 'Category Name Exist',
          status: 400
        }
    });
  }
};

export default requestMiddleware(update, { validation: { body: updateCategorySchema } });
