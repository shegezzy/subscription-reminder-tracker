import { model, Schema, type InferSchemaType } from 'mongoose';
const userSchema = new Schema({ email: { type: String, required: true, unique: true, trim: true, lowercase: true }, passwordHash: { type: String, required: true, select: false }, refreshTokenHash: { type: String, select: false }, firstName: { type: String, required: true, trim: true }, lastName: { type: String, required: true, trim: true }, timezone: { type: String, required: true, default: 'UTC' }, emailVerified: { type: Boolean, required: true, default: false } }, { timestamps: true });
export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model<User>('User', userSchema);
