const fs = require('fs');
const path = require('path');

// Patch schema-utils to make validation functions no-ops
const patchContent = `
// Patched by postinstall to disable validation
function validate() {
  // No-op: validation disabled
}

function validateOptions() {
  // No-op: validation disabled
}

function getValidate() {
  return function() {
    // No-op: validation disabled
  };
}

exports.validate = validate;
exports.validateOptions = validateOptions;
exports.getValidate = getValidate;
exports.default = validate;
`;

const schemaUtilsIndexPath = path.join(__dirname, 'node_modules/schema-utils/dist/index.js');
if (fs.existsSync(schemaUtilsIndexPath)) {
  fs.writeFileSync(schemaUtilsIndexPath, patchContent);
  console.log('Patched schema-utils/dist/index.js');
}

const schemaUtilsValidatePath = path.join(__dirname, 'node_modules/schema-utils/dist/validate.js');
if (fs.existsSync(schemaUtilsValidatePath)) {
  fs.writeFileSync(schemaUtilsValidatePath, patchContent);
  console.log('Patched schema-utils/dist/validate.js');
}

// Patch babel-loader to remove validateOptions call
const babelLoaderPath = path.join(__dirname, 'node_modules/babel-loader/lib/index.js');
if (fs.existsSync(babelLoaderPath)) {
  let content = fs.readFileSync(babelLoaderPath, 'utf8');
  // Comment out validateOptions call
  content = content.replace(
    /validateOptions\(schema, loaderOptions, \{[\s\S]*?name: "Babel loader"[\s\S]*?\}\);/g,
    '// validateOptions removed by postinstall'
  );
  fs.writeFileSync(babelLoaderPath, content);
  console.log('Patched babel-loader');
}
