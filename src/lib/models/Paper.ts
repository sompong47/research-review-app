import mongoose from '../db';

const { Schema } = mongoose;

const PaperSchema = new Schema(
	{
		title: { type: String, required: true, trim: true },
		authors: { type: [String], default: [] },
		abstract: { type: String },
		fileUrl: { type: String, required: true },
		thumbnailUrl: { type: String },
		status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
	},
	{ timestamps: true }
);

const Paper = mongoose.models.Paper || mongoose.model('Paper', PaperSchema);

export default Paper;
