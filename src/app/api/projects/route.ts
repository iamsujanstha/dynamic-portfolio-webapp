import { NextResponse } from 'next/server';
import { ProjectService } from '@/services/projectService';

export async function GET() {
  try {
    const projects = await ProjectService.getAllProjects();
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const project = await ProjectService.createProject(body);
    return NextResponse.json(project, { status: 21 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
