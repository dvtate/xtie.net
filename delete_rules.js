
// Check args
if (!process.argv[1]) {
	console.log('missing required argument(s): subdomain(s) to delete');
	process.exit(1);
}

// Parse database
const fs = require('fs');
const rules = JSON.parse(fs.readFileSync('./xtie_rules.json').toString());


// Update rules
process.argv.slice(2).forEach(sub => {
	if (!rules[sub]) {
		console.log('No rule for subdomain:', sub);
		console.log('Operation cancelled');
		process.exit(1);
	}
	console.log('Deleting rule: ', sub);
	delete rules[sub];
});

// Backup config
fs.copyFileSync('./xtie_rules.json', './xtie_rules.json.bak');
console.log('Wrote backup to xtie_rules.json.bak');

// Update database
fs.writeFileSync('./xtie_rules.json', JSON.stringify(rules));
console.log('Updated rules. Please restart xtie');
