export type Student = {
  id: string
  displayName: string
  email?: string
  university?: string
}

export type Profile = {
  id: string
  studentId: string
  bio?: string
  avatarUrl?: string
}

export type Connection = {
  id: string
  studentId: string
  connectedStudentId: string
}

export type Community = {
  id: string
  name: string
  description?: string
  private?: boolean
}

export type CommunityMember = {
  communityId: string
  studentId: string
  role?: string
}

export type CommunityPost = {
  id: string
  communityId: string
  author: string
  text: string
  createdAt: string
}

export type Comment = {
  id: string
  postId: string
  author: string
  text: string
  createdAt: string
}

export type Conversation = {
  id: string
  participantIds: string[]
  title?: string
}

export type Message = {
  id: string
  conversationId?: string
  from: string
  text: string
  createdAt?: string
}

export type SquareItem = {
  id: string
  title: string
  kind: string
  excerpt?: string
}

export type SearchResult = {
  id: string
  type: 'student' | 'community' | 'post'
  title: string
  subtitle?: string
}
