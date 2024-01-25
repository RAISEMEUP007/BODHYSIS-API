import { Sequelize } from 'sequelize';

import sequelize from '../../utils/database';

const SettingsDocuments = sequelize.define('settings_documents', {
   id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
   },
   document_name: {
      type: Sequelize.STRING,
      allowNull: false,
   },
   document_type: {
      type: Sequelize.INTEGER,
   },
   document_content: {
      type: Sequelize.STRING,
   },
   document_file: {
      type: Sequelize.STRING,
   },
}, {
   timestamps: false
});

export default SettingsDocuments;