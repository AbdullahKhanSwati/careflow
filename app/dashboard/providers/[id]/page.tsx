'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ProviderForm } from '@/components/features/providers/provider-form';
import { mockProviders } from '@/lib/mock-data';
import { useToast } from '@/components/providers/toast-provider';
import { PROVIDER_SPECIALTY_OPTIONS, PROVIDER_STATUS_OPTIONS } from '@/lib/constants/index';
import type { Provider } from '@/types';

export default function ProviderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error: showError } = useToast();
  
  const provider = mockProviders.find((p) => p.id === params.id);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Provider not found</h1>
        <Link href="/dashboard/providers">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Providers
          </Button>
        </Link>
      </div>
    );
  }

  const handleUpdate = async (data: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsEditModalOpen(false);
    success('Provider Updated', `${data.firstName} ${data.lastName} has been updated successfully.`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this provider?')) {
      success('Provider Deleted', `${provider.firstName} ${provider.lastName} has been deleted.`);
      router.push('/dashboard/providers');
    }
  };

  const specialtyLabel = PROVIDER_SPECIALTY_OPTIONS.find(s => s.value === provider.specialty)?.label;
  const statusLabel = PROVIDER_STATUS_OPTIONS.find(s => s.value === provider.status)?.label;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/providers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Header Card */}
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="flex gap-6 items-start">
            <div className="h-24 w-24 rounded-lg bg-primary/10 flex items-center justify-center">
              <div className="text-4xl font-bold text-primary">
                {provider.firstName[0]}{provider.lastName[0]}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {provider.firstName} {provider.lastName}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">{specialtyLabel}</p>
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">
                    {provider.providerType === 'individual' ? 'Individual Provider' : 'Organization'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{statusLabel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NPI Number</p>
                  <p className="font-medium">{provider.npiNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{provider.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">
                  {provider.phone}
                  {provider.phoneExtension && ` ext. ${provider.phoneExtension}`}
                </p>
              </div>
              {provider.fax && (
                <div>
                  <p className="text-sm text-muted-foreground">Fax</p>
                  <p className="font-medium">{provider.fax}</p>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold mb-4">Address</h2>
            <div className="space-y-2 text-sm">
              <p>{provider.address}</p>
              {provider.address2 && <p>{provider.address2}</p>}
              <p>
                {provider.city}, {provider.state} {provider.zipCode}
              </p>
              <p>{provider.country}</p>
            </div>
          </div>

          {/* Professional Information */}
          {(provider.licenseNumber || provider.licenseExpiry) && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold mb-4">Professional Information</h2>
              <div className="space-y-4">
                {provider.licenseNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">License Number</p>
                    <p className="font-medium">{provider.licenseNumber}</p>
                  </div>
                )}
                {provider.licenseExpiry && (
                  <div>
                    <p className="text-sm text-muted-foreground">License Expiry</p>
                    <p className="font-medium">{provider.licenseExpiry}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Primary Location</p>
                <p className="font-medium">{provider.primaryLocation ? 'Yes' : 'No'}</p>
              </div>
              {provider.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{provider.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Provider"
        description="Update provider information"
      >
        <ProviderForm
          initialData={provider}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}
