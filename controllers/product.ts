import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import sequelize from '../utils/database';

import ProductCategories from '../models/product/product_categories.js';
import ProductFamilies from '../models/product/product_families.js';
import ProductLines from '../models/product/product_lines.js';
import ProductProducts from '../models/product/product_products';
import ProductDisplayGroupOrder from '../models/product/product_display_group_orders.js';
import SettingsLocations from '../models/settings/settings_locations.js';
import PriceGroup from '../models/price_group';

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
  const { category, description, tag_id, brand_ids } = req.body;
  const imgUrl = generateFileUrl(req.files);

  ProductCategories.create({
    category: category,
    img_url: imgUrl,
    description: description,
    tag_id: tag_id,
    brand_ids: brand_ids,
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
  const { id, category, description, tag_id, brand_ids } = req.body;
  const imgUrl = generateFileUrl(req.files);

  const updateFields = {
    category: category,
    description: description,
    tag_id: tag_id,
    brand_ids: brand_ids,
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

export const getProductFamiliesDataByDisplayName = async (req, res, next) => {
  try {
    let categoryId = req.params.categoryId;

    const productFamilies = await getPFDByDisplayName(categoryId);
    res.status(200).json(productFamilies);
  } catch (err) {
    console.error(err);
    res.status(502).json({error: "An error occurred"});
  }
};

export const getPFDByDisplayName = async (categoryId) => {
  let queryOptions = {
    attributes: [
      'id',
      'family',
      'display_name',
      'category_id',
      'img_url',
      'notes',
      'summary',
      'description',
      'brand_ids',
      [sequelize.fn('GROUP_CONCAT', sequelize.col('product_families.id')), 'familiesIds'],
      [sequelize.fn('GROUP_CONCAT', sequelize.col('lines.id')), 'linesIds'],
      [sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT',sequelize.col('lines.price_group_id'))), 'priceGroupIds']
    ],
    include: [
      {
        model: ProductCategories,
        as: 'category',
        attributes: ['category'],
      },
      {
        attributes: [
          'line',
          'size',
          'suitability',
          'holdback',
          'shortcode',
          'price_group_id',
          [sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('lines.size'))), 'linesSizes'],
        ],
        model: ProductLines,
        as: 'lines',
      },
      {
        model: ProductDisplayGroupOrder,
        as: 'group_orders',
      }
    ],
    group: 'display_name',
    order: [
      [{ model: ProductCategories, as: 'category' }, 'category'],
      [sequelize.literal('(group_orders.order_index IS NOT NULL) DESC')],
      [{ model: ProductDisplayGroupOrder, as: 'group_orders' }, 'order_index', 'ASC'],
      'display_name',
    ],
  };

  if (categoryId > 0) {
    queryOptions.where = {
      category_id: categoryId,
    };
  }

  const productFamilies = await ProductFamilies.findAll(queryOptions);

  let productFamiliesJSON = [];
  for (let i = 0; i < productFamilies.length; i++) {
    productFamiliesJSON.push(productFamilies[i].dataValues);
  }
  return productFamiliesJSON;
}

export const getProductFamilyIdsByDisplayName = async (category_id, display_name) => {
  try {
    let queryOptions = {
      attributes: ['id'],
      where: {
        category_id: category_id,
        display_name: display_name,
      }
    };
    const productFamilies = await ProductFamilies.findAll(queryOptions);
    return productFamilies.map((family) => family.id);
  } catch (err) {
    console.error(err);
    throw { status: 502, error: "An error occurred" };
  }
};

export const createProductFamily = (req, res, next) => {
  const { family, category_id, display_name, summary, notes, brand_ids } = req.body;
  const imgUrl = generateFileUrl(req.files);

  ProductFamilies.create({
    family: family,
    category_id: category_id,
    display_name: display_name,
    img_url: imgUrl,
    summary: summary,
    brand_ids: brand_ids,
    notes: notes
  })
  .then(newfamily => {
    res.status(201).json({ message: 'Product family created successfully', family: newfamily });
  })
  .catch(error => {
    console.error(error);
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateProductFamily = (req, res, next) => {
  const { id, family, category_id, display_name, summary, notes, brand_ids } = req.body;

  const imgUrl = generateFileUrl(req.files);

  const updateFields = {
    family: family,
    category_id: category_id,
    display_name: display_name,
    summary: summary,
    brand_ids: brand_ids,
    notes: notes
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
      res.status(200).json({ message: "Document deleted successfully" });
    } else {
      res.status(404).json({ error: "Document not found" });
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
  .then(newline => {
    res.status(201).json({ message: 'Product line created successfully', line: newline });
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
  .then(newline => {
    res.status(201).json({ message: 'Product line created successfully', line: newline });
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
        attributes: ['family', 'display_name'],
      },
      {
        model: PriceGroup,
        as: 'price_group',
        attributes: ['id', 'price_group'],
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
    console.error(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const getProductLinesDataByCategory = (req, res, next) => {
  let categoryId = req.params.categoryId;

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
        attributes: ['family', 'display_name', 'img_url'],
      },
      {
        model: PriceGroup,
        as: 'price_group',
        attributes: ['id', 'price_group'],
      },
    ],
    order: [
      [{ model: ProductCategories, as: 'category' }, 'category'],
      [{ model: ProductFamilies, as: 'family' }, 'family'],
      'line',
    ],
  };

  if (categoryId > 0) {
    queryOptions.where = {
      category_id: categoryId,
    };
  }
  ProductLines.findAll(queryOptions)
  .then((productLines) => {
    // let productLinesJSON = [];
    // for (let i = 0; i < productLines.length; i++) {
    //   productLinesJSON.push(productLines[i].dataValues);
    // }
    res.status(200).json(productLines);
  })
  .catch(err => {
    console.error(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteProductLine = (req, res, next) => {
  ProductLines.destroy({ where: { id: req.body.id } })
  .then((result) => {
    if (result === 1) {
      res.status(200).json({ message: "Product line deleted successfully" });
    } else {
      res.status(404).json({ error: "Product line not found" });
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
  .then(newproduct => {
    res.status(201).json({ message: 'Product created successfully', product: newproduct });
  })
  .catch(error => {
    console.error('Error creating product:', error);
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateProduct = (req, res, next) => {
  const updateFields = req.body;

  ProductProducts.update(updateFields, { where: { id: req.body.id } })
  .then(newproduct => {
    res.status(201).json({ message: 'Product created successfully', product: newproduct });
  })
  .catch(error => {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  });
}

export const getProductsData = (req, res, next) => {
  let whereCondition = {};
  if (req.body.category_id != 0) {
    whereCondition.category_id = req.body.category_id;
  }
  if (req.body.family_id != 0) {
    whereCondition.family_id = req.body.family_id;
  }
  if (req.body.line_id != 0) {
    whereCondition.line_id = req.body.line_id;
  }

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
        attributes: ['family', 'display_name'],
      },
      {
        model: ProductLines,
        as: 'line',
        attributes: ['line', 'size', 'price_group_id'],
        include: {
          model: PriceGroup,
          as: 'price_group',
          attributes: ['id', 'price_group'],
        },
      },
      {
        model: SettingsLocations,
        as: 'home_location_tbl',
        attributes: ['location'],
      },
      {
        model: SettingsLocations,
        as: 'current_location_tbl',
        attributes: ['location'],
      },
    ],
    order: [
      [{ model: ProductCategories, as: 'category' }, 'category'],
      [{ model: ProductFamilies, as: 'family' }, 'family'],
      [{ model: ProductLines, as: 'line' }, 'line'],
      'barcode',
    ],
    where: whereCondition,
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
    console.error(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const getProductDetailByBarcode = (req, res, next) => {
  let barcode = req.body.barcode;

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
        attributes: ['family', 'display_name'],
      },
      {
        model: ProductLines,
        as: 'line',
        attributes: ['line', 'size', 'price_group_id'],
        include: {
          model: PriceGroup,
          as: 'price_group',
          attributes: ['id', 'price_group'],
        },
      },
    ],
    where: { barcode: barcode },
  };

  ProductProducts.findOne(queryOptions)
    .then((product) => {
      if (product) {
        res.status(200).json(product.toJSON());
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "An error occurred" });
    });
};

export const getProductDetailById = (req, res, next) => {
  let id = req.params.id;

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
        attributes: ['family', 'display_name'],
      },
      {
        model: ProductLines,
        as: 'line',
        attributes: ['line', 'size', 'price_group_id'],
        include: {
          model: PriceGroup,
          as: 'price_group',
          attributes: ['id', 'price_group'],
        },
      },
    ],
    where: { id: id },
  };

  ProductProducts.findOne(queryOptions)
    .then((product) => {
      if (product) {
        res.status(200).json(product.toJSON());
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "An error occurred" });
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

export const quickAddProduct = async (req, res, next) => {
  try {
    const { rowcounts, ...productData } = req.body;
    const rows = [];

    const lastProduct = await ProductProducts.findOne({
      where:{
        category_id: req.body.category_id,
        family_id: req.body.family_id,
        line_id: req.body.line_id
      },
      order: [['barcode', 'DESC']]
    });

    let startingIndex = 0;
    if (lastProduct && !isNaN(parseInt(lastProduct.barcode.substr(-3)))) {
      startingIndex = parseInt(lastProduct.barcode.substr(-3));
    }

    for (let i = 0; i < rowcounts; i++) {
      let newRow = { ...productData };
      newRow.barcode = `${newRow?.line?.shortcode??''}${(startingIndex+i+1).toString().padStart(3, '0')}`;
      rows.push(ProductProducts.create(newRow));
    }

    // Transaction handling
    const newProducts = await sequelize.transaction(async (t) => {
      return Promise.all(rows, { transaction: t });
    });

    res.status(201).json({ message: 'Products created successfully', products: newProducts });
  } catch (error) {
    console.error('Error creating products:', error);
    res.status(500).json({ error: 'Failed to create products', reason: error.message });
  }
}

export const getProductQuantitiesByLine = (req, res, next) => {
  ProductProducts.findAll({
    attributes: ['line_id', [sequelize.fn('COUNT', sequelize.col('id')), 'quantity']],
    group: ['line_id'],
  })
  .then(results => {
    // Transforming results to [family_id:value] format
    const transformedResults = results.reduce((acc, curr) => {
      acc[curr.line_id] = curr.dataValues.quantity;
      return acc;
    }, {});

    res.status(200).json(transformedResults);
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
};

export const getProductQuantitiesByFamily = (req, res, next) => {
  ProductProducts.findAll({
    attributes: ['family_id', [sequelize.fn('COUNT', sequelize.col('id')), 'quantity']],
    group: ['family_id'],
  })
  .then(results => {
    const transformedResults = results.reduce((acc, curr) => {
      acc[curr.family_id] = curr.dataValues.quantity;
      return acc;
    }, {});
    res.status(200).json(transformedResults);
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
};

export const getProductQuantitiesByCategory = (req, res, next) => {
  ProductProducts.findAll({
    attributes: ['category_id', [sequelize.fn('COUNT', sequelize.col('id')), 'quantity']],
    group: ['category_id'],
  })
  .then(results => {
    const transformedResults = results.reduce((acc, curr) => {
      acc[curr.category_id] = curr.dataValues.quantity;
      return acc;
    }, {});
    res.status(200).json(transformedResults);
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });
};

export const getAvaliableQuantitiesByLine = (line_id = null) =>{
  let lineIdCondition = '';
  let replacements = {};

  if (Array.isArray(line_id)) {
    lineIdCondition = 'AND line_id IN (:line_id)';
    replacements.line_id = line_id;
  } else if (Number.isInteger(line_id)) {
    lineIdCondition = 'AND t1.line_id = :line_id';
    replacements.line_id = line_id;
  }

  const query = `
    SELECT
      line_id,
      COUNT(id) AS quantity
    FROM
      product_products
    WHERE STATUS IN (0, 3)
      ${lineIdCondition}
    GROUP BY line_id
  `;

  return sequelize.query(query, {
    replacements,
    type: sequelize.QueryTypes.SELECT
  }).then(results => {
    return results.reduce((acc, cur) => {
      acc[cur.line_id] = cur.quantity;
      return acc;
    }, {});
  }).catch(error => {
    console.error(error);
    throw new Error('An error occurred while fetching stage amounts');
  });
}

export const getAvaliableQuantityByfamily = async (family_id = null) =>{
  let lineIdCondition = '';
  let replacements = {};

  if (Array.isArray(family_id)) {
    lineIdCondition = 'AND family_id IN (:family_id)';
    replacements.family_id = family_id;
  } else if (Number.isInteger(family_id)) {
    lineIdCondition = 'AND t1.family_id = :family_id';
    replacements.family_id = family_id;
  }

  const query = `
    SELECT
      COUNT(id) AS quantity
    FROM
      product_products
    WHERE STATUS IN (0, 3)
      ${lineIdCondition}
  `;

  return sequelize.query(query, {
    replacements,
    type: sequelize.QueryTypes.SELECT
  }).then(results => {
    if (results.length > 0) {
      return results[0].quantity;
    } else {
      return 0;
    }
  }).catch(error => {
    console.error(error);
    throw new Error('An error occurred while fetching stage amounts');
  });
}

export const getAvaliableQuantityByDisplayName = async (categoryId) => {
  try {
    let query = `
      SELECT
        t2.display_name,
        COUNT(t1.id) AS quantity
      FROM
        product_products AS t1
        INNER JOIN product_families AS t2
          ON t1.family_id = t2.id
      WHERE t1.status IN (0, 3)
    `;

    if (categoryId) {
      query += ` AND t1.category_id = ${categoryId}`;
    }
    
    query += ` GROUP BY t2.display_name`;

    const results = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });

    return results;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while fetching stage amounts');
  }
}

export const getAvaliableQuantitiesByFamilyIds = (family_id = null) =>{
  let lineIdCondition = '';
  let replacements = {};

  if (Array.isArray(family_id)) {
    lineIdCondition = 'AND family_id IN (:family_id)';
    replacements.family_id = family_id;
  } else if (Number.isInteger(family_id)) {
    lineIdCondition = 'AND t1.family_id = :family_id';
    replacements.family_id = family_id;
  }

  const query = `
    SELECT
      family_id,
      COUNT(id) AS quantity
    FROM
      product_products
    WHERE STATUS IN (0)
      ${lineIdCondition}
    GROUP BY family_id
  `;

  return sequelize.query(query, {
    replacements,
    type: sequelize.QueryTypes.SELECT
  }).then(results => {
    return results.reduce((acc, cur) => {
      acc[cur.line_id] = cur.quantity;
      return acc;
    }, {});
  }).catch(error => {
    console.error(error);
    throw new Error('An error occurred while fetching stage amounts');
  });
}

export const updateBulkLocation = (req, res, next) => {
  ProductProducts.update(req.body, { where: { id: req.body.ids } })
  .then(newProducts => {
    res.status(201).json({ message: 'Product locations updated successfully', products: newProducts });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateBulkStatus = (req, res, next) => {
  ProductProducts.update(req.body, { where: { id: req.body.ids } })
  .then(newProducts => {
    res.status(201).json({ message: 'Product status updated successfully', products: newProducts });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getDisplayGroupOrder = async (req, res, next) => {
  try {
    const query = `
      SELECT
        t2.category,
        t1.display_name,
        t3.order_index
      FROM
        product_families AS t1
        LEFT JOIN product_categories AS t2
          ON t1.category_id = t2.id
        left join product_display_group_orders as t3
          on t1.display_name = t3.display_name
      GROUP BY t1.display_name
      ORDER BY t2.category,
        (t3.order_index IS NOT NULL) DESC,
        t3.order_index,
        t1.display_name;
    `;
    const results = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
};

export const updateOrderIndex = (req, res, next) => {
  ProductDisplayGroupOrder.findOrCreate({
    where: { 
      display_name: req.body.display_name,
    },
    defaults: req.body
  }).then(([result, created]) => {
    if (!created) {
      ProductDisplayGroupOrder.update(
      { order_index: req.body.order_index },
      { where: { 
        display_name: req.body.display_name,
      }}).then(() => {
        res.status(200).json({ message: "Set Successfully" });
      }).catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      });
    } else {
      res.status(200).json({ message: "Set Successfully" });
    }
  }).catch((error) => {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  });
};