import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: UserRole;
  emailVerified?: Date;
  /** AES-256-GCM encrypted TOTP secret (stored as iv:authTag:ciphertext) */
  totpSecret?: string;
  /** Set to true after the user successfully verifies their first TOTP code */
  totpVerified?: boolean;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false }, // Only for credentials sign in
  image: String,
  role: { type: String, enum: Object.values(UserRole), default: UserRole.VIEWER },
  emailVerified: Date,
  totpSecret: { type: String, select: false },   // Never returned by default — like password
  totpVerified: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User as mongoose.Model<IUser>;
