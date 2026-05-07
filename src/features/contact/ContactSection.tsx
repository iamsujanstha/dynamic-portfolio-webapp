/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import { Send, MapPin, Mail, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { db, auth } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const ContactSection = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    const path = 'messages';
    try {
      // 1. Save to Firestore
      await addDoc(collection(db, path), {
        ...data,
        createdAt: serverTimestamp(),
      });

      // 2. Send Email via Backend API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      alert('Message sent successfully!');
      reset();
    } catch (error) {
      console.error('Contact Form Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    }
  };

  return (
    <section id="contact" className="py-32 px-6 md:px-12 bg-linear-to-b from-transparent to-bg-dark/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 italic text-text-main">LET'S CONNECT</h2>
            <p className="text-text-main/40 mb-12 font-light leading-relaxed max-w-md">
              Have a visionary project or just want to chat about technology? I'm always open to discussing new opportunities.
            </p>
 
            <div className="space-y-8">
              {[
                { icon: MapPin, label: 'Location', value: 'Tanahun, Gandaki, Nepal' },
                { icon: Mail, label: 'Email', value: 'sujan.sjv08@gmail.com' },
                { icon: Phone, label: 'Phone', value: '+977 9806545497' },
              ].map((item, index) => (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-6 group"
                >
                  <div className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all shadow-lg shadow-brand-primary/5">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-text-main/30 font-bold">{item.label}</span>
                    <span className="text-lg font-display text-text-main/80">{item.value}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card p-8 md:p-12 rounded-3xl border border-border-main shadow-2xl shadow-bg-dark/20"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-text-main/40 font-bold mb-2">Your Name</label>
                  <input
                    {...register('name')}
                    placeholder="Enter your name"
                    className="w-full bg-text-main/5 border border-border-main rounded-2xl p-4 text-text-main focus:outline-none focus:border-brand-primary transition-colors text-sm"
                  />
                  {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-text-main/40 font-bold mb-2">Email Address</label>
                  <input
                    {...register('email')}
                    placeholder="example@mail.com"
                    className="w-full bg-text-main/5 border border-border-main rounded-2xl p-4 text-text-main focus:outline-none focus:border-brand-primary transition-colors text-sm"
                  />
                  {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-text-main/40 font-bold mb-2">Message</label>
                <textarea
                  {...register('message')}
                  rows={5}
                  placeholder="Tell me about your project..."
                  className="w-full bg-text-main/5 border border-border-main rounded-2xl p-4 text-text-main focus:outline-none focus:border-brand-primary transition-colors text-sm resize-none"
                />
                {errors.message && <p className="text-red-400 text-[10px] mt-1">{errors.message.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send Message <Send size={18} />
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
