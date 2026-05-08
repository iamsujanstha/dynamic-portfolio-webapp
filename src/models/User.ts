import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  emailVerified?: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: String,
  role: { type: String, enum: Object.values(UserRole), default: UserRole.VIEWER },
  emailVerified: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User as mongoose.Model<IUser>;
