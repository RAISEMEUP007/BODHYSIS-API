import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import sequelize from '../utils/database';

import SettingsManufactures from '../models/settings/settings_manufactures.js';
import SettingsTags from '../models/settings/settings_tags.js';
import SettingsLocations from '../models/settings/settings_locations.js';
import SettingsCountries from '../models/settings/settings_countries.js';
import SettingsLanguages from '../models/settings/settings_languages.js';
import SettingsDocuments from '../models/settings/settings_documents.js';
import SettingsReservationTypes from '../models/settings/settings_reservation_types.js';
import SettingsTrucks from '../models/settings/settings_trucks.js';
import SettingsTimezones from '../models/settings/settings_timezones.js';
import SettingsCurrencies from '../models/settings/settings_currencies.js';
import SettingsDateformats from '../models/settings/settings_dateformats.js';
import SettingsTimeformats from '../models/settings/settings_timeformats.js';
import SettingsStoreDetails from '../models/settings/settings_storedetails.js';
import SettingsDiscountCodes from '../models/settings/settings_discountcodes.js';
import SettingsExclusions from '../models/settings/settings_exclusions.js';
import SettingsTaxcodes from '../models/settings/settings_taxcodes.js';
import SettingsColorcombinations from '../models/settings/settings_colorcombinations.js';

dotenv.config();

const generateFileUrl = (files) => {
  if (files && files.length > 0) {
    const file = files[0];

    return `/${file.path.replace(/\\/g, "/")}`;
  } else {
    return null;
  }
};

