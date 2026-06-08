import mongoose, { Schema, Document } from 'mongoose';

export interface IVerificationCode extends Document {
  email: string;
  code: string;
  createdAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // TTL index: expires in 600 seconds (10 minutes)
});

const VerificationCode = mongoose.models.VerificationCode || mongoose.model<IVerificationCode>('VerificationCode', VerificationCodeSchema);
export default VerificationCode as mongoose.Model<IVerificationCode>;
