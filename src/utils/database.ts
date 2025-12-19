import { User } from '../types';

const mockUsers: Record<number, User> = {
  1: { id: 1, name: "John Doe", email: "john@example.com" },
  2: { id: 2, name: "Jane Smith", email: "jane@example.com" },
  3: { id: 3, name: "Alice Johnson", email: "alice@example.com" }
};

export const fetchUserFromDB = async (id: number): Promise<User | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockUsers[id] || null;
};

export const createUserInDB = async (user: Omit<User, 'id'>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const id = Math.max(...Object.keys(mockUsers).map(Number)) + 1;
  const newUser = { id, ...user };
  mockUsers[id] = newUser;
  return newUser;
};

export const getAllUsers = (): User[] => {
  return Object.values(mockUsers);
};