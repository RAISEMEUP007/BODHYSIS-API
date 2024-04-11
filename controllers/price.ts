import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import sequelize from '../utils/database';

import PriceGroup from '../models/price_group';
import PricePoints from '../models/price_points.js';
import PriceTableDetails from '../models/price_table_details.js';
import PriceSeasons from '../models/price_seasons';
import PriceBrands from '../models/price_brands.js';
import PriceTables from '../models/price_tables.js';
import PriceLogic from '../models/price_logic.js';
import PriceTableGroups from '../models/price_table_groups.js';

dotenv.config();

export const createPriceGroup = (req, res, next) => {
	PriceGroup.findOne({ where : {
		price_group: req.body.group,
		// table_id: req.body.tableId,
	}})
	.then(price_group => {
		if (price_group) {
			return res.status(409).json({error: "This group already exists"});
		} else if (req.body.group) {
			return PriceGroup.create(({
				price_group: req.body.group,
			}))
			.then(() => {
				res.status(200).json({message: "Added Successfully"});
			})
			.catch(err => {
				console.log(err);
				res.status(502).json({error: "An error occurred"});
			});
		}
	})
	.catch(err => {
		console.log('error', err);
	});
};

export const updatePriceGroup = (req, res, next) => {
  PriceGroup.findOne({ where: { 
  	price_group: req.body.oldName,
  }})
  .then(result => {
    if (result) {
      return PriceGroup.update(
        { 
        	price_group: req.body.newName,
        },
        { where: { 
        	price_group: req.body.oldName,
        }}
      )
      .then(() => {
        res.status(200).json({ message: "Updated Successfully" });
      })
      .catch(err => {
        console.log(err);
        res.status(502).json({ error: "An error occurred" });
      });
    } else {
      return res.status(404).json({ error: "This group is not found" });
    }
  })
  .catch(err => {
    console.log('error', err);
    res.status(500).json({ error: "Internal server error" });
  });
};

export const addPricePoint = (req, res, next) => {
	PricePoints.findOne({ where : {
		duration: req.body.duration,
		duration_type: req.body.durationType,
		table_id: req.body.tableId,
	}})
	.then(price_group => {
		if (price_group) {
			return res.status(409).json({error: "This point already exists"});
		} else {
			return PricePoints.create(({
				duration: req.body.duration,
				duration_type: req.body.durationType,
				table_id: req.body.tableId,
			}))
			.then((point) => {
				return res.status(200).json({message: "Added Successfully"});
			})
			.catch(err => {
				console.log(err);
				return res.status(502).json({error: "An error occurred"});
			});
		}
	})
	.catch(err => {
		console.log('error', err);
	});
};