export const createManufacture = (req, res, next) => {
  SettingsManufactures.create(req.body)
  .then(newManufacture => {
    res.status(201).json({ message: 'Manufacture created successfully', manufacture: newManufacture });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateManufacture = (req, res, next) => {
  const updateFields = req.body;

  SettingsManufactures.update(updateFields, { where: { id: req.body.id } })
  .then(newManufacture => {
    res.status(201).json({ message: 'Manufacture updated successfully', manufacture: newManufacture });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getManufacturesData = (req, res, next) => {
  SettingsManufactures.findAll()
  .then((manufactures) => {
    let manufacturesJSON = [];
    for (let i = 0; i < manufactures.length; i++) {
      manufacturesJSON.push(manufactures[i].dataValues);
    }   
    res.status(200).json(manufacturesJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteManufacture = (req, res, next) => {
  SettingsManufactures.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Manufacture deleted successfully" });
      } else {
        res.status(404).json({ error: "Manufacture not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const createTag = (req, res, next) => {
  SettingsTags.create(req.body)
  .then(newTag => {
    res.status(201).json({ message: 'Tag created successfully', tag: newTag });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateTag = (req, res, next) => {
  const updateFields = req.body;

  SettingsTags.update(updateFields, { where: { id: req.body.id } })
  .then(newTag => {
    res.status(201).json({ message: 'Tag updated successfully', tag: newTag });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getTagsData = (req, res, next) => {
  SettingsTags.findAll()
  .then((tags) => {
    let tagsJSON = [];
    for (let i = 0; i < tags.length; i++) {
      tagsJSON.push(tags[i].dataValues);
    }   
    res.status(200).json(tagsJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteTag = (req, res, next) => {
  SettingsTags.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Tag deleted successfully" });
      } else {
        res.status(404).json({ error: "Tag not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const createLocation = (req, res, next) => {
  SettingsLocations.create(req.body)
  .then(newLocation => {
    res.status(201).json({ message: 'Location created successfully', location: newLocation });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateLocation = (req, res, next) => {
  const updateFields = req.body;

  SettingsLocations.update(updateFields, { where: { id: req.body.id } })
  .then(newLocation => {
    res.status(201).json({ message: 'Location updated successfully', location: newLocation });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getLocationsData = (req, res, next) => {
  SettingsLocations.findAll()
  .then((locations) => {
    let locationsJSON = [];
    for (let i = 0; i < locations.length; i++) {
      locationsJSON.push(locations[i].dataValues);
    }   
    res.status(200).json(locationsJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteLocation = (req, res, next) => {
  SettingsLocations.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Location deleted successfully" });
      } else {
        res.status(404).json({ error: "Location not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const createCountry = (req, res, next) => {
  SettingsCountries.create(req.body)
  .then(newCountry => {
    res.status(201).json({ message: 'Country created successfully', country: newCountry });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateCountry = (req, res, next) => {
  const updateFields = req.body;

  SettingsCountries.update(updateFields, { where: { id: req.body.id } })
  .then(newCountry => {
    res.status(201).json({ message: 'Country updated successfully', country: newCountry });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getCountriesData = (req, res, next) => {
  SettingsCountries.findAll()
  .then((countries) => {
    let countriesJSON = [];
    for (let i = 0; i < countries.length; i++) {
      countriesJSON.push(countries[i].dataValues);
    }   
    res.status(200).json(countriesJSON);
  })
  .catch(err => {
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteCountry = (req, res, next) => {
  SettingsCountries.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Country deleted successfully" });
      } else {
        res.status(404).json({ error: "Country not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const createLanguage = (req, res, next) => {
  SettingsLanguages.create(req.body)
  .then(newLanguage => {
    res.status(201).json({ message: 'Language created successfully', language: newLanguage });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateLanguage = (req, res, next) => {
  const updateFields = req.body;

  SettingsLanguages.update(updateFields, { where: { id: req.body.id } })
  .then(newLanguage => {
    res.status(201).json({ message: 'Language updated successfully', language: newLanguage });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getLanguagesData = (req, res, next) => {
  SettingsLanguages.findAll()
  .then((languages) => {
    let languagesJSON = [];
    for (let i = 0; i < languages.length; i++) {
      languagesJSON.push(languages[i].dataValues);
    }   
    res.status(200).json(languagesJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteLanguage = (req, res, next) => {
  SettingsLanguages.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Language deleted successfully" });
      } else {
        res.status(404).json({ error: "Language not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const getDocumentsData = (req, res, next) => {
  SettingsDocuments.findAll()
  .then((documents) => {
    let documentsJSON = [];
    for (let i = 0; i < documents.length; i++) {
      documentsJSON.push(documents[i].dataValues);
    }   
    res.status(200).json(documentsJSON);
  })
  .catch(err => {
    res.status(502).json({error: "An error occurred"});
  });
};

export const createDocument = (req, res, next) => {
  const { document_name, document_type, document_content } = req.body;
  const imgUrl = generateFileUrl(req.files);

  const fields = {
    document_name: document_name,
    document_type: document_type,
    document_content: document_content,
  };

  if (imgUrl) {
    fields.document_file = imgUrl;
  }

  SettingsDocuments.create(fields)
  .then(newdocument => {
    res.status(201).json({ message: 'Document created successfully', document: newdocument });
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

export const updateDocument = (req, res, next) => {
  const { id, document_name, document_type, document_content } = req.body;
  const imgUrl = generateFileUrl(req.files);

  const updateFields = {
    document_name:document_name,
    document_type:document_type,
    document_content:document_content,
  }

  if (imgUrl) {
    updateFields.document_file = imgUrl;
  }

  SettingsDocuments.update(updateFields, { where: { id: id } })
  .then(newfamily => {
    res.status(201).json({ message: 'Document updated successfully', family: newfamily });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const deleteDocument = (req, res, next) => {
  SettingsDocuments.destroy({ where: { id: req.body.id } })
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

export const getReservationTypesData = (req, res, next) => {
  SettingsReservationTypes.findAll()
  .then((reservationTypes) => {
    let reservationTypesJSON = [];
    for (let i = 0; i < reservationTypes.length; i++) {
      reservationTypesJSON.push(reservationTypes[i].dataValues);
    }   
    res.status(200).json(reservationTypesJSON);
  })
  .catch(err => {
    res.status(502).json({error: "An error occurred"});
  });
};

export const createReservationType = (req, res, next) => {
  const { name, start_stage, print_size } = req.body;
  const imgUrl = generateFileUrl(req.files);

  const fields = {
    name: name,
    start_stage: start_stage,
    print_size: print_size,
  };

  if (imgUrl) {
    fields.img_url = imgUrl;
  }

  SettingsReservationTypes.create(fields)
  .then(newreservationType => {
    res.status(201).json({ message: 'ReservationType created successfully', reservationType: newreservationType });
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

export const updateReservationType = (req, res, next) => {
  const { id, name, start_stage, print_size } = req.body;
  const imgUrl = generateFileUrl(req.files);

  const updateFields = {
    name:name,
    start_stage:start_stage,
    print_size:print_size,
  }

  if (imgUrl) {
    updateFields.img_url = imgUrl;
  }

  SettingsReservationTypes.update(updateFields, { where: { id: id } })
  .then(newfamily => {
    res.status(201).json({ message: 'ReservationType updated successfully', family: newfamily });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const deleteReservationType = (req, res, next) => {
  SettingsReservationTypes.destroy({ where: { id: req.body.id } })
  .then((result) => {
    if (result === 1) {
      res.status(200).json({ message: "ReservationType deleted successfully" });
    } else {
      res.status(404).json({ error: "ReservationType not found" });
    }
  })
  .catch((error) => {
    if(error.original.errno == 1451 || error.original.code == 'ER_ROW_IS_REFERENCED_2' || error.original.sqlState == '23000'){
      res.status(409).json({ error: "It cannot be deleted because it is used elsewhere"});
    }else res.status(500).json({ error: "Internal server error" });
  });
};

export const createTruck = (req, res, next) => {
  SettingsTrucks.create(req.body)
  .then(newTruck => {
    res.status(201).json({ message: 'Truck created successfully', truck: newTruck });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateTruck = (req, res, next) => {
  const updateFields = req.body;

  SettingsTrucks.update(updateFields, { where: { id: req.body.id } })
  .then(newTruck => {
    res.status(201).json({ message: 'Truck updated successfully', truck: newTruck });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getTrucksData = (req, res, next) => {
  SettingsTrucks.findAll()
  .then((trucks) => {
    let trucksJSON = [];
    for (let i = 0; i < trucks.length; i++) {
      trucksJSON.push(trucks[i].dataValues);
    }   
    res.status(200).json(trucksJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteTruck = (req, res, next) => {
  SettingsTrucks.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Truck deleted successfully" });
      } else {
        res.status(404).json({ error: "Truck not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const createTimezone = (req, res, next) => {
  SettingsTimezones.create(req.body)
  .then(newTimezone => {
    res.status(201).json({ message: 'Timezone created successfully', timezone: newTimezone });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateTimezone = (req, res, next) => {
  const updateFields = req.body;

  SettingsTimezones.update(updateFields, { where: { id: req.body.id } })
  .then(newTimezone => {
    res.status(201).json({ message: 'Timezone updated successfully', timezone: newTimezone });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getTimezonesData = (req, res, next) => {
  SettingsTimezones.findAll()
  .then((timezones) => {
    let timezonesJSON = [];
    for (let i = 0; i < timezones.length; i++) {
      timezonesJSON.push(timezones[i].dataValues);
    }   
    res.status(200).json(timezonesJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteTimezone = (req, res, next) => {
  SettingsTimezones.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Timezone deleted successfully" });
      } else {
        res.status(404).json({ error: "Timezone not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const createCurrency = (req, res, next) => {
  SettingsCurrencies.create(req.body)
  .then(newCurrency => {
    res.status(201).json({ message: 'Currency created successfully', currency: newCurrency });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateCurrency = (req, res, next) => {
  const updateFields = req.body;

  SettingsCurrencies.update(updateFields, { where: { id: req.body.id } })
  .then(newCurrency => {
    res.status(201).json({ message: 'Currency updated successfully', currency: newCurrency });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getCurrenciesData = (req, res, next) => {
  SettingsCurrencies.findAll()
  .then((currencies) => {
    let currenciesJSON = [];
    for (let i = 0; i < currencies.length; i++) {
      currenciesJSON.push(currencies[i].dataValues);
    }   
    res.status(200).json(currenciesJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteCurrency = (req, res, next) => {
  SettingsCurrencies.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Currency deleted successfully" });
      } else {
        res.status(404).json({ error: "Currency not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const createDateformat = (req, res, next) => {
  SettingsDateformats.create(req.body)
  .then(newDateformat => {
    res.status(201).json({ message: 'Dateformat created successfully', dateformat: newDateformat });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateDateformat = (req, res, next) => {
  const updateFields = req.body;

  SettingsDateformats.update(updateFields, { where: { id: req.body.id } })
  .then(newDateformat => {
    res.status(201).json({ message: 'Dateformat updated successfully', dateformat: newDateformat });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getDateformatsData = (req, res, next) => {
  SettingsDateformats.findAll()
  .then((dateformats) => {
    let dateformatsJSON = [];
    for (let i = 0; i < dateformats.length; i++) {
      dateformatsJSON.push(dateformats[i].dataValues);
    }   
    res.status(200).json(dateformatsJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteDateformat = (req, res, next) => {
  SettingsDateformats.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Dateformat deleted successfully" });
      } else {
        res.status(404).json({ error: "Dateformat not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const createTimeformat = (req, res, next) => {
  SettingsTimeformats.create(req.body)
  .then(newTimeformat => {
    res.status(201).json({ message: 'Timeformat created successfully', timeformat: newTimeformat });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateTimeformat = (req, res, next) => {
  const updateFields = req.body;

  SettingsTimeformats.update(updateFields, { where: { id: req.body.id } })
  .then(newTimeformat => {
    res.status(201).json({ message: 'Timeformat updated successfully', timeformat: newTimeformat });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getTimeformatsData = (req, res, next) => {
  SettingsTimeformats.findAll()
  .then((timeformats) => {
    let timeformatsJSON = [];
    for (let i = 0; i < timeformats.length; i++) {
      timeformatsJSON.push(timeformats[i].dataValues);
    }   
    res.status(200).json(timeformatsJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteTimeformat = (req, res, next) => {
  SettingsTimeformats.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Timeformat deleted successfully" });
      } else {
        res.status(404).json({ error: "Timeformat not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const getStoreDetail = (req, res, next) => {
  SettingsStoreDetails.findOne({
    where: {
      brand_id: req.params.brandId
    }
  })
  .then((storeDetails) => {
    if (storeDetails) {
      res.status(200).json(storeDetails);
    } else {
      res.status(404).json({ error: "Store details not found" });
    }
  })
  .catch(err => {
    res.status(502).json({ error: "An error occurred" });
  });
};

export const updateStoreDetail = (req, res, next) => {
  const imgUrl = generateFileUrl(req.files);
  const updateFields = req.body;

  if (imgUrl) {
    updateFields.logo_url = imgUrl;
  }

  SettingsStoreDetails.findOrCreate({ 
    where: { brand_id: req.body.brand_id },
    defaults: updateFields
  })
  .then(([storeDetail, created]) => {
    if (created) {
      res.status(201).json({ message: 'New store detail created successfully', storeDetail });
    } else {
      storeDetail.update(updateFields)
      .then(updatedStoreDetail => {
        res.status(200).json({ message: 'Store detail updated successfully', storeDetail: updatedStoreDetail });
      })
      .catch(error => {
        res.status(500).json({ error: "Internal server error" });
      });
    }
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else {
      res.status(500).json({ error: "Internal server error" });
    }
  });
}

export const createDiscountCode = (req, res, next) => {
  SettingsDiscountCodes.create(req.body)
  .then(newDiscountCode => {
    res.status(201).json({ message: 'DiscountCode created successfully', discountCode: newDiscountCode });
    SettingsExclusions.update(
      { discountcode_id: newDiscountCode.id },
      { where: { discountcode_id: req.body.tmpId }}
    );
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else{
     res.status(500).json({ error: "Internal server error" });
     SettingsExclusions.destroy({ where: { discountcode_id: req.body.tmpId }});
    }
  });
}

export const quickAddDiscountCodesData = (req, res, next) => {
  const { rowcounts, ...discountCodesData } = req.body;
  const rows = [];

  for (let i = 0; i < rowcounts; i++) {
    let newRow = discountCodesData;
    newRow.code = `${newRow.code_prefix}${i.toString().padStart(3, '0')}`;
    newRow.type = 1;
    newRow.amount = 1;
    rows.push(SettingsDiscountCodes.create(discountCodesData));
  }

  Promise.all(rows)
    .then(newProduts => {
      res.status(201).json({ message: 'Products created successfully', products: newProduts });
    })
    .catch(error => {
      console.error('Error creating products:', error);
      res.status(500).json({ error: 'Failed to create products' });
    });
}

export const updateDiscountCode = (req, res, next) => {
  const updateFields = req.body;

  SettingsDiscountCodes.update(updateFields, { where: { id: req.body.id } })
  .then(newDiscountCode => {
    res.status(201).json({ message: 'DiscountCode updated successfully', discountCode: newDiscountCode });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getDiscountCodesData = (req, res, next) => {
  SettingsDiscountCodes.findAll()
  .then((discountCodes) => {
    let discountCodesJSON = [];
    for (let i = 0; i < discountCodes.length; i++) {
      discountCodesJSON.push(discountCodes[i].dataValues);
    }   
    res.status(200).json(discountCodesJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteDiscountCode = (req, res, next) => {
  SettingsDiscountCodes.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "DiscountCode deleted successfully" });
      } else {
        res.status(404).json({ error: "DiscountCode not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const createExclusion = (req, res, next) => {
  SettingsExclusions.create(req.body)
  .then(newExclusion => {
    res.status(201).json({ message: 'Exclusion created successfully', exclusion: newExclusion });
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

export const updateExclusion = (req, res, next) => {
  SettingsExclusions.update(req.body, { where: { id: req.body.id } })
  .then(newExclusion => {
    res.status(201).json({ message: 'Exclusion created successfully', exclusion: newExclusion });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getExclusionsData = (req, res, next) => {
  let queryOptions = {
    where: {}
  };
  if(req.body.discountcode_id) queryOptions.where.discountcode_id = req.body.discountcode_id;
  SettingsExclusions.findAll(queryOptions)
  .then((Exclusions) => {
    let ExclusionsJSON = [];
    for (let i = 0; i < Exclusions.length; i++) {
      ExclusionsJSON.push(Exclusions[i].dataValues);
    }   
    res.status(200).json(ExclusionsJSON);
  })
  .catch(err => {
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteExclusion = (req, res, next) => {
  SettingsExclusions.destroy({ where: { id: req.body.id } })
  .then((result) => {
    if (result === 1) {
      res.status(200).json({ message: "Exclusion deleted successfully" });
    } else {
      res.status(404).json({ error: "Exclusion not found" });
    }
  })
  .catch((error) => {
    if(error.original.errno == 1451 || error.original.code == 'ER_ROW_IS_REFERENCED_2' || error.original.sqlState == '23000'){
      res.status(409).json({ error: "It cannot be deleted because it is used elsewhere"});
    }else res.status(500).json({ error: "Internal server error" });
  });
};

export const deleteExclusionByDCId = (req, res, next) => {
  SettingsExclusions.destroy({ where: { discountcode_id: req.body.DiscountCodeId } })
  .then((result) => {
    if (result > 0 ) {
      res.status(200).json({ message: "Tmp exclusion deleted successfully" });
    } else {
      res.status(404).json({ error: "Tmp exclusion not found" });
    }
  })
  .catch((error) => {
    res.status(500).json({ error: "Internal server error" });
  });
};

export const createTaxcode = (req, res, next) => {
  SettingsTaxcodes.create(req.body)
  .then(newTaxcode => {
    res.status(201).json({ message: 'Taxcode created successfully', taxcode: newTaxcode });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateTaxcode = (req, res, next) => {
  const updateFields = req.body;

  SettingsTaxcodes.update(updateFields, { where: { id: req.body.id } })
  .then(newTaxcode => {
    res.status(201).json({ message: 'Taxcode updated successfully', taxcode: newTaxcode });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getTaxcodesData = (req, res, next) => {
  SettingsTaxcodes.findAll()
  .then((taxcodes) => {
    let taxcodesJSON = [];
    for (let i = 0; i < taxcodes.length; i++) {
      taxcodesJSON.push(taxcodes[i].dataValues);
    }   
    res.status(200).json(taxcodesJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteTaxcode = (req, res, next) => {
  SettingsTaxcodes.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Taxcode deleted successfully" });
      } else {
        res.status(404).json({ error: "Taxcode not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const createColorcombination = (req, res, next) => {
  SettingsColorcombinations.create(req.body)
  .then(newColorcombination => {
    res.status(201).json({ message: 'Colorcombination created successfully', colorcombination: newColorcombination });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateColorcombination = (req, res, next) => {
  const updateFields = req.body;

  SettingsColorcombinations.update(updateFields, { where: { id: req.body.id } })
  .then(newColorcombination => {
    res.status(201).json({ message: 'Colorcombination updated successfully', colorcombination: newColorcombination });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getColorcombinationsData = (req, res, next) => {
  SettingsColorcombinations.findAll()
  .then((colorcombinations) => {
    let colorcombinationsJSON = [];
    for (let i = 0; i < colorcombinations.length; i++) {
      colorcombinationsJSON.push(colorcombinations[i].dataValues);
    }   
    res.status(200).json(colorcombinationsJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteColorcombination = (req, res, next) => {
  SettingsColorcombinations.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Colorcombination deleted successfully" });
      } else {
        res.status(404).json({ error: "Colorcombination not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};