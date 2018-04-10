'use strict';

const rfr = require('rfr');
const formatExcel = rfr('/formatExcel');

const sameColumnsInFormat = (xlsx) => {
  return Object.keys(formatExcel)
    .every(formatModel =>
      Object.keys(formatExcel[formatModel])
        .every(colLetter => {
          const cleanXlsxHeader = xlsx[`${colLetter}1`].v.replace(/\s+/g, ' ').trim();
          const cleanFormat = formatExcel[formatModel][colLetter].xlsx.replace(/\s+/g, ' ').trim();
          return cleanFormat === cleanXlsxHeader;
        }));
};

const getSpecies = (speciesSheet, row) => {
  const species = {};
  Object.keys(formatExcel.speciesFormat).forEach(col => {
    species[formatExcel.speciesFormat[col].db.column] = speciesSheet[`${col}${row}`] ? speciesSheet[`${col}${row}`].v : '';
  });
  return species.scientist_name !== '' ? species : null;
};

const getRegions = (speciesSheet, row) => {
  return Object.keys(formatExcel.regionsFormat)
    .filter(col => speciesSheet[`${col}${row}`].v !== 0)
    .map(col => {
      return {
        name: formatExcel.regionsFormat[col].xlsx,
        val: speciesSheet[`${col}${row}`].v,
      };
    });
};

const getValidCategories = (speciesSheet, row) => {
  const regRemoveExtra = /\(.*?\)|{.*?}|\[.*?]/g;
  const cleanCategories = textCategories => {
    let categories = textCategories.replace(regRemoveExtra, '').split(/[,;\n-]/);
    categories = categories.map(c => c.trim());
    categories = categories.filter(c => c !== '');
    return categories;
  };

  let categories = [];
  Object.keys(formatExcel.validCategoryFormat).forEach(col => {
    const textCategories = speciesSheet[`${col}${row}`].v;
    categories = cleanCategories(textCategories);
  });
  return categories;
};


const parseInfo = speciesSheet => {
  const rows = parseInt(speciesSheet['!ref'].replace(/.*?(\d+)$/, '$1'), 10);
  const species = [];
  for (let row = 2; row <= rows; row++) {
    species.push({
      species: getSpecies(speciesSheet, row),
      regions: getRegions(speciesSheet, row),
      categories: getValidCategories(speciesSheet, row),
    });
  }
  return species;
};

const parseXlsx = (speciesSheet) => {
  if (sameColumnsInFormat(speciesSheet)) {
    return parseInfo(speciesSheet);
  } else {
    console.error('Excel have a change in headers!!!');
  }
};

module.exports = parseXlsx;