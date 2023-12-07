import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import sequelize from '../utils/database.js';

import ProductCategories from '../models/product/product_categories.js';
import ProductFamilies from '../models/product/product_families.js';
import ProductLines from '../models/product/product_lines.js';
import ProductProducts from '../models/product/product_products.js';

dotenv.config();

const generateFileUrl = (files) => {
  if (files && files.length > 0) {
    const file = files[0];

    return `/${file.path.replace(/\\/g, "/")}`;
  } else {
    return null;
  }
};

export const getProductCategoriesData = (req, res, next) => {

	ProductCategories.hasMany(ProductFamilies, { foreignKey: 'category_id' });
	ProductFamilies.belongsTo(ProductCategories, { foreignKey: 'category_id' });

	ProductCategories.findAll()
	.then((productCategories) => {
    let productCategoriesJSON = [];
    for (let i = 0; i < productCategories.length; i++) {
      productCategoriesJSON.push(productCategories[i].dataValues);
    }		
    res.status(200).json(productCategoriesJSON);
	})
	.catch(err => {
		res.status(502).json({error: "An error occurred"});
	});
};

export const createProductCategory = (req, res, next) => {
  const { category, description } = req.body;
  const imgUrl = generateFileUrl(req.files);

  ProductCategories.create({
    category: category,
    img_url: imgUrl,
    description: description
  })
  .then(newCategory => {
    res.status(201).json({ message: 'Product category created successfully', category: newCategory });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateProductCategory = (req, res, next) => {
  const { id, category, description } = req.body;
  const imgUrl = generateFileUrl(req.files);

  const updateFields = {
    category: category,
    description: description
  };

  if (imgUrl) {
    updateFields.img_url = imgUrl;
  }

  ProductCategories.update(updateFields, { where: { id: id } })
  .then(newCategory => {
    res.status(201).json({ message: 'Product category created successfully', category: newCategory });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const saveProductCategory = (req, res, next) => {
  const { id, column, value } = req.body;
  ProductCategories.findOrCreate({
	where: { id: id, },
	defaults: {
	  [column]: value,
	}}).then(([result, created]) => {
		if (!created) {
		  ProductCategories.update(
				{ [column]: value },
				{ where: { id: id, } }
		  ).then(() => {
				res.status(200).json({ message: "Updated price Successfully" });
		  }).catch((error) => {
				if(error.errors && error.errors[0].validatorKey == 'not_unique'){
					const message = error.errors[0].message;
					const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
					res.status(409).json({ error: capitalizedMessage});
				}else	res.status(500).json({ error: "Internal server error" });
		  });
		} else {
		  res.status(200).json({ message: "Set Product Category Successfully" });
		}
  }).catch((error) => {
		if(error.errors && error.errors[0].validatorKey == 'not_unique'){
			const message = error.errors[0].message;
			const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
			res.status(409).json({ error: capitalizedMessage});
		}else	res.status(500).json({ error: "Internal server error" });
  });
};

export const deleteProductCategory = (req, res, next) => {
  ProductCategories.destroy({ where: { id: req.body.id } })
  .then((result) => {
    if (result === 1) {
      res.status(200).json({ message: "Product cateogry deleted successfully" });
    } else {
      res.status(404).json({ error: "Product cateogry not found" });
    }
  })
  .catch((error) => {
    if(error.original.errno == 1451 || error.original.code == 'ER_ROW_IS_REFERENCED_2' || error.original.sqlState == '23000'){
      res.status(409).json({ error: "It cannot be deleted because it is used elsewhere"});
    }else res.status(500).json({ error: "Internal server error" });
  });
};

export const getProductFamiliesData = (req, res, next) => {
  let categoryId = req.params.categoryId;
  let queryOptions = {
    include: {
      model: ProductCategories,
      as: 'category',
      attributes: ['category'],
    },
    order: [
      [{ model: ProductCategories, as: 'category' }, 'category'],
      'family',
    ],
  };

  if (categoryId > 0) {
    queryOptions.where = {
      category_id: categoryId,
    };
  }

  ProductFamilies.findAll(queryOptions)
  .then((productFamilies) => {
    let productFamiliesJSON = [];
    for (let i = 0; i < productFamilies.length; i++) {
      productFamiliesJSON.push(productFamilies[i].dataValues);
    }   
    res.status(200).json(productFamiliesJSON);
  })
  .catch(err => {
    res.status(502).json({error: "An error occurred"});
  });
};

export const createProductFamily = (req, res, next) => {
  const { family, category_id, summary, price_group_id } = req.body;
  const imgUrl = generateFileUrl(req.files);

  ProductFamilies.create({
    family: family,
    category_id: category_id,
    price_group_id: price_group_id,
    img_url: imgUrl,
    summary: summary
  })
  .then(newfamily => {
    res.status(201).json({ message: 'Product family created successfully', family: newfamily });
  })
  .catch(error => {
    console.log(error);
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateProductFamily = (req, res, next) => {
  const { id, family, category_id, summary, price_group_id } = req.body;

  const imgUrl = generateFileUrl(req.files);

  const updateFields = {
    family: family,
    category_id: category_id,
    summary: summary,
    price_group_id: price_group_id
  };

  if (imgUrl) {
    updateFields.img_url = imgUrl;
  }

  ProductFamilies.update(updateFields, { where: { id: id } })
  .then(newfamily => {
    res.status(201).json({ message: 'Product family updated successfully', family: newfamily });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const deleteProductFamily = (req, res, next) => {
  ProductFamilies.destroy({ where: { id: req.body.id } })
  .then((result) => {
    if (result === 1) {
      res.status(200).json({ message: "Product cateogry deleted successfully" });
    } else {
      res.status(404).json({ error: "Product cateogry not found" });
    }
  })
  .catch((error) => {
    if(error.original.errno == 1451 || error.original.code == 'ER_ROW_IS_REFERENCED_2' || error.original.sqlState == '23000'){
      res.status(409).json({ error: "It cannot be deleted because it is used elsewhere"});
    }else res.status(500).json({ error: "Internal server error" });
  });
};

export const createProductLine = (req, res, next) => {
  ProductLines.create(req.body)
  .then(newfamily => {
    res.status(201).json({ message: 'Product family created successfully', family: newfamily });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateProductLine = (req, res, next) => {
  ProductLines.update(req.body, { where: { id: req.body.id } })
  .then(newfamily => {
    res.status(201).json({ message: 'Product family created successfully', family: newfamily });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getProductLinesData = (req, res, next) => {
  let familyId = req.params.familyId;

  let queryOptions = {
    include: [
      {
        model: ProductCategories,
        as: 'category',
        attributes: ['category'],
      },
      {
        model: ProductFamilies,
        as: 'family',
        attributes: ['family'],
      },
    ],
    order: [
      [{ model: ProductCategories, as: 'category' }, 'category'],
      [{ model: ProductFamilies, as: 'family' }, 'family'],
      'line',
    ],
  };

  if (familyId > 0) {
    queryOptions.where = {
      family_id: familyId,
    };
  }
  ProductLines.findAll(queryOptions)
  .then((productLines) => {
    let productLinesJSON = [];
    for (let i = 0; i < productLines.length; i++) {
      productLinesJSON.push(productLines[i].dataValues);
    }   
    res.status(200).json(productLinesJSON);
  })
  .catch(err => {
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteProductLine = (req, res, next) => {
  ProductLines.destroy({ where: { id: req.body.id } })
  .then((result) => {
    if (result === 1) {
      res.status(200).json({ message: "Product cateogry deleted successfully" });
    } else {
      res.status(404).json({ error: "Product cateogry not found" });
    }
  })
  .catch((error) => {
    if(error.original.errno == 1451 || error.original.code == 'ER_ROW_IS_REFERENCED_2' || error.original.sqlState == '23000'){
      res.status(409).json({ error: "It cannot be deleted because it is used elsewhere"});
    }else res.status(500).json({ error: "Internal server error" });
  });
};

export const createProduct = (req, res, next) => {
  ProductProducts.create(req.body)
  .then(newfamily => {
    res.status(201).json({ message: 'Product family created successfully', family: newfamily });
  })
  .catch(error => {
    console.error('Error creating product family:', error);
    res.status(500).json({ error: 'Failed to create product family' });
  });
}

export const updateProduct = (req, res, next) => {
  const updateFields = req.body;

  ProductProducts.update(updateFields, { where: { id: req.body.id } })
  .then(newfamily => {
    res.status(201).json({ message: 'Product family created successfully', family: newfamily });
  })
  .catch(error => {
    console.error('Error creating product family:', error);
    res.status(500).json({ error: 'Failed to create product family' });
  });
}

export const getProductsData = (req, res, next) => {
  let queryOptions = {
    include: [
      {
        model: ProductCategories,
        as: 'category',
        attributes: ['category'],
      },
      {
        model: ProductFamilies,
        as: 'family',
        attributes: ['family'],
      },
      {
        model: ProductLines,
        as: 'line',
        attributes: ['line'],
      },
    ],
    order: [
      [{ model: ProductCategories, as: 'category' }, 'category'],
      [{ model: ProductFamilies, as: 'family' }, 'family'],
      [{ model: ProductLines, as: 'line' }, 'line'],
      'product',
    ],
  };
  ProductProducts.findAll(queryOptions)
  .then((products) => {
    let productsJSON = [];
    for (let i = 0; i < products.length; i++) {
      productsJSON.push(products[i].dataValues);
    }   
    res.status(200).json(productsJSON);
  })
  .catch(err => {
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteProduct = (req, res, next) => {
  ProductProducts.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Product deleted successfully" });
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};
