import { z } from 'zod';

export const branchFormSchema = z.object({
  title: z.string().min(1, 'Branch name is required').max(255),
  code: z.string().min(1, 'Branch code is required').max(50),
  structureId: z.string().min(1, 'Parent structure is required'),
  type: z.enum(['primary_branch', 'secondary_branch', 'clinic', 'satellite_center']),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']),
  license: z.string().min(1, 'License number is required'),
  licenseExpiry: z.string().min(1, 'License expiry date is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  address: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  county: z.string().min(1, 'County is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(1, 'Phone is required'),
  phoneExtension: z.string().optional(),
  email: z.string().email('Valid email is required'),
  fax: z.string().optional(),
  website: z.string().url('Valid URL is required').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;
