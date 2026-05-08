import dbConnect from '../lib/db/mongodb';
import Project, { IProject } from '../models/Project';

export class ProjectService {
  static async getAllProjects() {
    await dbConnect();
    return Project.find<IProject>({}).sort({ createdAt: -1 }).exec();
  }

  static async getFeaturedProjects() {
    await dbConnect();
    return Project.find<IProject>({ featured: true }).sort({ order: 1 }).exec();
  }

  static async getProjectBySlug(slug: string) {
    await dbConnect();
    return Project.findOne({ slug }).exec();
  }

  static async createProject(data: Partial<IProject>) {
    await dbConnect();
    return Project.create(data);
  }

  static async updateProject(id: string, data: Partial<IProject>) {
    await dbConnect();
    return (Project as any).findByIdAndUpdate(id, data, { new: true }).exec();
  }

  static async deleteProject(id: string) {
    await dbConnect();
    return (Project as any).findByIdAndDelete(id).exec();
  }
}
