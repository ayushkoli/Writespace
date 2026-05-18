export interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
  bio: string;
  age: number;
  profilePhoto: string;
  followers: string[];
  following: string[];
  isVerified: boolean;
  country: string;
  website: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  writtenBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  userId: string | User;
  title: string;
  content: string;
  likes: string[];
  image: string;
  comments: Comment[];
  saves: string[];
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
