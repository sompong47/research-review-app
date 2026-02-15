import mongoose from '../db';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'reviewer'], default: 'reviewer' },
    evaluatedPaperIds: [{ type: Schema.Types.ObjectId, ref: 'Paper' }],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
