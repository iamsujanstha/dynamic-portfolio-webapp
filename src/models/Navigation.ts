import mongoose, { Schema, Document } from 'mongoose';

export interface INavItem {
  label: string;
  href: string;
  isExternal: boolean;
  order: number;
  children?: INavItem[];
}

export interface INavigation extends Document {
  key: string; // 'header', 'footer-primary'
  items: INavItem[];
}

const NavItemSchema = new Schema<INavItem>({
  label: { type: String, required: true },
  href: { type: String, required: true },
  isExternal: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
});

const NavigationSchema = new Schema<INavigation>({
  key: { type: String, required: true, unique: true },
  items: [NavItemSchema],
}, { timestamps: true });

export default mongoose.models.Navigation || mongoose.model<INavigation>('Navigation', NavigationSchema);
