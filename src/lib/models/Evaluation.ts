import mongoose from '../db';

const { Schema } = mongoose;

const ScoresSchema = new Schema(
	{
		originality: { type: Number, min: 0, max: 5, required: true },
		methodology: { type: Number, min: 0, max: 5, required: true },
		clarity: { type: Number, min: 0, max: 5, required: true },
		significance: { type: Number, min: 0, max: 5, required: true },
		overall: { type: Number, min: 0, max: 5 },
	},
	{ _id: false }
);

const EvaluationSchema = new Schema(
	{
		paper: { type: Schema.Types.ObjectId, ref: 'Paper', required: true },
		scores: { type: ScoresSchema, required: true },
		comments: { type: String },
		// Do NOT store user id here to preserve anonymity of content. Track who evaluated via User.evaluatedPaperIds instead.
	},
	{ timestamps: true }
);

const Evaluation = mongoose.models.Evaluation || mongoose.model('Evaluation', EvaluationSchema);

export default Evaluation;
