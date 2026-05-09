const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Need to load models
  const sectionSchema = new mongoose.Schema({}, { strict: false });
  const Section = mongoose.models.Section || mongoose.model('Section', sectionSchema);
  
  const pageSchema = new mongoose.Schema({}, { strict: false });
  const Page = mongoose.models.Page || mongoose.model('Page', pageSchema);

  const homePage = await Page.findOne({ slug: 'index' }).populate('sections').lean();
  console.log(JSON.stringify(homePage, null, 2));

  process.exit(0);
}

check();
