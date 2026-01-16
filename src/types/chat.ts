import type {
  Conversation,
  Message,
  User,
  Vehicle,
  VehicleImage,
  Brand,
  Model,
} from "@prisma/client";

// ==================== Conversation Types ====================

export type ConversationWithDetails = Conversation & {
  vehicle: Pick<Vehicle, "id" | "slug" | "title" | "price"> & {
    images: Pick<VehicleImage, "url" | "isPrimary">[];
    brand: Pick<Brand, "name">;
    model: Pick<Model, "name">;
  };
  buyer: Pick<User, "id" | "name" | "image">;
  seller: Pick<User, "id" | "name" | "image">;
  messages: MessageWithSender[];
};

export type ConversationListItem = Pick<
  Conversation,
  | "id"
  | "vehicleId"
  | "buyerId"
  | "sellerId"
  | "lastMessageAt"
  | "buyerUnreadCount"
  | "sellerUnreadCount"
  | "isArchivedByBuyer"
  | "isArchivedBySeller"
> & {
  vehicle: Pick<Vehicle, "id" | "slug" | "title" | "price"> & {
    images: Pick<VehicleImage, "url" | "isPrimary">[];
    brand: Pick<Brand, "name">;
    model: Pick<Model, "name">;
  };
  buyer: Pick<User, "id" | "name" | "image">;
  seller: Pick<User, "id" | "name" | "image">;
  lastMessage: Pick<Message, "content" | "createdAt" | "senderId"> | null;
};

// ==================== Message Types ====================

export type MessageWithSender = Message & {
  sender: Pick<User, "id" | "name" | "image">;
};

// ==================== API Response Types ====================

export interface UnreadCountResponse {
  total: number;
  asBuyer: number;
  asSeller: number;
}

export interface CreateConversationRequest {
  vehicleId: string;
}

export interface CreateConversationResponse {
  conversationId: string;
  isNew: boolean;
}

export interface SendMessageRequest {
  content: string;
}

export interface ConversationsListResponse {
  conversations: ConversationListItem[];
  total: number;
}

export interface MessagesListResponse {
  messages: MessageWithSender[];
  conversation: Pick<
    ConversationWithDetails,
    "id" | "vehicleId" | "buyerId" | "sellerId" | "vehicle" | "buyer" | "seller"
  >;
}

// ==================== Component Props Types ====================

export interface ChatButtonProps {
  vehicleId: string;
  sellerId: string;
  vehicleTitle: string;
  currentUserId?: string;
  className?: string;
}

export interface ConversationItemProps {
  conversation: ConversationListItem;
  currentUserId: string;
}

export interface MessageBubbleProps {
  message: MessageWithSender;
  isOwn: boolean;
}

export interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
}
