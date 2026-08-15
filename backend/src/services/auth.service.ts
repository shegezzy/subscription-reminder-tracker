import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model.js';
import { AppError } from '../utils/app-error.js';

export interface RegistrationInput { email: string; password: string; firstName: string; lastName: string; }
export interface LoginInput { email: string; password: string; }

export async function register(input: RegistrationInput) {
  const email = input.email.trim().toLowerCase();
  if (await UserModel.exists({ email })) throw new AppError(409, 'EMAIL_IN_USE', 'An account with this email already exists.');
  const passwordHash = await bcrypt.hash(input.password, 12);
  return UserModel.create({ email, passwordHash, firstName: input.firstName.trim(), lastName: input.lastName.trim() });
}

export async function login(input: LoginInput) {
  const user = await UserModel.findOne({ email: input.email.trim().toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  return user;
}
