import dbConnect from '../lib/db/mongodb';
import Page, { IPage } from '../models/Page';
import Section from '../models/Section';

type PageInput = Partial<IPage> & {
  sections?: any[];
};

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
    return Page.find<IPage>({})
      .select('title slug status description metadata sections createdAt updatedAt')
      .populate({ path: 'sections', options: { sort: { order: 1 } } })
      .sort({ updatedAt: -1 })
      .exec();
  }

  static async createPage(data: PageInput) {
    await dbConnect();
    const { sections = [], ...pageData } = data;
    const createdSections = sections.length ? await Section.insertMany(sections) : [];

    return Page.create({
      ...pageData,
      sections: createdSections.map((section) => section._id),
    });
  }

  static async updatePage(id: string, data: PageInput) {
    await dbConnect();
    const { sections, ...pageData } = data;

    if (sections) {
      const currentPage = await Page.findById(id).exec();
      if (currentPage?.sections?.length) {
        await Section.deleteMany({ _id: { $in: currentPage.sections } });
      }

      const createdSections = sections.length ? await Section.insertMany(sections) : [];
      (pageData as any).sections = createdSections.map((section) => section._id);
    }

    return Page.findByIdAndUpdate(id, pageData, { new: true })
      .populate({ path: 'sections', options: { sort: { order: 1 } } })
      .exec();
  }

  static async deletePage(id: string) {
    await dbConnect();
    const page = await Page.findById(id).exec();

    if (page?.sections?.length) {
      await Section.deleteMany({ _id: { $in: page.sections } });
    }

    return Page.findByIdAndDelete(id).exec();
  }
}
