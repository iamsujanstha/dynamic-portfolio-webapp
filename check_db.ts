import mongoose from 'mongoose';
import Page from './src/models/Page';
import Section from './src/models/Section';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const homePage = await Page.findOne({ slug: 'index' }).populate('sections').lean();
  console.log(JSON.stringify(homePage, null, 2));
  process.exit(0);
}
check();
