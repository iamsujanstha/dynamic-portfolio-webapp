import dbConnect from '../lib/db/mongodb';
import Section, { ISection } from '../models/Section';

export class SectionService {
  static async getAllSections() {
    await dbConnect();
    return Section.find<ISection>({}).sort({ order: 1, createdAt: -1 }).exec();
  }

  static async createSection(data: Partial<ISection>) {
    await dbConnect();
    return Section.create(data);
  }

  static async updateSection(id: string, data: Partial<ISection>) {
    await dbConnect();
    return Section.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  static async deleteSection(id: string) {
    await dbConnect();
    return Section.findByIdAndDelete(id).exec();
  }
}