const calculateMilliseconds = (duration, durationType) => {
  switch (durationType) {
    case 'Hour(s)':
    case 'hour(s)':
    case '1':
    case 1:
      return duration * 60 * 60 * 1000;
    case 'Day(s)':
    case 'day(s)':
    case '2':
    case 2:
      return duration * 24 * 60 * 60 * 1000;
    case 'Week(s)':
    case 'week(s)':
    case '3':
    case 3:
      return duration * 7 * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}

const calculateHours = (duration, durationType) => {
  switch (durationType) {
    case 'Hour(s)':
    case 'hour(s)':
    case '1':
    case 1:
      return duration;
    case 'Day(s)':
    case 'day(s)':
    case '2':
    case 2:
      return duration * 24;
    case 'Week(s)':
    case 'week(s)':
   	case '3':
    case 3:
      return duration * 7 * 24;
    default:
      return 0;
  }
}

export const getHeaderData = (req, res, next) => {
	let tableId = req.params.tableId;
	if(tableId == 0) tableId = null;
	PricePoints.findAll({where:{
		table_id: tableId
	}})
	.then((points) => {
    let pointsJSON = [];

    for (let i = 0; i < points.length; i++) {
	    let headerStr = "";
	    switch(points[i].dataValues.duration_type){
	    	case 1: case '1':
					headerStr = points[i].dataValues.duration + " Hour(s)";
					break;
				case 2: case '2':
					headerStr = points[i].dataValues.duration + " Day(s)";
					break;
				case 1: case '1':
					headerStr = points[i].dataValues.duration + " Week(s)";
					break;
				default:
					headerStr = points[i].dataValues.duration + " " + points[i].dataValues.duration_type;
					break;
	    }
      pointsJSON.push({ 
      	id: points[i].id, 
      	header: headerStr,
      	duration_type: points[i].dataValues.duration_type,
      	duration: points[i].dataValues.duration,
      	milliseconds: calculateMilliseconds(points[i].dataValues.duration, points[i].dataValues.duration_type),
  			hours: calculateHours(points[i].dataValues.duration, points[i].dataValues.duration_type)
      });
    }		

    pointsJSON.sort((a, b) => a.milliseconds - b.milliseconds);

    res.status(200).json(pointsJSON);
	})
	.catch(err => {
		console.log(err);
		res.status(502).json({error: "An error occurred"});
	});
};

export const getTableData = (req, res, next) => {
	let tableId = req.params.tableId;
	if(tableId == 0) tableId = null;

	const query = `
	  SELECT
  		t1.id AS group_id,
  		t1.price_group,
  		t4.is_free,
  		t4.extra_day,
  		t3.id AS point_id,
  		t2.value
	  FROM
  		price_groups AS t1
  		INNER JOIN price_table_groups AS t4
  			ON t1.id = t4.group_id
  			AND ${tableId ? 't4.table_id = ' + tableId : 't4.table_id IS NULL'}
  			AND t4.is_active = 1
  		LEFT JOIN price_table_details AS t2 
  			ON t1.id = t2.group_id
				AND ${tableId ? 't2.table_id = ' + tableId : 't2.table_id IS NULL'}
  		LEFT JOIN price_points AS t3 ON t2.point_id = t3.id
  			AND ${tableId ? 't3.table_id = ' + tableId : 't3.table_id IS NULL'}
  	-- WHERE ${tableId ? 't1.table_id = ' + tableId : 't1.table_id IS NULL'}
	  ORDER BY t1.price_group, point_id
  `;
	sequelize.query(
	  query,
	  { type: sequelize.QueryTypes.SELECT }
	)
	.then(datas => {
		if(datas.length > 0){
			PricePoints.findAll({where:{
				table_id:tableId,
			}})
			.then((points) => {
				points.sort((a, b) => {
				  const millisecondsA = calculateMilliseconds(a.dataValues.duration, a.dataValues.duration_type);
				  const millisecondsB = calculateMilliseconds(b.dataValues.duration, b.dataValues.duration_type);
				  return millisecondsA - millisecondsB;
				});

				const pointsArr = [];
				for (let i = 0; i < points.length; i++) {
				  pointsArr.push(points[i].dataValues);
				}
				
				var doubleArraiedDatas = {};
				var resData = {};

				datas.map((data, index)=>{
					doubleArraiedDatas[data.price_group] = {};
				});
				datas.map((data, index)=>{
					if(data.point_id) doubleArraiedDatas[data.price_group][data.point_id] = data;
					resData[data.price_group] = {
						group_id: data.group_id,
						is_free: data.is_free,
						extra_day: data.extra_day,
						data: []
					};
				});

				for(var price_group in doubleArraiedDatas){
					var dataFirst = doubleArraiedDatas[price_group];
					pointsArr.map((point, index) => {
						var dataSecond = dataFirst[point.id];
						if(dataSecond) {
							resData[price_group].data.push(dataSecond.value);
						}else{
							resData[price_group].data.push("");
						}
					})
				}
				res.status(200).json(resData);
			})
			.catch(err => {
				res.status(502).json({error: "An error occurred"});
			});
		}else{
			res.status(200).json({});
		}
	})
	.catch(error => {
		res.status(502).json({error: "An error occurred"});
	});
};

export const getPriceGroupsData = (req, res, next) => {
	PriceGroup.findAll({
		order: [['price_group', 'ASC']]
	})
	.then((PriceGroup) => {
    let PriceGroupJSON = [];
    for (let i = 0; i < PriceGroup.length; i++) {
      PriceGroupJSON.push(PriceGroup[i].dataValues);
    }		
    res.status(200).json(PriceGroupJSON);
	})
	.catch(err => {
		console.log(err);
		res.status(502).json({error: "An error occurred"});
	});
};

export const setFree = (req, res, next) => {
	PriceTableGroups.update(
	  { is_free: req.body.isFree },
	  { where: { 
	  	table_id: req.body.table_id,
	  	group_id: req.body.group_id,
	  } }
	).then((result) => {
		res.status(200).json({ message: "SetFree Successfully" });
	}).catch((error) => {
		res.status(500).json({ error: "Internal server error" });
	});
};

export const priceValidation = (req, res, next) => {
  const { groupId, pointId, value } = req.body;
  let tableId = null;
  if(req.body.tableId) tableId = req.body.tableId;

  PriceTableDetails.findOne({	where: { 
	  group_id: groupId,
	  table_id: tableId,
	  value: value
	}}).then((result) => {
		if (result) {
		  res.status(404).json({ message: "Conflict price" });
		} else {
		  res.status(200).json({ message: "No confliction" });
		}
  }).catch((error) => {
		console.log(error);
		res.status(500).json({ error: "Internal server error" });
  });
};

export const getPriceGroupValue = (req, res, next) => {
  const { groupId, pointId, tableId } = req.body;

  console.log(req.body);

  PriceTableDetails.findOne({
    attributes: ['value'],
    where: {
      group_id: groupId,
      table_id: tableId,
      point_id: pointId
    }
  }).then((result) => {
  	console.log(result);
    if (result && result.value != null) {
      res.json(result.value);
    } else {
      res.json(0);
    }
  }).catch((error) => {
		console.log(error);
		res.status(500).json({ error: "Internal server error" });
  });
};

export const getPriceDataByGroup = (req, res, next) => {
  const { groupId, tableId } = req.body;

  console.log(req.body);

  PriceTableDetails.findAll({
    where: {
      group_id: groupId,
      table_id: tableId
    }
  }).then((result) => {
    res.json(result);
  }).catch((error) => {
		console.log(error);
		res.status(500).json({ error: "Internal server error" });
  });
};

export const setPriceData = (req, res, next) => {
  const { groupId, pointId, value } = req.body;
  let tableId = null;
  if(req.body.tableId) tableId = req.body.tableId;

  PriceTableDetails.findOne({	where: { 
	  group_id: groupId,
	  table_id: tableId,
	  value: value
	}}).then((result) => {
		if(value && result){
			//return res.status(409).json({error: "Price already exists"});
		}
	  PriceTableDetails.findOrCreate({
			where: { 
			  group_id: groupId,
			  table_id: tableId,
			  point_id: pointId
			},
			defaults: {
			  group_id: groupId,
			  table_id: tableId,
			  point_id: pointId,
			  value: value
			}}).then(([result, created]) => {
				if (!created) {
				  PriceTableDetails.update(
					{ value: value },
					{ where: { 
							group_id: groupId,
							table_id: tableId,
							point_id: pointId
					}}).then(() => {
						res.status(200).json({ message: "Updated price Successfully" });
				  }).catch((error) => {
						console.log(error);
						res.status(500).json({ error: "Internal server error" });
				  });
				} else {
				  res.status(200).json({ message: "SetPrice Successfully" });
				}
		  }).catch((error) => {
				console.log(error);
				res.status(500).json({ error: "Internal server error" });
		  });
	});
};

export const setExtraDay = (req, res, next) => {
  PriceTableGroups.update(
    { extra_day: req.body.extraDay },
    { where: { 
	  	table_id: req.body.table_id,
	  	group_id: req.body.group_id,
    } }
  ).then((result) => {
    res.status(200).json({ message: "Set Extraday Successfully" });
  }).catch((error) => {
    res.status(500).json({ error: "Internal server error" });
  });
};

export const deleteGroup = (req, res, next) => {
  PriceGroup.destroy({ where: { id: req.body.id } })
  .then((result) => {
    if (result === 1) {
      res.status(200).json({ message: "Group deleted successfully" });
    } else {
      res.status(404).json({ error: "Group not found" });
    }
  })
  .catch((error) => {
		if(error.original.errno == 1451 || error.original.code == 'ER_ROW_IS_REFERENCED_2' || error.original.sqlState == '23000'){
			res.status(409).json({ error: "It cannot be deleted because it is used elsewhere"});
		}else	res.status(500).json({ error: "Internal server error" });
  });
};

export const deletePricePoint = (req, res, next) => {
  PricePoints.destroy({ where: { id: req.body.pointId } })
  .then((result) => {
    if (result === 1) {
      res.status(200).json({ message: "PricePoint deleted successfully" });
    } else {
      res.status(404).json({ error: "PricePoint not found" });
    }
  })
  .catch((error) => {
		if(error.original.errno == 1451 || error.original.code == 'ER_ROW_IS_REFERENCED_2' || error.original.sqlState == '23000'){
			res.status(409).json({ error: "It cannot be deleted because it is used elsewhere"});
		}else	res.status(500).json({ error: "Internal server error" });
  });
};

export const getSeasonsData = (req, res, next) => {
	PriceSeasons.findAll()
	.then((seasons) => {
    let seasonsJSON = [];
    for (let i = 0; i < seasons.length; i++) {
      seasonsJSON.push(seasons[i].dataValues);
    }		
    res.status(200).json(seasonsJSON);
	})
	.catch(err => {
		console.log(err);
		res.status(502).json({error: "An error occurred"});
	});
};

export const saveSeasonCell = (req, res, next) => {
  const { id, column, value } = req.body;
  PriceSeasons.findOrCreate({
	where: { id: id, },
	defaults: {
	  [column]: value,
	}}).then(([result, created]) => {
		if (!created) {
		  PriceSeasons.update(
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
		  res.status(200).json({ message: "SetSeason Successfully" });
		}
  }).catch((error) => {
		if(error.errors && error.errors[0].validatorKey == 'not_unique'){
			const message = error.errors[0].message;
			const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
			res.status(409).json({ error: capitalizedMessage});
		}else	res.status(500).json({ error: "Internal server error" });
  });
};

export const deleteSeason = (req, res, next) => {
  PriceSeasons.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Season deleted successfully" });
      } else {
        res.status(404).json({ error: "Season not found" });
      }
    })
    .catch((error) => {
			if(error.original.errno == 1451 || error.original.code == 'ER_ROW_IS_REFERENCED_2' || error.original.sqlState == '23000'){
				res.status(409).json({ error: "It cannot be deleted because it is used elsewhere"});
			}else	res.status(500).json({ error: "Internal server error" });
    });
};

