/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project } from '../types';

const GITHUB_USERNAME = 'iamsujanstha';

export async function fetchGitHubProjects(): Promise<Project[]> {
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`, {
      headers: {
        // Only add token if it starts with VITE_ to be exposed to client
        ...(import.meta.env.VITE_GITHUB_TOKEN ? { Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch repositories from GitHub');
    }

    const repos = await response.json();

    return repos.map((repo: any) => ({
      id: repo.id.toString(),
      title: repo.name.replace(/-/g, ' ').toUpperCase(),
      description: repo.description || 'No description available for this repository.',
      tags: repo.topics && repo.topics.length > 0 ? repo.topics.slice(0, 4) : [repo.language].filter(Boolean),
      category: determineCategory(repo),
      image: `https://opengraph.githubassets.com/1/${repo.full_name}`, // Dynamic OG image from GitHub
      link: repo.homepage || repo.html_url,
      github: repo.html_url,
    }));
  } catch (error) {
    console.error('Error fetching GitHub projects:', error);
    return [];
  }
}

function determineCategory(repo: any): 'web' | 'mobile' | 'ai' | 'design' {
  const name = repo.name.toLowerCase();
  const description = (repo.description || '').toLowerCase();
  const topics = (repo.topics || []).map((t: string) => t.toLowerCase());

  if (topics.includes('ai') || topics.includes('machine-learning') || name.includes('ai') || description.includes('ai')) {
    return 'ai';
  }
  if (topics.includes('mobile') || topics.includes('android') || topics.includes('ios')) {
    return 'mobile';
  }
  if (topics.includes('design') || topics.includes('ui') || topics.includes('ux') || name.includes('design')) {
    return 'design';
  }
  return 'web';
}
