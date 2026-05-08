import dbConnect from '../lib/db/mongodb';
import Page, { IPage } from '../models/Page';
import Section from '../models/Section';

export class PageService {
  /**
   * Fetch a full page with populated sections for rendering
   */
  static async getPageBySlug(slug: string, includeDrafts: boolean = false): Promise<IPage | null> {
    await dbConnect();
    
    const query: any = { slug };
    if (!includeDrafts) {
      query.status = 'published';
    }

    return Page.findOne(query)
      .populate({
        path: 'sections',
        match: includeDrafts ? {} : { status: 'published', isActive: true },
        options: { sort: { order: 1 } }
      })
      .exec();
  }

  static async getAllPages() {
    await dbConnect();
    return Page.find<IPage>({}).select('title slug').exec();
  }

  static async createPage(data: Partial<IPage>) {
    await dbConnect();
    return Page.create(data);
  }
}