export const getBrandsData = (req, res, next) => {
	PriceBrands.findAll()
	.then((brands) => {
    let brandsJSON = [];
    for (let i = 0; i < brands.length; i++) {
      brandsJSON.push(brands[i].dataValues);
    }		
    res.status(200).json(brandsJSON);
	})
	.catch(err => {
		console.log(err);
		res.status(502).json({error: "An error occurred"});
	});
};

export const saveBrandCell = (req, res, next) => {
  const { id, column, value } = req.body;
  PriceBrands.findOrCreate({
	where: { id: id, },
	defaults: {
	  [column]: value,
	}}).then(([result, created]) => {
		if (!created) {
		  PriceBrands.update(
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
		  res.status(200).json({ message: "SetBrand Successfully" });
		}
  }).catch((error) => {
		if(error.errors && error.errors[0].validatorKey == 'not_unique'){
			const message = error.errors[0].message;
			const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
			res.status(409).json({ error: capitalizedMessage});
		}else	res.status(500).json({ error: "Internal server error" });
  });
};

export const deleteBrand = (req, res, next) => {
  PriceBrands.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Brand deleted successfully" });
      } else {
        res.status(404).json({ error: "Brand not found" });
      }
    })
    .catch((error) => {
			if(error.original.errno == 1451 || error.original.code == 'ER_ROW_IS_REFERENCED_2' || error.original.sqlState == '23000'){
				res.status(409).json({ error: "It cannot be deleted because it is used elsewhere"});
			}else	res.status(500).json({ error: "Internal server error" });
    });
};

