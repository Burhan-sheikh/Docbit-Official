/**
 * Team Support — placeholder architecture for team-based collaboration.
 * Teams are represented by a `team_members` join table (to be added in a future
 * migration). For now, this module exposes the interface the UI will call.
 */
import type { PlanId } from './plans';

export interface TeamMember {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  planId: PlanId;
  memberCount: number;
  createdAt: string;
}

export async function getTeam(_userId: string): Promise<Team | null> {
  return null;
}

export async function getTeamMembers(_teamId: string): Promise<TeamMember[]> {
  return [];
}

export async function inviteTeamMember(_teamId: string, _email: string): Promise<void> {
  throw new Error('Team invites not yet enabled');
}

export async function removeTeamMember(_teamId: string, _memberId: string): Promise<void> {
  throw new Error('Team management not yet enabled');
}
