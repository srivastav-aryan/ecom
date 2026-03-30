import mongoose from 'mongoose';

export interface ICategory  extends Document {
    name: string;
    slug: string;
    description: string;
    parent: mongoose.Types.ObjectId | null;
    isActive: boolean
}

const categorySchema = new mongoose.Schema<ICategory>({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
},{timestamps: true});


export const Category = mongoose.model<ICategory>('Category', categorySchema);