export const getPriceTablesData = (req, res, next) => {
	PriceTables.findAll()
	.then((brands) => {
    let priceTablesJSON = [];
    for (let i = 0; i < brands.length; i++) {
      priceTablesJSON.push(brands[i].dataValues);
    }		
    res.status(200).json(priceTablesJSON);
	})
	.catch(err => {
		console.log(err);
		res.status(502).json({error: "An error occurred"});
	});
};

export const savePriceTableCell = (req, res, next) => {
  const { id, column, value } = req.body;
  PriceTables.findOrCreate({
	where: { id: id, },
	defaults: {
	  [column]: value,
	}}).then(([result, created]) => {
		if (!created) {
		  PriceTables.update(
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
		  res.status(200).json({ message: "SetBrand Successfully" });
		}
  }).catch((error) => {
		if(error.errors && error.errors[0].validatorKey == 'not_unique'){
			let originalString = error.errors[0].message;
			let formattedString = originalString.replace(/_/g, " ");
			formattedString = formattedString.charAt(0).toUpperCase() + formattedString.slice(1);
			res.status(409).json({ error: formattedString});
		}else	res.status(500).json({ error: "Internal server error" });
  });
};

export const deletePriceTable = (req, res, next) => {
  PriceTables.destroy({ where: { id: req.body.id } })
  .then((result) => {
    if (result === 1) {
      res.status(200).json({ message: "Brand deleted successfully" });
    } else {
      res.status(404).json({ error: "Brand not found" });
    }
  })
  .catch((error) => {
		if(error.original.errno == 1451 || error.original.code == 'ER_ROW_IS_REFERENCED_2' || error.original.sqlState == '23000'){
			res.status(409).json({ error: "It cannot be deleted because it is used elsewhere"});
		}else	res.status(500).json({ error: "Internal server error" });
  });
};

export const clonePriceTableCell = (req, res, next) => {
  const { sourceId, tblName } = req.body;
  let newTableId;

  sequelize.transaction(t => {
    return PriceTables.create({
      table_name: tblName,
    }, { transaction: t })
      .then(table => {
        newTableId = table.dataValues.id;
        return Promise.all([
          // PriceGroup.sequelize.query(
          //   `INSERT INTO price_groups (price_group, table_id, is_free, extra_day, cloned_id) 
          //   SELECT price_group, ${newTableId}, is_free, extra_day, id FROM price_groups WHERE table_id = ${sourceId};`,
          //   { transaction: t }
          // ),
          PricePoints.sequelize.query(
            `INSERT INTO price_points (duration, table_id, duration_type, cloned_id) 
            SELECT duration, ${newTableId}, duration_type, id FROM price_points WHERE table_id = ${sourceId};`,
            { transaction: t }
          ),
          PriceTableDetails.sequelize.query(
            `INSERT INTO price_table_details (
							  group_id,
							  table_id,
							  point_id,
							  VALUE
							)
							SELECT
							  -- (SELECT id FROM price_groups AS t2 WHERE t2.cloned_id = group_id AND t2.table_id = ${newTableId}),
							  group_id,
							  ${newTableId},
							  (SELECT id FROM price_points AS t3 WHERE t3.cloned_id = point_id AND t3.table_id = ${newTableId}),
							  VALUE
							FROM
							  price_table_details
							WHERE table_id = ${sourceId};`,
            { transaction: t }
        	)
        ]);
      });
  })
  .then(() => {
    return res.status(200).json({ message: "Cloned Successfully" });
  })
  .catch(error => {
    if (error.errors && error.errors[0].validatorKey === 'not_unique') {
      originalString = error.errors[0].message;
      let formattedString = originalString.replace(/_/g, " ");
      formattedString = formattedString.charAt(0).toUpperCase() + formattedString.slice(1);
      return res.status(409).json({ error: formattedString });
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};

export const getPriceLogicData = (req, res, next) => {
	PriceLogic.findAll({
	  include: [
	    { model: PriceBrands, as: 'brand'},
	    { model: PriceSeasons, as: 'season'},
	    { model: PriceTables, as: 'priceTable'}
	  ]
	}).then((results) => {
    let priceLogicJSON = [];
    for (let i = 0; i < results.length; i++) {
      priceLogicJSON.push(results[i].dataValues);
    }		
    res.status(200).json(priceLogicJSON);
	})
	.catch(err => {
		console.log(err);
		res.status(502).json({error: "An error occurred"});
	});
};

export const createPriceLogic = (req, res, next) => {
	PriceLogic.findOne({ where : {
		brand_id: req.body.brandId,
		season_id: req.body.seasonId,
		table_id: req.body.tableId,
	}})
	.then(result => {
		if (result) {
			return res.status(409).json({error: "This logic already exists"});
		} {
			return PriceLogic.create(({
				brand_id: req.body.brandId,
				season_id: req.body.seasonId,
				table_id: req.body.tableId,
				start_date: req.body.startDate,
				end_date: req.body.endDate,
			}))
			.then(() => {
				res.status(200).json({message: "Added Successfully"});
			})
			.catch(err => {
				console.log(err);
				res.status(502).json({error: "An error occurred"});
			});
		}
	})
	.catch(err => {
		console.log('error', err);
	});
};

export const savePriceLogicCell = (req, res, next) => {
  const { id, column, value } = req.body;
  PriceLogic.findOrCreate({
	where: { id: id, },
	defaults: {
	  [column]: value,
	}}).then(([result, created]) => {
		if (!created) {
		  PriceLogic.update(
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
		  res.status(200).json({ message: "SetBrand Successfully" });
		}
  }).catch((error) => {
		if(error.errors && error.errors[0].validatorKey == 'not_unique'){
			let originalString = error.errors[0].message;
			let formattedString = originalString.replace(/_/g, " ");
			formattedString = formattedString.charAt(0).toUpperCase() + formattedString.slice(1);
			res.status(409).json({ error: formattedString});
		}else	res.status(500).json({ error: "Internal server error" });
  });
};

export const deletePriceLogic = (req, res, next) => {
  PriceLogic.destroy({ where: { id: req.body.id } })
  .then((result) => {
    if (result === 1) {
      res.status(200).json({ message: "Brand deleted successfully" });
    } else {
      res.status(404).json({ error: "Brand not found" });
    }
  })
  .catch((error) => {
		if(error.original.errno == 1451 || error.original.code == 'ER_ROW_IS_REFERENCED_2' || error.original.sqlState == '23000'){
			res.status(409).json({ error: "It cannot be deleted because it is used elsewhere"});
		}else	res.status(500).json({ error: "Internal server error" });
  });
};

export const getPriceGroupActiveDataByTableId = (req, res, next)=>{
	PriceGroup.findAll({
		attributes: ['id', 'price_group'],
	  include: 
	    { 
	    	model: PriceTableGroups, 
	    	as: 'price_table_group',
	    	attributes: ['is_active'],
	    	where: {
          table_id: req.params.tableId
        },
        required: false,
	    },
	}).then((results) => {
		const transformedResults = results.map(item => ({
		  id: item.id,
		  price_group: item.price_group,
		  is_active: item.price_table_group[0]?.is_active ?? false,
		}));
    res.status(200).json(transformedResults);
	})
	.catch(err => {
		console.log(err);
		res.status(502).json({error: "An error occurred"});
	});
}

export const setActiveGroup = (req, res, next) => {
  PriceTableGroups.findOrCreate({
	where: { 
	  table_id: req.body.table_id,
	  group_id: req.body.group_id,
	},
	defaults: {
	  group_id: req.body.group_id,
	  table_id: req.body.table_id,
	  is_active: req.body.is_active,
	}}).then(([result, created]) => {
		if (!created) {
		  PriceTableGroups.update(
			{ is_active: req.body.is_active, },
			{ where: { 
			  group_id: req.body.group_id,
			  table_id: req.body.table_id,
			}}).then(() => {
				res.status(200).json({ message: "Updated Successfully" });
		  }).catch((error) => {
				console.log(error);
				res.status(500).json({ error: "Internal server error" });
		  });
		} else {
		  res.status(200).json({ message: "Set Successfully" });
		}
  }).catch((error) => {
		console.log(error);
		res.status(500).json({ error: "Internal server error" });
  });
};